import * as soneAll from "sone";
import type { SoneNode } from "sone";
import { transform } from "sucrase";

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

/**
 * Transform user ES module code into something executable via AsyncFunction.
 *
 * Handles:
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

export async function executeCode(code: string): Promise<SoneNode> {
  const { code: js } = transform(code, { transforms: ["typescript"] });
  const transformed = transformCode(js);
  const fn = new AsyncFunction(
    "__sone",
    `${transformed}\nreturn typeof __default === "function" ? __default() : __default;`
  );
  return fn(soneAll);
}
