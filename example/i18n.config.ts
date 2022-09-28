import { Options } from "i18n";

const loadMessages = new Promise<Record<string, Record<string, string>>>((resolve) => {
  const messages: Record<string, Record<string, string>> = {
    en: {
      "Hello, world!": "Hello, world!",
    },
    fr: {
      "Hello, world!": "Bonjour, le monde!",
    },
    da: {
      "Hello, world!": "Hej, verden!",
    },
  };
  setTimeout(() => {
    resolve(messages);
  }, 1000);
});

const messages = await loadMessages;

export default {
  selfURL: import.meta.url,

  fallback: "en",

  languages: {
    en: {
      iso: "en",
      domain: "example.com",
      state: {
        messages: messages.en,
      }
    },
    fr: {
      iso: "fr",
      domain: "example.fr",
      state: {
        messages: messages.fr,
      }
    },
    da: {
      iso: "da",
      domain: "example.dk",
      state: {
        messages: messages.da,
      }
    },
  }
} as Options;
