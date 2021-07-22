import {
  assert,
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.102.0/testing/asserts.ts";

import { Marked, Renderer } from "https://deno.land/x/markdown@v2.0.0/mod.ts";

import {
  ensureFileSync,
  existsSync,
  walkSync,
} from "https://deno.land/std@0.102.0/fs/mod.ts";

import {
  dirname,
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

export {
  assert,
  assertEquals,
  assertThrows,
  dirname,
  domParser,
  Element,
  ensureFileSync,
  existsSync,
  join,
  Marked,
  minifyHTML,
  relative,
  Renderer,
  twemoji,
  walkSync,
};
