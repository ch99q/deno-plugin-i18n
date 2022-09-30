import { routes } from "i18n/server.ts";
import { t } from "i18n/runtime.ts";

import type { RouteConfig } from '$fresh/server.ts';

import Language from "../../islands/Language.tsx";
import Url from "../../islands/Url.tsx";

export default function MySuperArticle() {
  return (
    <div class="p-4 mx-auto max-w-screen-md">
      <h1>{t("welcome")}</h1>
      <Language />
      <Url />
    </div>
  );
}

export const config: RouteConfig = {
  routeOverride: routes(import.meta.url, {
    en: "/blog/my-super-article",
    da: "/blog/min-super-artikel",
    fr: "/blog/mon-super-article",
  })
}
