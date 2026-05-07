import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import prettierConfig from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  // 1. Next.js 기본 설정
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // 2. TypeScript 커스텀 규칙
  {
    name: "typescript-custom-rules",
    files: ["**/*.ts", "**/*.tsx"],
    plugins: { "@typescript-eslint": tsPlugin },
    languageOptions: { parser: tsParser },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "no-empty": ["warn", { allowEmptyCatch: false }],
    },
  },

  // 3. Import 순서/경로 정렬 규칙
  {
    name: "import-order-rules",
    files: ["**/*.ts", "**/*.tsx"],
    plugins: { import: importPlugin },
    settings: {
      "import/resolver": {
        typescript: { alwaysPath: true },
        node: true,
      },
    },
    rules: {
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index", "type"],
          pathGroups: [{ pattern: "@/**", group: "internal", position: "before" }],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/no-duplicates": "error",
    },
  },

  // 4. Prettier 충돌 규칙 비활성화 (반드시 마지막에 위치)
  prettierConfig,

  // 5. 무시 패턴
  {
    name: "ignores",
    ignores: [".next/**", "node_modules/**", "out/**", "types/database.types.ts"],
  },
];

export default eslintConfig;
