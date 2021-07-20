// deno-lint-ignore-file no-unused-vars
import { Marked } from "https://deno.land/x/markdown@v2.0.0/mod.ts";
import { ensureFileSync } from "https://deno.land/std@0.102.0/fs/mod.ts";

interface Page {
  path: string;
  name: string;
  html: string;
}

interface Layout {
  // deno-lint-ignore no-explicit-any
  [key: string]: any;
}

const pages: Page[] = [];
const layout: Layout = {};

const [filename, buildPath = "./build"] = Deno.args;

console.log(filename, buildPath);

if (!filename) {
  console.log("Please specify .md file as a source!");
  Deno.exit(1);
} else {
  console.log(`Building site with '${filename}' into '${buildPath}'`);
}
