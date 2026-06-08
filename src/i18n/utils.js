// Lightweight i18n helpers built on Astro's native i18n config.
import en from "./en.json";
import es from "./es.json";
import pt from "./pt.json";
import fr from "./fr.json";
import ja from "./ja.json";
import zh from "./zh.json";
import ko from "./ko.json";
import ht from "./ht.json";

export const DEFAULT_LOCALE = "en";

// Order drives the language switcher. Native names so each is self-identifying.
export const LOCALES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
  { code: "ko", label: "한국어" },
  { code: "ht", label: "Kreyòl" },
];

const DICTIONARIES = { en, es, pt, fr, ja, zh, ko, ht };

/** Dictionary for a locale, falling back to English. */
export function getDict(lang) {
  return DICTIONARIES[lang] ?? DICTIONARIES[DEFAULT_LOCALE];
}

/**
 * Returns a `t(key)` reader supporting dot paths, e.g. t("hero.cta").
 * Missing keys fall back to English, then to the raw key.
 */
export function useTranslations(lang) {
  const dict = getDict(lang);
  const fallback = DICTIONARIES[DEFAULT_LOCALE];
  return function t(key) {
    return resolve(dict, key) ?? resolve(fallback, key) ?? key;
  };
}

function resolve(obj, key) {
  return key.split(".").reduce((acc, part) => acc?.[part], obj);
}

/** Path prefix for a locale: "" for the default, "/es" otherwise. */
export function localePath(lang) {
  return lang === DEFAULT_LOCALE ? "" : `/${lang}`;
}

/** Non-default locales, for getStaticPaths in src/pages/[lang]/index.astro. */
export function nonDefaultLocales() {
  return LOCALES.filter((l) => l.code !== DEFAULT_LOCALE).map((l) => l.code);
}
