/// <reference path="./mod.ts" />

import { Fluent, TranslationContext } from "fluent";

export function getLanguage() {
  return window.i18n?.language;
}

export function getISO() {
  return window.i18n?.iso;
}

export function getDomain() {
  return window.i18n?.domain;
}

export function getState() {
  return window.i18n?.state;
}

export function getLanguages() {
  return window.i18n?.options?.languages;
}

const fluent = new Fluent();

let initalized = false;

export function t(path: string, context?: TranslationContext, locale?: string) {
  if (!initalized) {
    initalized = true;
    for (const [locale, { source }] of Object.entries(window.i18n.options.languages ?? {})) {
      fluent.addTranslationSync({
        locales: locale,
        source,
        isDefault: locale === window.i18n.options.fallback,
      })
    }
  }
  return fluent.translate(locale ?? getLanguage(), path, context);
}