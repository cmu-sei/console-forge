import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    files: ["src/**/*.ts"],
    extends: [
      tseslint.config(eslint.configs.recommended, tseslint.configs.recommended),
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "rxjs/operators",
              importNames: ["tap"],
              message: "We're tapping out on using `tap`.",
            },
          ],
          patterns: [
            {
              group: ["projects/console-forge-docs/**"],
              message: "Don't import from the docs app.",
            },
            {
              group: ["@angular/material/**"],
              message:
                "Don't import Angular Material stuff in the library. We're only using it for the docs site.",
            },
          ],
        },
      ],
    },
  },
]);
