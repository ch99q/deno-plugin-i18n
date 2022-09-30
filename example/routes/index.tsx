import { t } from "../../runtime.ts";
import Counter from "../islands/Counter.tsx";
import Language from "../islands/Language.tsx";
import Url from "../islands/Url.tsx";

export default function Home() {
  return (
    <div class="p-4 mx-auto max-w-screen-md">
      <img
        src="/logo.svg"
        class="w-32 h-32"
        alt="the fresh logo: a sliced lemon dripping with juice"
      />
      <p class="my-6">
        {t("welcome")}
      </p>
      <a href="/blog/my-super-article" hrefLang="da">Go to blog</a>
      <Counter start={3} />
      <Language />
      <Url />
    </div>
  );
}
