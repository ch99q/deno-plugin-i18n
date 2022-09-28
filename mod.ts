import type { Plugin } from "$fresh/server.ts";

import * as Cookies from "https://deno.land/std@0.154.0/http/cookie.ts";

export interface Language {
  /** The ISO code for the language */
  iso: string;

  /** The domain for the language (optional) */
  domain?: string;

  /** The state for the language */
  state: Record<string, unknown>;
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
        "i18n": `data:application/javascript,export default function(state) { sessionStorage.setItem('i18n', JSON.stringify(state)); document.cookie = 'frsh_lang=' + state.language + '; path=/'; }`,
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
          iso = options.languages[lang].iso;
          domain = options.languages[lang].domain;
          state = options.languages[lang].state;
        }

        const context = {
          language,
          iso,
          domain,
          state,
          options: {
            fallback: options.fallback,
            // Filtering the state from other languages to the client, to avoid too much data being sent.
            languages: Object.fromEntries(Object.entries(options.languages).map(([key, { iso, domain }]) => [key, { iso, domain }])),
          }
        }

        sessionStorage.setItem("i18n", JSON.stringify(context));

        ctx.render();

        // Ignore redirects if we're in development mode.
        if (options.languages[options.fallback].domain && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
          // Check if the domain is a valid domain.
          if ((domain && url.hostname !== domain) || (!domain && url.hostname !== options.languages[options.fallback].domain)) {
            // Redirect to the correct domain.
            const target = new URL(request!.url);
            target.hostname = domain ?? options.languages[options.fallback].domain as string;
            target.searchParams.set("_frsh_lang", language);

            // If target domain is found, redirect to the correct domain.
            if (target.hostname) {
              response = new Response(null, {
                status: 302,
                headers: {
                  "Location": target.href
                }
              });
            }
          }
        }

        // Remove the _frsh_lang search parameter if it exists.
        if (url.searchParams.get("_frsh_lang")) {
          const lang = url.searchParams.get("_frsh_lang")!;
          url.searchParams.delete("_frsh_lang");

          response = new Response(null, {
            status: 302,
            headers: {
              "Location": url.href,
              "Set-Cookie": `frsh_lang=${lang}; path=/`,
            },
          });
        }

        return {
          scripts: [{
            entrypoint: "i18n",
            state: context
          }]
        }
      }
    }
  }
}
