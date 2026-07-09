import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import queryPlugin from "@tanstack/eslint-plugin-query";

const config = [
  ...nextVitals,
  ...nextTs,
  ...queryPlugin.configs["flat/recommended"],
  {
    ignores: [
      ".next/**",
      "dist/**",
      "figma-export/**",
      "node_modules/**",
    ],
  },
];

export default config;
