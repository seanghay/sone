import jsPDF from "jspdf";

export const EXPORT_SCALES = [1, 2, 4, 5] as const;
export type ExportScale = (typeof EXPORT_SCALES)[number];

function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

export function exportAsPNG(canvas: HTMLCanvasElement, scale: ExportScale, filename = "sone-export") {
  triggerDownload(canvas.toDataURL("image/png"), `${filename}@${scale}x.png`);
}

export function exportAsJPEG(canvas: HTMLCanvasElement, scale: ExportScale, quality = 0.95, filename = "sone-export") {
  triggerDownload(canvas.toDataURL("image/jpeg", quality), `${filename}@${scale}x.jpg`);
}

export function exportAsPDF(canvas: HTMLCanvasElement, scale: ExportScale, filename = "sone-export") {
  const { width: w, height: h } = canvas;
  const orientation = w >= h ? "landscape" : "portrait";
  const pdf = new jsPDF({ orientation, unit: "px", format: [w, h], hotfixes: ["px_scaling"] });
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();
  pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, pdfW, pdfH);
  pdf.save(`${filename}@${scale}x.pdf`);
}
