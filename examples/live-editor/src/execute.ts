/**
 * Transform user ES module code into something executable via AsyncFunction.
 *
 * Rewrites the `sone` imports to read from an injected `__sone` binding and
 * normalises the default export. Used by the render worker.
 *
 *   import { Column, Text } from "sone"  →  const { Column, Text } = __sone;
 *   import * as sone from "sone"          →  const sone = __sone;
 *   import type { ... } from "sone"       →  (removed)
 *   export default function Root() {...}  →  const __default = function Root() {...}
 *   export default <expr>                 →  const __default = <expr>
 */
export function transformCode(code: string): string {
  return code
    .replace(/import\s+type\s+\{[^}]*\}\s+from\s+["']sone["'];?\n?/g, "")
    .replace(
      /import\s*\{([^}]+)\}\s*from\s*["']sone["'];?/g,
      (_, names) => `const {${names}} = __sone;`
    )
    .replace(
      /import\s*\*\s*as\s+(\w+)\s+from\s+["']sone["'];?/g,
      (_, name) => `const ${name} = __sone;`
    )
    .replace(
      /export\s+default\s+function\s+(\w+)/g,
      "const __default = function $1"
    )
    .replace(/export\s+default\s+/g, "const __default = ");
}
