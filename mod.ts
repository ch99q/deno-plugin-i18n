import type { Plugin } from "$fresh/server.ts";

import { resolve } from "https://deno.land/std@0.150.0/path/mod.ts";

import * as Cookies from "https://deno.land/std@0.154.0/http/cookie.ts";

export interface Language {
  /** The ISO code for the language */
  iso: string;

  /** The domain for the language (optional) */
  domain?: string;

  /** The state for the language (optional) */
  state?: Record<string, unknown>;
}

interface ResolvedLanguage extends Language {
  source: string;
}

export interface Options<T extends Record<string, Language> = Record<string, Language>> {
  /** The import.meta.url of the module defining these options. */
  selfURL: string;

  /** The default language to use if no language preference is set. */
  fallback: keyof T;

  /** The languages available to the application. */
  languages: T;
}

export interface I18n {
  /**
   * Identify the language of the request.
   */
  identify: (req: Request) => void;

  /**
   * Override the response with the correct language.
   * If necessary, this will also redirect the user to the correct domain and language.
   */
  override: (res: Response) => Response;

  /**
   * Get the Fresh plugin for i18n.
   */
  plugin: Plugin;
}

declare global {
  interface Window {
    i18n: {
      language: string;
      iso: string;
      domain?: string;
      state?: Record<string, unknown>;
      options: {
        fallback: string;
        languages: Record<string, ResolvedLanguage>;
      }
    }
    __i18n_routes: Record<string, [string, string][]>;
  }
}

export default function i18n(options: Options): I18n {
  let language = options.fallback;
  let iso = options.languages[options.fallback]?.iso;
  let domain = options.languages[options.fallback]?.domain;
  let state = options.languages[options.fallback]?.state;

  let request: Request | undefined;
  let response: Response | undefined;

  return {
    identify(req) {
      request = req;
    },
    override(res) {
      const cache = response;
      if (response)
        response = undefined;
      return cache ?? res;
    },
    plugin: {
      name: "i18n",

      entrypoints: {
        "i18n": `data:application/javascript,export default function(context) {window.i18n = context;document.cookie = 'frsh_lang=' + context.language + '; path=/';document.documentElement.setAttribute("lang", context.language);window.addEventListener("focus", function(event) {if(document.cookie.includes('frsh_lang=')) {const lang = document.cookie.split('frsh_lang=')[1].split(';')[0];if(lang !== context.language) {window.location.reload();}}});}`,
      },

      render(ctx) {
        const url = new URL(request!.url);
        const cookies = Cookies.getCookies(request!.headers);

        // Resolve the language from the request.
        const lang = cookies["frsh_lang"]
          ?? Object.entries(options.languages).find(([, { domain }]) => domain === url.hostname)?.[0]
          ?? options.fallback;

        // Check if the language is valid.
        if (lang in options.languages) {
          language = lang;
          iso = options.languages[language].iso;
          domain = options.languages[language].domain;
          state = options.languages[language].state;
        }

        const locales: Record<string, string> = {};
        for (const lang of Object.keys(options.languages)) {
          try {
            locales[lang] = Deno.readTextFileSync(resolve("./locales", `${lang}.ftl`));
          } catch {
            locales[lang] = Deno.readTextFileSync(resolve("./locales", `${options.fallback}.ftl`));
          }
        }

        window.i18n = {
          language,
          iso,
          domain,
          state,
          options: {
            ...options,
            languages: Object.entries(options.languages).reduce((acc, [key, options]) => ({ ...acc, [key]: { ...options, source: locales[key] } }), {}),
          }
        };

        ctx.render();

        const source = new URL(request!.url);
        const target = new URL(request!.url);

        // Remove the _frsh_lang search parameter if it exists.
        if (url.searchParams.get("_frsh_lang")) {
          language = target.searchParams.get("_frsh_lang")!;
          iso = options.languages[language].iso;
          domain = options.languages[language].domain;
          state = options.languages[language].state;

          target.searchParams.delete("_frsh_lang");
        }

        // Ignore redirects if we're in development mode.
        if (options.languages[options.fallback].domain && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
          // Check if the domain is a valid domain.
          if ((domain && url.hostname !== domain) || (!domain && url.hostname !== options.languages[options.fallback].domain)) {

            // Redirect to the correct domain.
            const hostname = domain ?? options.languages[options.fallback].domain;

            // If target domain is found, redirect to the correct domain.
            if (hostname) {
              target.hostname = hostname;
              target.searchParams.set("_frsh_lang", language);
            }
          }
        }

        // Check if the current routes match a another language than the current language.
        const routes = window.__i18n_routes ?? {};
        e: for (const [lang, paths] of Object.entries(routes)) {
          if (lang === language) continue;
          for (const [file, path] of paths) {
            if (path.match(new RegExp(`^${url.pathname}$`))) {
              // Redirect to the correct language.
              const pathname = (routes[language] ?? routes[options.fallback]).find(([f]) => f === file)?.[1] as string;

              target.pathname = pathname;
              break e;
            }
          }
        }

        if (source.href !== target.href) {
          response = new Response(null, {
            status: 302,
            headers: {
              "Location": target.href,
              "Set-Cookie": `frsh_lang=${language}; path=/`,
            },
          });
        }

        return {
          scripts: [{
            entrypoint: "i18n",
            state: {
              language,
              iso,
              domain,
              state,
              options: {
                fallback: options.fallback,
                // Filtering the state from other languages to the client, to avoid too much data being sent.
                languages: Object.fromEntries(Object.entries(options.languages).map(([key, { iso, domain }]) => [key, { iso, domain, source: [options.fallback, language].includes(key) ? locales[key] : "" }])),
              }
            }
          }]
        }
      }
    }
  }
}
