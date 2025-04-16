// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

const globalEsLintConfig = tseslint.config(eslint.configs.recommended);

export default globalEsLintConfig;
