export interface UploadedImageAsset {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  width: number;
  height: number;
}

function isImageFile(file: File) {
  return file.type.startsWith("image/") || /\.svg$/i.test(file.name);
}

function readImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
      });
    };
    img.onerror = () => reject(new Error("Failed to read image dimensions."));
    img.src = url;
  });
}

export async function createUploadedImageAsset(file: File): Promise<UploadedImageAsset> {
  if (!isImageFile(file)) {
    throw new Error(`Unsupported file "${file.name}". Upload an image file.`);
  }

  const url = URL.createObjectURL(file);

  try {
    const { width, height } = await readImageDimensions(url);
    return {
      id: typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${file.name}:${file.lastModified}:${file.size}`,
      name: file.name,
      size: file.size,
      type: file.type || "image/*",
      url,
      width,
      height,
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

export function revokeUploadedImageAsset(asset: UploadedImageAsset) {
  URL.revokeObjectURL(asset.url);
}
