import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // scripts/seed.ts runs under plain Node, which cannot resolve the "@/"
    // alias that Next and tsc understand. Anything it reaches has to import
    // relatively, or the seed dies at run time with ERR_MODULE_NOT_FOUND —
    // and neither `tsc --noEmit` nor `next build` will notice.
    files: ["src/server/models/**/*.ts", "src/server/db.ts", "scripts/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/*"],
              message:
                "Use a relative import here — this file is loaded by scripts/seed.ts under plain Node, which cannot resolve the @/ alias.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
