// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import { satteri } from "@astrojs/markdown-satteri";
import { katexPlugin } from "./src/lib/satteri-katex.mjs";

// SITE_URL и BASE_PATH се подават от GitHub Actions (actions/configure-pages).
// Локално сайтът върви на http://localhost:4321/.
const base = process.env.BASE_PATH || "/";

export default defineConfig({
  site: process.env.SITE_URL || "https://your-username.github.io",
  base,
  trailingSlash: "always",
  integrations: [mdx()],
  markdown: {
    // Astro 7: Sätteri е процесорът по подразбиране. Включваме $...$ / $$...$$ и KaTeX плъгина.
    processor: satteri({ features: { math: true }, hastPlugins: [katexPlugin] }),
    shikiConfig: { themes: { light: "github-light", dark: "github-dark" } },
  },
  // Подпътят като константа: import.meta.env.BASE_URL може да се подмени от
  // променлива на средата със същото име (някои CI системи я задават).
  vite: { define: { __SITE_BASE__: JSON.stringify(base) } },
});
