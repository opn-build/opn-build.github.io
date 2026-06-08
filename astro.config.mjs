// @ts-check
import { defineConfig } from "astro/config";

// Organization site → served at the domain root (no `base` needed).
// i18n: default locale (en) lives at `/`, the other 7 hang off `/es/`, `/pt/`, ...
export default defineConfig({
  site: "https://opn-build.github.io",
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es", "pt", "fr", "ja", "zh", "ko", "ht"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  build: {
    inlineStylesheets: "auto",
  },
});
