/** Holds the render worker reference so fonts.ts can sync registrations. */
export const workerBridge = {
  worker: null as Worker | null,

  registerFont(name: string, url: string) {
    this.worker?.postMessage({ type: "registerFont", name, url });
  },

  unregisterFont(name: string) {
    this.worker?.postMessage({ type: "unregisterFont", name });
  },
};
