/// <reference path="./mod.ts" />

import { resolve, fromFileUrl, relative } from "https://deno.land/std@0.150.0/path/mod.ts";

import { pathToPattern } from './utils.ts';

export function routes(url: string, map: Record<string, string>) {
  const uri = "/" + relative(resolve("./routes"), fromFileUrl(url));
  window.__i18n_routes = window.__i18n_routes ?? {};
  for(const [key, value] of Object.entries(map)) {
    window.__i18n_routes[key] = window.__i18n_routes[key] ?? [];
    window.__i18n_routes[key].push([uri, pathToPattern(value)]);
  }
  const segments: Set<string>[] = [];
  for (const locale in map) {
    const paths = pathToPattern(map[locale]).split("/");
    for (let i = 0; i < paths.length; i++) {
      segments[i] = segments[i] || new Set();
      segments[i].add(paths[i]);
    }
  }
  const path = segments.map((s) => s.size > 1 ? "(" + Array.from(s).join("|") + ")" : Array.from(s)[0]).join("/");

  return path;
}