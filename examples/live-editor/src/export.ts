const MIME: Record<string, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  pdf: "application/pdf",
  svg: "image/svg+xml",
};

const EXTENSION: Record<string, string> = {
  png: "png",
  jpeg: "jpg",
  pdf: "pdf",
  svg: "svg",
};

/** Download encoded bytes produced by the render worker as a file. */
export function downloadExport(
  bytes: Uint8Array,
  format: "png" | "jpeg" | "pdf" | "svg",
  filename = "sone-export",
) {
  const blob = new Blob([bytes as BlobPart], { type: MIME[format] });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.${EXTENSION[format]}`;
  a.click();
  URL.revokeObjectURL(url);
}
