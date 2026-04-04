import MonacoEditor, { loader, type OnMount } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import githubLight from "./github.json";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { setupMonaco } from "../monaco-setup";

loader.init().then((monaco) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  monaco.editor.defineTheme("github-light", githubLight as any);
});

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  error: string | null;
}

export interface EditorHandle {
  insertAtCursor: (text: string) => void;
}

export const Editor = forwardRef<EditorHandle, EditorProps>(function Editor(
  { value, onChange, onRun, error },
  ref,
) {
  const monacoRef = useRef<typeof Monaco | null>(null);
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleMount: OnMount = (editor, monaco) => {
    monacoRef.current = monaco;
    editorRef.current = editor;
    setupMonaco(monaco); // synchronous now — no fetch involved

    // Cmd/Ctrl+Enter to run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRun();
    });

    // Focus editor
    editor.focus();
  };

  useImperativeHandle(ref, () => ({
    insertAtCursor(text: string) {
      const editor = editorRef.current;
      const monaco = monacoRef.current;
      const model = editor?.getModel();
      if (!editor || !monaco || !model) return;

      const selection = editor.getSelection() ?? new monaco.Selection(
        model.getLineCount(),
        model.getLineMaxColumn(model.getLineCount()),
        model.getLineCount(),
        model.getLineMaxColumn(model.getLineCount()),
      );

      editor.executeEdits("insert-photo", [
        {
          range: selection,
          text,
          forceMoveMarkers: true,
        },
      ]);
      editor.focus();
    },
  }), []);

  // Re-register run shortcut when onRun changes
  useEffect(() => {}, [onRun]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 h-8 bg-neutral-100 border-b border-neutral-200 text-xs text-neutral-500 shrink-0">
        <span className="font-medium text-neutral-700">editor.ts</span>
        <span className="ml-auto">Ctrl+Enter to run</span>
      </div>

      <div className="flex-1 min-h-0">
        <MonacoEditor
          height="100%"
          language="typescript"
          value={value}
          onChange={(v) => onChange(v ?? "")}
          onMount={handleMount}
          options={{
            fontSize: 13,
            fontFamily:
              "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            fontLigatures: true,
            lineHeight: 1.6,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            tabSize: 2,
            padding: { top: 16, bottom: 16 },
            renderLineHighlight: "gutter",
            smoothScrolling: true,
            bracketPairColorization: { enabled: true },
            guides: { bracketPairs: true },
            suggest: {
              showKeywords: true,
              showSnippets: true,
            },
          }}
          theme="github-light"
        />
      </div>

      {error && (
        <div className="shrink-0 px-3 py-2 bg-red-50 border-t border-red-200 text-xs text-red-700 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
          {error}
        </div>
      )}
    </div>
  );
});
