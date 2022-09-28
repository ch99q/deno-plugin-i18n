import { getLanguage, getLanguages, getState } from "../../runtime.ts";
import { Button } from "../components/Button.tsx";

interface LanguageProps {
  server: string;
}

export default function Language(props: LanguageProps) {
  console.log(getLanguages());

  function switchLanguage(lang: string) {
    document.cookie = `frsh_lang=${lang}; path=/;`;
    document.location.reload();
  }

  return (
    <div>
      <p>Language fetched from client: {getLanguage()}</p>
      <p>Language fetched from server: {props.server}</p>

      <div class="flex gap-2">
        <Button onClick={() => switchLanguage("en")}>English</Button>
        <Button onClick={() => switchLanguage("da")}>Danish</Button>
        <Button onClick={() => switchLanguage("fr")}>French</Button>
      </div>
    </div>
  );
}
