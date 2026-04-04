import { Check, Copy, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import type { UploadedImageAsset } from "../images";

interface ImagePanelProps {
  images: UploadedImageAsset[];
  onUpload: (files: FileList | null) => Promise<void>;
  onRemove: (id: string) => void;
  onInsertPhoto: (url: string) => void;
  onClose?: () => void;
  mobile?: boolean;
  embedded?: boolean;
}

function formatSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImagePanel({
  images,
  onUpload,
  onRemove,
  onInsertPhoto,
  onClose,
  mobile = false,
  embedded = false,
}: ImagePanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [copiedImageId, setCopiedImageId] = useState<string | null>(null);

  async function handleUpload(fileList: FileList | null) {
    if (!fileList?.length) return;

    setIsUploading(true);
    setLoadError(null);

    try {
      await onUpload(fileList);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleCopyUrl(id: string, url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedImageId(id);
      window.setTimeout(() => {
        setCopiedImageId((current) => (current === id ? null : current));
      }, 1200);
    } catch {
      setLoadError("Failed to copy image URL.");
    }
  }

  return (
    <div className={`h-full w-full min-w-0 bg-white flex flex-col ${mobile || embedded ? "" : "border-l border-neutral-200"}`}>
      {!embedded && (
        <div className="flex items-center justify-between px-4 h-12 border-b border-neutral-200 shrink-0">
          <span className="text-sm font-semibold">Images</span>
          <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      <div className={`px-3 py-3 border-b border-neutral-100 shrink-0 ${embedded ? "pt-3" : ""}`}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1.5 rounded border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
            Upload image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.svg"
            multiple
            className="hidden"
            onChange={(e) => {
              void handleUpload(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          Copy a generated <code>blob:</code> URL and use it with <code>Photo(url)</code>.
        </p>
      </div>

      {loadError && (
        <p className="mx-3 mt-2 text-xs text-red-600 bg-red-50 px-2 py-1.5 rounded shrink-0">{loadError}</p>
      )}

      <div className="flex-1 overflow-y-auto">
        {images.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center text-neutral-400">
            <ImageIcon size={18} />
            <p className="mt-3 text-sm font-medium text-neutral-600">No uploaded images yet</p>
            <p className="mt-1 text-xs text-neutral-400">Drop in a local image to get a reusable object URL.</p>
          </div>
        ) : (
          <div className="space-y-2 p-3">
            {images.map((image) => (
              <div key={image.id} className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
                <div className="aspect-[4/3] bg-neutral-50">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="space-y-2 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-neutral-900">{image.name}</p>
                    <p className="text-xs text-neutral-400">
                      {image.width} x {image.height} · {formatSize(image.size)}
                    </p>
                  </div>
                  <div className="rounded bg-neutral-50 px-2 py-1.5">
                    <p className="truncate text-[11px] text-neutral-500">{image.url}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onInsertPhoto(image.url)}
                      className="rounded px-2.5 py-1.5 text-xs font-medium bg-neutral-100 text-neutral-900 hover:bg-neutral-200 cursor-pointer"
                    >
                      Insert Photo
                    </button>
                    <button
                      onClick={() => void handleCopyUrl(image.id, image.url)}
                      className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium cursor-pointer ${
                        copiedImageId === image.id
                          ? "bg-green-100 text-green-700"
                          : "bg-neutral-900 text-white hover:bg-neutral-800"
                      }`}
                    >
                      {copiedImageId === image.id ? <Check size={11} /> : <Copy size={11} />}
                      {copiedImageId === image.id ? "Copied" : "Copy URL"}
                    </button>
                    <button
                      onClick={() => onRemove(image.id)}
                      className="rounded px-2.5 py-1.5 text-xs font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
