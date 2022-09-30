import { Options } from "i18n";

export default {
  selfURL: import.meta.url,

  fallback: "en",

  languages: {
    en: {
      iso: "en",
      domain: "example.com"
    },
    fr: {
      iso: "fr",
      domain: "example.fr"
    },
    da: {
      iso: "da",
      domain: "example.dk"
    },

  }
} as Options;
