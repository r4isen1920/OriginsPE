import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import minecraftLinting from "eslint-plugin-minecraft-linting";
import stylisticJs from "@stylistic/eslint-plugin-js";
import stylisticTs from "@stylistic/eslint-plugin-ts";

export default defineConfig([
  {
    ignores: ["*.test.ts", "*.config.js"],
  },

  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    plugins: {
      'minecraft-linting': minecraftLinting,
      '@stylistic/js': stylisticJs,
    },
    rules: {
      ...js.configs.recommended.rules,

      "prefer-const": "off",
      "no-unused-vars": "off",
      "semi": "off",
      "no-unused-labels": "off",
      "no-inner-declarations": "off",
      "no-duplicate-imports": "error",
      "one-var-declaration-per-line": "error",
      "curly": ["off", "all"],
      "eqeqeq": "error",
      "minecraft-linting/avoid-unnecessary-command": "error",
    },
  },

  ...tseslint.configs.recommended,

  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: "tsconfig.json",
      },
    },
    plugins: {
      '@stylistic/ts': stylisticTs,
    },
    rules: {
      "@typescript-eslint/prefer-as-const": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "args": "all",
          "argsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_",
          "destructuredArrayIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
        },
      ],
      "@stylistic/ts/semi": ["error", "always"],
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-shadow": "error",
    },
  },
]);
