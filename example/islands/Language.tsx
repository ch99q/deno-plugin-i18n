import { Button } from "../components/Button.tsx";

export default function Language() {
  function switchLanguage(lang: string) {
    document.cookie = `frsh_lang=${lang}; path=/;`;
    document.location.reload();
  }

  return (
    <div>
      <div class="flex gap-2">
        <Button onClick={() => switchLanguage("en")}>English</Button>
        <Button onClick={() => switchLanguage("da")}>Danish</Button>
        <Button onClick={() => switchLanguage("fr")}>French</Button>
      </div>
    </div>
  );
}
