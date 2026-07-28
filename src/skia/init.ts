/**
 * CanvasKit lifecycle.
 *
 * `skia` initializes asynchronously (it instantiates a ~9.6MB WASM module) but
 * much of sone's renderer surface is synchronous — `measureText`, `createCanvas`
 * and the `Path2D` constructor. The seam that resolves this is `ready()`:
 * `calculateLayout` awaits it once, and every synchronous call happens strictly
 * downstream of that await, so `ck()` is always safe by then.
 *
 * The package's own `exports` map carries a `browser` condition, so a bare
 * `import("skia")` resolves to the Node or browser entry automatically — no
 * platform-specific loader is needed here.
 */

/** The CanvasKit namespace, reached through the package's own entry point. */
export type CanvasKit = Awaited<ReturnType<typeof import("skia").create>>;

let instance: CanvasKit | null = null;
let pending: Promise<CanvasKit> | null = null;
let wasmOverride: string | undefined;

/**
 * Point the loader at a specific WASM binary.
 *
 * Required in runtimes where the default asset resolution does not apply —
 * bundlers that do not emit the `.wasm` alongside the module, and edge runtimes
 * without filesystem access, where this should be a CDN URL.
 *
 * Must be called before the first render; afterwards it throws rather than
 * silently having no effect.
 */
export function configureSkia(options: { wasmFile: string }): void {
  if (instance != null || pending != null) {
    throw new Error(
      "configureSkia() must be called before the first render — CanvasKit is already initialized.",
    );
  }
  wasmOverride = options.wasmFile;
}

/**
 * Initialize CanvasKit. Idempotent, and safe to call concurrently — the
 * in-flight promise is shared rather than starting a second instantiation.
 */
export function ready(): Promise<CanvasKit> {
  if (instance != null) return Promise.resolve(instance);
  if (pending != null) return pending;

  pending = (async () => {
    // Dynamic import keeps this loadable from the CJS build: `skia` is
    // ESM-only, and a static import would be lowered to require().
    const skia = await import("skia");
    const kit =
      wasmOverride != null
        ? await skia.initializeWasm({ wasmFile: wasmOverride })
        : await skia.create();
    instance = kit as CanvasKit;
    return instance;
  })();

  return pending;
}

/**
 * Synchronous accessor for the initialized CanvasKit.
 * @throws if called before `ready()` has resolved.
 */
export function ck(): CanvasKit {
  if (instance == null) {
    throw new Error(
      "CanvasKit is not initialized. Await sone's render entry point, or call ready() first.",
    );
  }
  return instance;
}

/** True once CanvasKit is available synchronously. */
export function isReady(): boolean {
  return instance != null;
}
