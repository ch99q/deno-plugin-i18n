/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";

import twindPlugin from "$fresh/plugins/twind.ts";
import twindConfig from "./twind.config.ts";

import i18nPlugin from "../mod.ts";
import i18nConfig from "./i18n.config.ts";
export const { identify, override, plugin } = i18nPlugin(i18nConfig);

await start(manifest, { plugins: [twindPlugin(twindConfig), plugin] });
