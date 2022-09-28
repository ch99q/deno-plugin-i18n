function getInternals() {
  return JSON.parse(sessionStorage.getItem("i18n") ?? "{}") ?? {};
}

export function getLanguage() {
  return getInternals()?.language;
}

export function getISO() {
  return getInternals()?.iso;
}

export function getDomain() {
  return getInternals()?.domain;
}

export function getState() {
  return getInternals()?.state;
}

export function getLanguages() {
  return getInternals()?.options?.languages;
}