import { Loader2, ZoomIn, ZoomOut } from "lucide-react";
import { browserRenderer } from "../renderer";
import { useEffect, useRef, useState } from "react";

interface PreviewProps {
  canvas: HTMLCanvasElement | null;
  isRunning: boolean;
  borderless?: boolean;
}

export function Preview({ canvas, isRunning, borderless = false }: PreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  // Reset zoom when canvas changes
  useEffect(() => {
    if (canvas) setZoom(1);
  }, [canvas]);

  const zoomIn = () => setZoom((z) => Math.min(z * 1.25, 8));
  const zoomOut = () => setZoom((z) => Math.max(z / 1.25, 0.1));
  const resetZoom = () => setZoom(1);

  return (
    <div className={`flex flex-col h-full bg-neutral-50 ${borderless ? "" : "border-l border-neutral-200"}`}>
      {/* Preview header */}
      <div className="flex items-center gap-2 px-3 h-8 bg-neutral-100 border-b border-neutral-200 text-xs text-neutral-500 shrink-0">
        <span className="font-medium text-neutral-700">Preview</span>
        {canvas && (
          <span className="text-neutral-400">
            {Math.round(canvas.width / browserRenderer.dpr())} ×{" "}
            {Math.round(canvas.height / browserRenderer.dpr())} px
          </span>
        )}
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={zoomOut}
            className="p-0.5 hover:bg-neutral-200 rounded cursor-pointer"
            title="Zoom out"
          >
            <ZoomOut size={13} />
          </button>
          <button
            onClick={resetZoom}
            className="px-1.5 text-xs hover:bg-neutral-200 rounded cursor-pointer"
            title="Reset zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={zoomIn}
            className="p-0.5 hover:bg-neutral-200 rounded cursor-pointer"
            title="Zoom in"
          >
            <ZoomIn size={13} />
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-auto checkerboard relative"
      >
        {isRunning && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
            <Loader2 size={24} className="animate-spin text-neutral-400" />
          </div>
        )}

        {canvas ? (
          <div className="min-h-full min-w-full flex items-start justify-center p-4 md:p-8">
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "top center",
                transition: "transform 0.15s ease",
                display: "block",
                width: "100%",
              }}
            >
              <CanvasDisplay canvas={canvas} />
            </div>
          </div>
        ) : !isRunning ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 gap-2">
            <div className="text-3xl">🎨</div>
            <p className="text-sm">Press Run or Ctrl+Enter to render</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CanvasDisplay({ canvas }: { canvas: HTMLCanvasElement }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Clear previous canvas
    while (el.firstChild) el.removeChild(el.firstChild);
  
    const naturalW = canvas.width;
    const naturalH = canvas.height;
    void naturalW;
    void naturalH;
    canvas.style.width = "100%";
    canvas.style.height = "auto";
    canvas.style.maxWidth = "100%";
    canvas.style.display = "block";

    el.appendChild(canvas);
  }, [canvas]);

  return (
    <div
      ref={ref}
      className="w-full overflow-hidden rounded shadow-lg"
      style={{ display: "block" }}
    />
  );
}
