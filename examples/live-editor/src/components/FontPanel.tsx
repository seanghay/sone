import { Check, Copy, Loader2, Plus, Search, Upload, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchAllFonts,
  loadCustomFontFile,
  loadFontFromCDN,
  type FontMeta,
  unloadFont,
} from "../fonts";

interface LoadedFont {
  id: string;
  name: string;
}

interface FontPanelProps {
  onClose: () => void;
  mobile?: boolean;
}

const MAX_RESULTS = 80;

export function FontPanel({ onClose, mobile = false }: FontPanelProps) {
  const [allFonts, setAllFonts] = useState<FontMeta[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [query, setQuery] = useState("");
  const [loadedFonts, setLoadedFonts] = useState<LoadedFont[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [copiedFontId, setCopiedFontId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAllFonts()
      .then(setAllFonts)
      .catch((e) => setFetchError(e.message))
      .finally(() => setIsFetching(false));
    searchRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? allFonts.filter((f) => f.family.toLowerCase().includes(q) || f.id.includes(q))
      : allFonts;
    return filtered.slice(0, MAX_RESULTS);
  }, [allFonts, query]);

  async function handleLoad(id: string, name: string) {
    if (loadedFonts.find((f) => f.id === id)) return;
    setLoading(id);
    setLoadError(null);
    try {
      await loadFontFromCDN(id, name);
      setLoadedFonts((prev) => [...prev, { id, name }]);
    } catch {
      setLoadError(`Failed to load "${name}".`);
    } finally {
      setLoading(null);
    }
  }

  async function handleUpload(fileList: FileList | null) {
    if (!fileList?.length) return;

    setLoadError(null);
    const existingNames = new Set(loadedFonts.map((font) => font.name));

    for (const file of Array.from(fileList)) {
      const valid = /\.ttf$/i.test(file.name) || file.type === "font/ttf";
      if (!valid) {
        setLoadError(`Unsupported file "${file.name}". Upload a .ttf font.`);
        continue;
      }

      const id = `custom:${file.name}:${file.lastModified}:${file.size}`;
      if (loadedFonts.find((font) => font.id === id)) continue;

      const rawName = file.name.replace(/\.[^.]+$/, "").trim() || "Custom Font";
      let name = rawName;
      let suffix = 2;
      while (existingNames.has(name)) {
        name = `${rawName} ${suffix++}`;
      }
      existingNames.add(name);

      setLoading(id);
      try {
        await loadCustomFontFile(id, name, file);
        setLoadedFonts((prev) => [...prev, { id, name }]);
      } catch {
        setLoadError(`Failed to load "${file.name}".`);
      } finally {
        setLoading(null);
      }
    }
  }

  function handleUnload(id: string, name: string) {
    unloadFont(id, name);
    setLoadedFonts((prev) => prev.filter((f) => f.id !== id));
  }

  async function handleCopyFontName(id: string, name: string) {
    try {
      await navigator.clipboard.writeText(name);
      setCopiedFontId(id);
      window.setTimeout(() => {
        setCopiedFontId((current) => (current === id ? null : current));
      }, 1200);
    } catch {
      setLoadError(`Failed to copy "${name}".`);
    }
  }

  return (
    <div className={`h-full w-full min-w-0 bg-white flex flex-col ${mobile ? "" : "border-l border-neutral-200"}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-neutral-200 shrink-0">
        <span className="text-sm font-semibold">Fonts</span>
        <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded cursor-pointer">
          <X size={14} />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-neutral-100 shrink-0">
        <div className="mb-2 flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 cursor-pointer"
          >
            <Upload size={12} />
            Upload TTF
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".ttf,font/ttf"
            multiple
            className="hidden"
            onChange={(e) => {
              void handleUpload(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded">
          <Search size={12} className="text-neutral-400 shrink-0" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search fonts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-xs bg-transparent focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-neutral-400 hover:text-neutral-600 cursor-pointer">
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Loaded fonts */}
      {loadedFonts.length > 0 && (
        <div className="px-3 pt-3 pb-1 border-b border-neutral-100 shrink-0">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1.5">Loaded</p>
          <div className="space-y-1">
            {loadedFonts.map(({ id, name }) => (
              <div key={id} className="flex items-center justify-between px-2.5 py-1.5 bg-neutral-50 rounded text-xs">
                <div className="min-w-0">
                  <span className="font-medium truncate block">{name}</span>
                  <span className="text-neutral-400">.font("{name}")</span>
                </div>
                <div className="ml-2 flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => void handleCopyFontName(id, name)}
                    title={copiedFontId === id ? "Copied" : "Copy font name"}
                    className={`p-1 rounded cursor-pointer ${
                      copiedFontId === id
                        ? "bg-green-100 text-green-700"
                        : "hover:bg-neutral-200 text-neutral-400"
                    }`}
                  >
                    {copiedFontId === id ? <Check size={11} /> : <Copy size={11} />}
                  </button>
                  <button
                    onClick={() => handleUnload(id, name)}
                    className="p-1 hover:bg-neutral-200 rounded cursor-pointer text-neutral-400"
                    title="Unload font"
                  >
                    <X size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loadError && (
        <p className="mx-3 mt-2 text-xs text-red-600 bg-red-50 px-2 py-1.5 rounded shrink-0">{loadError}</p>
      )}

      {/* Font list */}
      <div className="flex-1 overflow-y-auto">
        {isFetching ? (
          <div className="flex items-center justify-center h-24 text-neutral-400">
            <Loader2 size={16} className="animate-spin" />
          </div>
        ) : fetchError ? (
          <p className="px-3 py-4 text-xs text-red-600">{fetchError}</p>
        ) : (
          <>
            <div className="px-3 pt-2 pb-1">
              <p className="text-xs text-neutral-400">
                {query
                  ? `${results.length} of ${allFonts.filter((f) => f.family.toLowerCase().includes(query.toLowerCase())).length} results`
                  : `${allFonts.length} fonts — showing ${results.length}`}
              </p>
            </div>
            <div>
              {results.map(({ id, family, variable, category }) => {
                const isLoaded = loadedFonts.some((f) => f.id === id);
                const isLoading = loading === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleLoad(id, family)}
                    disabled={isLoaded || isLoading}
                    className="flex items-center justify-between w-full px-3 py-2 text-xs hover:bg-neutral-50 disabled:cursor-default cursor-pointer text-left border-b border-neutral-50"
                  >
                    <div className="min-w-0">
                      <span className="block font-medium truncate">{family}</span>
                      <span className="text-neutral-400">
                        {category}
                        {variable && <span className="ml-1 text-neutral-300">· variable</span>}
                      </span>
                    </div>
                    <div className="ml-2 shrink-0">
                      {isLoading ? (
                        <Loader2 size={11} className="animate-spin text-neutral-400" />
                      ) : isLoaded ? (
                        <Check size={11} className="text-green-600" />
                      ) : (
                        <Plus size={11} className="text-neutral-300" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
