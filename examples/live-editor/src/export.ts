function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

export function exportAsPNG(
  canvas: HTMLCanvasElement,
  filename = "sone-export",
) {
  triggerDownload(canvas.toDataURL("image/png"), `${filename}.png`);
}

export function exportAsJPEG(
  canvas: HTMLCanvasElement,
  quality = 0.95,
  filename = "sone-export",
) {
  triggerDownload(canvas.toDataURL("image/jpeg", quality), `${filename}.jpg`);
}
