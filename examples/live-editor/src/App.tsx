import { useCallback, useEffect, useRef, useState } from "react";
import { render, type SoneNode } from "sone";
import { Editor } from "./components/Editor";
import { FontPanel } from "./components/FontPanel";
import { Preview } from "./components/Preview";
import { Toolbar } from "./components/Toolbar";
import { DEFAULT_CODE } from "./default-code";
import { exportAsJPEG, exportAsPNG } from "./export";
import { browserRenderer, createRenderer, type RenderDebugOptions } from "./renderer";
import { executeCode } from "./execute";
import { workerBridge } from "./worker-bridge";
import RenderWorker from "./render-worker.ts?worker";

const STORAGE_KEY = "sone-editor-code";

function loadCode(): string {
  try { return localStorage.getItem(STORAGE_KEY) || DEFAULT_CODE; }
  catch { return DEFAULT_CODE; }
}

function saveCode(code: string) {
  try { localStorage.setItem(STORAGE_KEY, code); } catch {}
}

/** Draw an ImageBitmap onto a new HTMLCanvasElement and return it. */
function bitmapToCanvas(bitmap: ImageBitmap): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
  bitmap.close();
  return canvas;
}

export default function App() {
  const [code, setCode] = useState(loadCode);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [lastNode, setLastNode] = useState<SoneNode>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fontsOpen, setFontsOpen] = useState(false);
  const [autoRun, setAutoRun] = useState(true);
  const [debugEnabled, setDebugEnabled] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Spawn worker once
  useEffect(() => {
    const worker = new RenderWorker();
    workerRef.current = worker;
    workerBridge.worker = worker;

    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data as Record<string, unknown>;
      const { id } = msg as { id: number };

      // Ignore stale responses
      if (id !== requestIdRef.current) return;

      setIsRunning(false);
      if (msg.type === "result") {
        const { bitmap, width, height } = msg as { bitmap: ImageBitmap; width: number; height: number };
        void width; void height;
        setCanvas(bitmapToCanvas(bitmap));
        setError(null);
      } else if (msg.type === "error") {
        setError((msg as { message: string }).message);
      }
    };

    return () => {
      worker.terminate();
      workerBridge.worker = null;
    };
  }, []);

  const runCode = useCallback((codeToRun: string) => {
    const id = ++requestIdRef.current;
    setIsRunning(true);
    setError(null);

    const dpr = browserRenderer.dpr();
    const debug: RenderDebugOptions = {
      layout: debugEnabled,
      text: debugEnabled,
    };
    workerRef.current!.postMessage({ type: "render", id, code: codeToRun, dpr, debug });

    // Also evaluate on main thread to keep lastNode up-to-date for exports
    executeCode(codeToRun)
      .then((node) => { if (node != null) setLastNode(node); })
      .catch(() => {});
  }, [debugEnabled]);

  const handleRun = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    runCode(code);
  }, [code, runCode]);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    saveCode(newCode);
    if (!autoRun) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runCode(newCode), 60);
  }, [autoRun, runCode]);

  useEffect(() => { runCode(code); }, [debugEnabled]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const handleExport = useCallback(async (format: "png" | "jpeg") => {
    if (!lastNode) return;
    const debug: RenderDebugOptions = {
      layout: debugEnabled,
      text: debugEnabled,
    };
    const exportCanvas = await render<HTMLCanvasElement>(lastNode, createRenderer(1, debug));
    if (format === "png") exportAsPNG(exportCanvas);
    else exportAsJPEG(exportCanvas);
  }, [debugEnabled, lastNode]);

  return (
    <div className="flex flex-col h-full bg-white">
      <Toolbar
        onRun={handleRun}
        onExportPNG={() => handleExport("png")}
        onExportJPEG={() => handleExport("jpeg")}
        onLoadTemplate={(c) => { setCode(c); saveCode(c); runCode(c); }}
        onToggleFonts={() => setFontsOpen((v) => !v)}
        onToggleAutoRun={() => setAutoRun((v) => !v)}
        onToggleDebug={() => setDebugEnabled((v) => !v)}
        isRunning={isRunning}
        hasCanvas={canvas !== null}
        fontsOpen={fontsOpen}
        autoRun={autoRun}
        debugEnabled={debugEnabled}
      />
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-w-0 border-r border-neutral-200">
          <Editor value={code} onChange={handleCodeChange} onRun={handleRun} error={error} />
        </div>
        <div className="flex-1 min-w-0">
          <Preview canvas={canvas} isRunning={isRunning} />
        </div>
        {fontsOpen && <FontPanel onClose={() => setFontsOpen(false)} />}
      </div>
    </div>
  );
}
