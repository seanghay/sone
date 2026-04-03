import { ChevronDown, Download, LayoutTemplate, Play, Type, Zap } from "lucide-react";
import { useState } from "react";
import { TEMPLATES } from "../templates";
import Icon from '../sone.svg?react'

interface ToolbarProps {
  onRun: () => void;
  onExportPNG: () => void;
  onExportJPEG: () => void;
  onLoadTemplate: (code: string) => void;
  onToggleFonts: () => void;
  onToggleAutoRun: () => void;
  isRunning: boolean;
  hasCanvas: boolean;
  fontsOpen: boolean;
  autoRun: boolean;
}

export function Toolbar({
  onRun,
  onExportPNG,
  onExportJPEG,
  onLoadTemplate,
  onToggleFonts,
  onToggleAutoRun,
  isRunning,
  hasCanvas,
  fontsOpen,
  autoRun,
}: ToolbarProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);

  const close = () => setExportOpen(false);

  return (
    <div className="flex items-center gap-2 px-4 h-12 bg-black text-white shrink-0 select-none">
      {/* Brand */}
      <div className="flex items-center gap-2 mr-3">
        <div className="w-5 h-5 rounded-sm flex items-center justify-center">
          <Icon/>
        </div>
        <span className="text-sm font-semibold tracking-tight">Sone Live Editor</span>
      </div>

      {/* Templates dropdown */}
      <div className="relative">
        <button
          onClick={() => setTemplatesOpen((v) => !v)}
          className="flex items-center gap-1.5 px-3 h-7 bg-neutral-800 text-white text-xs font-medium rounded hover:bg-neutral-700 transition-colors cursor-pointer"
        >
          <LayoutTemplate size={12} />
          Templates
          <ChevronDown size={10} className={`transition-transform ${templatesOpen ? "rotate-180" : ""}`} />
        </button>
        {templatesOpen && (
          <div className="absolute left-0 top-9 w-56 bg-white text-black rounded shadow-lg border border-neutral-200 py-1 z-50">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => { onLoadTemplate(t.code); setTemplatesOpen(false); }}
                className="w-full text-left px-3 py-2 hover:bg-neutral-50 cursor-pointer"
              >
                <p className="text-xs font-medium text-neutral-900">{t.label}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{t.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Auto-run toggle */}
      <button
        onClick={onToggleAutoRun}
        title={autoRun ? "Auto-run on" : "Auto-run off"}
        className={`flex items-center gap-1.5 px-3 h-7 text-xs font-medium rounded transition-colors cursor-pointer ${
          autoRun ? "bg-white text-black" : "bg-neutral-800 text-white hover:bg-neutral-700"
        }`}
      >
        <Zap size={12} />
        Auto
      </button>

      {/* Run button */}
      <button
        onClick={onRun}
        disabled={isRunning}
        className="flex items-center gap-1.5 px-3 h-7 bg-white text-black text-xs font-semibold rounded hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <Play size={12} />
        {isRunning ? "Running…" : "Run"}
      </button>

      {/* Export dropdown */}
      <div className="relative">
        <button
          onClick={() => setExportOpen((v) => !v)}
          disabled={!hasCanvas}
          className="flex items-center gap-1.5 px-3 h-7 bg-neutral-800 text-white text-xs font-medium rounded hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <Download size={12} />
          Export
          <ChevronDown size={10} className={`transition-transform ${exportOpen ? "rotate-180" : ""}`} />
        </button>

        {exportOpen && (
          <div className="absolute right-0 top-9 w-44 bg-white text-black rounded shadow-lg border border-neutral-200 py-2 z-50">
            <div>
              {[
                { label: "PNG", action: () => { onExportPNG(); close(); } },
                { label: "JPEG", action: () => { onExportJPEG(); close(); } },
              ].map(({ label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-100 cursor-pointer"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fonts toggle */}
      <button
        onClick={onToggleFonts}
        className={`flex items-center gap-1.5 px-3 h-7 text-xs font-medium rounded transition-colors cursor-pointer ${
          fontsOpen ? "bg-white text-black" : "bg-neutral-800 text-white hover:bg-neutral-700"
        }`}
      >
        <Type size={12} />
        Fonts
      </button>
    </div>
  );
}
