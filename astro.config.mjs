// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://questionhunter.dev",

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react(), sitemap()],

  markdown: {
    shikiConfig: {
      // github-dark matches our canvas-night (#1c1c1c) aesthetic —
      // zero-JS, inline styles at build time, no client highlighter needed.
      theme: "github-dark",
      wrap: true,
    },
  },
});
