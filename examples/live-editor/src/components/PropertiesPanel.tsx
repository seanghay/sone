import { ImageIcon, Type, X } from "lucide-react";
import { FontPanel } from "./FontPanel";
import { ImagePanel } from "./ImagePanel";
import type { UploadedImageAsset } from "../images";

interface PropertiesPanelProps {
  activeTab: "fonts" | "images";
  onTabChange: (tab: "fonts" | "images") => void;
  onClose: () => void;
  mobile?: boolean;
  images: UploadedImageAsset[];
  onUploadImages: (files: FileList | null) => Promise<void>;
  onRemoveImage: (id: string) => void;
  onInsertPhoto: (url: string) => void;
}

export function PropertiesPanel({
  activeTab,
  onTabChange,
  onClose,
  mobile = false,
  images,
  onUploadImages,
  onRemoveImage,
  onInsertPhoto,
}: PropertiesPanelProps) {
  return (
    <div className={`h-full w-full min-w-0 bg-white flex flex-col ${mobile ? "" : "border-l border-neutral-200"}`}>
      <div className="flex items-center justify-between px-4 h-12 border-b border-neutral-200 shrink-0">
        <span className="text-sm font-semibold">Properties</span>
        <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded cursor-pointer">
          <X size={14} />
        </button>
      </div>

      <div className="flex items-center gap-1 border-b border-neutral-100 px-3 py-2 shrink-0">
        <button
          onClick={() => onTabChange("fonts")}
          className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
            activeTab === "fonts"
              ? "bg-neutral-900 text-white"
              : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          }`}
        >
          <Type size={12} />
          Fonts
        </button>
        <button
          onClick={() => onTabChange("images")}
          className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
            activeTab === "images"
              ? "bg-neutral-900 text-white"
              : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          }`}
        >
          <ImageIcon size={12} />
          Images
        </button>
      </div>

      <div className="flex-1 min-h-0">
        {activeTab === "fonts" ? (
          <FontPanel embedded />
        ) : (
          <ImagePanel
            embedded
            images={images}
            onUpload={onUploadImages}
            onRemove={onRemoveImage}
            onInsertPhoto={onInsertPhoto}
          />
        )}
      </div>
    </div>
  );
}
