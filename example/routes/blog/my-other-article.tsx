import { routes } from "i18n/server.ts";
import { t } from "i18n/runtime.ts";

import type { RouteConfig } from '$fresh/server.ts';

import Language from "../../islands/Language.tsx";
import Url from "../../islands/Url.tsx";

export default function MySuperArticle() {
  return (
    <div class="p-4 mx-auto max-w-screen-md">
      <h1>{t("welcome")}</h1>
      <p>{t("welcome-description")}</p>
      <p>{t("content")}</p>
      <Language />
      <Url />
    </div>
  );
}

export const config: RouteConfig = {
  routeOverride: routes(import.meta.url, {
    en: "/blog/my-other-article",
    da: "/blog/min-anden-artikel",
    fr: "/blog/mon-autre-article",
  })
}
