import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // MSW auto-generated service worker — not our code
    "public/mockServiceWorker.js",
  ]),
  {
    rules: {
      // react-hook-form's watch() is intentionally not memoizable by the React
      // Compiler. This is a known, harmless incompatibility — the components
      // still function correctly; the compiler simply skips optimising them.
      "react-hooks/incompatible-library": "off",
    },
  },
]);

export default eslintConfig;
