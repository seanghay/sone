/**
 * Font registration.
 *
 * CanvasKit has no system font access — every typeface must be supplied as
 * bytes. That is the one hard breaking change in this backend, so the failure
 * mode here is a loud, actionable error rather than a blank render.
 *
 * Two objects are kept per family because different CanvasKit APIs need
 * different things:
 *   - `TypefaceFontProvider` drives `ParagraphBuilder` (shaping, fallback).
 *   - a per-family `Font` answers `getMetrics()` for ascent/descent.
 */
import { ck } from "./init.ts";

/** The six CSS generic families sone treats as "whatever is registered". */
const GENERIC_FAMILIES = new Set([
  "sans-serif",
  "serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
]);

export class SoneFontError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SoneFontError";
  }
}

interface FaceEntry {
  bytes: Uint8Array;
  // biome-ignore lint/suspicious/noExplicitAny: CanvasKit Typeface
  typeface: any;
}

export class FontRegistry {
  /** Insertion-ordered: the first registered family backs generic names. */
  private readonly faces = new Map<string, FaceEntry[]>();
  // biome-ignore lint/suspicious/noExplicitAny: CanvasKit TypefaceFontProvider
  private cachedProvider: any = null;
  // biome-ignore lint/suspicious/noExplicitAny: CanvasKit Font, keyed by family|size
  private readonly fontCache = new Map<string, any>();

  /** Listeners fired whenever registration changes, so caches can clear. */
  private readonly listeners = new Set<() => void>();

  /**
   * Generic family -> registered family. Lets `monospace` resolve to a real
   * monospace face rather than the first-registered font. Used by the bundled
   * default fonts; cleared on reset.
   */
  private readonly aliases = new Map<string, string>();

  /** Subscribe to registration changes (measurement/shaping caches). */
  subscribe(listener: () => void): void {
    this.listeners.add(listener);
  }

  /** Point a generic family name at a specific registered family. */
  alias(generic: string, family: string): void {
    this.aliases.set(generic, family);
  }

  register(family: string, bytes: Uint8Array): void {
    const kit = ck();
    const buffer = toArrayBuffer(bytes);
    const typeface = kit.Typeface.MakeFreeTypeFaceFromData(buffer);
    if (typeface == null) {
      throw new SoneFontError(
        `Failed to parse font data for ${JSON.stringify(family)}. Is the file a valid TTF/OTF/WOFF?`,
      );
    }

    const existing = this.faces.get(family);
    if (existing != null) existing.push({ bytes, typeface });
    else this.faces.set(family, [{ bytes, typeface }]);

    this.invalidate();
  }

  /**
   * Drop a family and rebuild the provider from what remains.
   * skia-canvas could not do this, which is why `Font.unload()` was previously
   * a silent no-op.
   */
  unregister(family: string): void {
    const entries = this.faces.get(family);
    if (entries == null) return;
    for (const entry of entries) entry.typeface?.delete?.();
    this.faces.delete(family);
    this.invalidate();
  }

  reset(): void {
    for (const entries of this.faces.values()) {
      for (const entry of entries) entry.typeface?.delete?.();
    }
    this.faces.clear();
    this.aliases.clear();
    this.invalidate();
  }

  has(family: string): boolean {
    return this.faces.has(family);
  }

  families(): string[] {
    return [...this.faces.keys()];
  }

  /** The provider backing ParagraphBuilder, rebuilt lazily after mutation. */
  // biome-ignore lint/suspicious/noExplicitAny: CanvasKit TypefaceFontProvider
  provider(): any {
    if (this.cachedProvider != null) return this.cachedProvider;

    const kit = ck();
    const provider = kit.TypefaceFontProvider.Make();
    for (const [family, entries] of this.faces) {
      for (const entry of entries) provider.registerFont(entry.bytes, family);
    }
    this.cachedProvider = provider;
    return provider;
  }

  /**
   * Resolve a requested family list to families that actually exist.
   *
   * Generic names map to the first registered family, preserving the intent of
   * "use the default font" now that there is no system default to fall back on.
   */
  resolve(requested: readonly string[] | undefined): string[] {
    const available = this.families();
    if (available.length === 0) {
      throw new SoneFontError(
        "No fonts registered. CanvasKit has no system fonts, so every typeface " +
          "must be loaded explicitly — call Font.load(name, source) before rendering.",
      );
    }

    if (requested == null || requested.length === 0) return available;

    const resolved: string[] = [];
    const add = (family: string) => {
      if (!resolved.includes(family)) resolved.push(family);
    };

    for (const family of requested) {
      if (this.faces.has(family)) {
        add(family);
      } else if (GENERIC_FAMILIES.has(family)) {
        // A generic maps to its alias if one is registered (e.g. monospace ->
        // the bundled mono font); otherwise to the first registered family.
        const aliased = this.aliases.get(family);
        add(
          aliased != null && this.faces.has(aliased) ? aliased : available[0],
        );
      }
    }

    // Append every other registered family as a fallback chain. Skia's
    // paragraph shaper walks this list per glyph, so a Latin-only primary font
    // still renders Khmer, Arabic or Hebrew runs correctly — which is what a
    // system font stack used to provide. Without this, any glyph missing from
    // the first family renders as tofu.
    for (const family of available) add(family);

    return resolved;
  }

  /**
   * A `Font` for the first resolved family at a given size, used purely for
   * `getMetrics()`. Cached: metrics are text-independent, so this is a small
   * fixed-size map rather than a hot allocation.
   */
  // biome-ignore lint/suspicious/noExplicitAny: CanvasKit Font
  fontFor(families: readonly string[] | undefined, size: number): any {
    const [family] = this.resolve(families);
    const key = `${family}|${size}`;
    const hit = this.fontCache.get(key);
    if (hit != null) return hit;

    const entries = this.faces.get(family);
    if (entries == null || entries.length === 0) {
      throw new SoneFontError(
        `Font family ${JSON.stringify(family)} is not registered.`,
      );
    }

    const font = new (ck().Font)(entries[0].typeface, size);
    this.fontCache.set(key, font);
    return font;
  }

  private invalidate(): void {
    this.cachedProvider?.delete?.();
    this.cachedProvider = null;
    for (const font of this.fontCache.values()) font?.delete?.();
    this.fontCache.clear();
    for (const listener of this.listeners) listener();
  }
}

/** Normalize to a standalone ArrayBuffer; Buffer views share a larger pool. */
function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
}
