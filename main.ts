import { Marked } from "https://deno.land/x/markdown@v2.0.0/mod.ts";
// import { ensureFileSync } from "https://deno.land/std@0.102.0/fs/mod.ts";

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

if (!filename || !filename.endsWith(".md")) {
  console.log("Please specify .md file as a source!");
  Deno.exit(1);
} else {
  console.log(`Building site with '${filename}' into '${buildPath}'`);
}

const COMPONENT_DELIMITER = "+++";
const content = await Deno.readTextFile(filename);
const components = content.split(COMPONENT_DELIMITER);
const { meta: frontMatter } = Marked.parse(components[0]);
const { title, styles, favicon } = frontMatter;
// console.log(components);
console.log({ title, styles, favicon });

components.forEach((component) => {
  const { content } = Marked.parse(component);

  const match = content.match(/([^\n]*)\n(.*)/s) ?? [];
  const [path, name] = match[1].replace(/<[^>]+>/g, "").split(":");
  const html = match[2].replace(/\n/g, "");
  // console.log({ path, name, html });
  if (path === "layout") {
    layout[name] = html;
  } else {
    pages.push({ path, name, html });
  }
});

console.log({ pages, layout });
