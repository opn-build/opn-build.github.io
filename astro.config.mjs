// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Organization site → served at the domain root (no `base` needed).
// i18n: default locale (en) lives at `/`, the other 7 hang off `/es/`, `/pt/`, ...
export default defineConfig({
  site: "https://opn-build.github.io",
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: "en",
        locales: {
          en: "en",
          es: "es",
          pt: "pt-BR",
          fr: "fr",
          ja: "ja",
          zh: "zh-Hans",
          ko: "ko",
          ht: "ht",
        },
      },
      serialize(item) {
        return {
          ...item,
          changefreq: "weekly",
          lastmod: new Date().toISOString().slice(0, 10),
        };
      },
    }),
  ],
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
