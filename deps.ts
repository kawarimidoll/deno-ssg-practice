import {
  assert,
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.102.0/testing/asserts.ts";

import { Marked, Renderer } from "https://deno.land/x/markdown@v2.0.0/mod.ts";

import {
  ensureFile,
  exists,
  walk,
} from "https://deno.land/std@0.102.0/fs/mod.ts";

import {
  basename,
  join,
  relative,
} from "https://deno.land/std@0.102.0/path/mod.ts";

import twemoji from "https://cdn.skypack.dev/twemoji@v13.1.0?dts";

import { minifyHTML } from "https://deno.land/x/minifier@v1.1.1/mod.ts";

import {
  DOMParser,
  Element,
} from "https://deno.land/x/deno_dom@v0.1.12-alpha/deno-dom-wasm.ts";
const domParser = new DOMParser();

import { main as deployDir } from "https://deno.land/x/deploy_dir@v0.3.2/cli.ts";

export {
  assert,
  assertEquals,
  assertThrows,
  basename,
  deployDir,
  domParser,
  Element,
  ensureFile,
  exists,
  join,
  Marked,
  minifyHTML,
  relative,
  Renderer,
  twemoji,
  walk,
};
