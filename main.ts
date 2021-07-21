import { BUILD_DIR, FAVICON, SITE_NAME, SOURCE_DIR } from "./config.ts";
import { ensureFileSync, existsSync, Marked, walkSync } from "./deps.ts";
import { relative } from "https://deno.land/std@0.102.0/path/mod.ts";
import {
  dirname,
  extname,
  join,
} from "https://deno.land/std@0.102.0/path/mod.ts";

import twemoji from "https://cdn.skypack.dev/twemoji@v13.1.0?dts";

import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.12-alpha/deno-dom-wasm.ts";
const domParser = new DOMParser();

interface Page {
  path: string;
  name: string;
  title: string;
  output: string;
  styles: string;
  favicon: string;
  html: string;
}

interface Layout {
  // deno-lint-ignore no-explicit-any
  [key: string]: any;
}

const pages: Page[] = [];
const layout: Layout = {};

if (!existsSync(SOURCE_DIR)) {
  console.log(`SOURCE_DIR: '${SOURCE_DIR}' is not exists!`);
  Deno.exit(1);
} else {
  console.log(`Building site with '${SOURCE_DIR}' into '${BUILD_DIR}'`);
}

for (const entry of walkSync(SOURCE_DIR)) {
  if (!entry.isFile || !entry.name.endsWith(".md")) {
    continue;
  }
  const ext = extname(entry.name);
  const filename = entry.name.replace(ext, "");

  const markdown = Deno.readTextFileSync(entry.path);
  const { meta, content: html } = Marked.parse(markdown);
  const dom = domParser.parseFromString(html, "text/html");
  if (!dom) {
    console.warn("invalid html");
    continue;
  }
  const h1 = dom.getElementsByTagName("h1");
  const name = h1[0]?.textContent || "";
  const title = (meta.title ? `${meta.title} | ` : "") + SITE_NAME;
  const { styles, favicon = FAVICON } = meta;
  // console.log({ name, styles, favicon });
  // console.log(content);
  const relativePath = relative(SOURCE_DIR, entry.path);
  const output = entry.name == "index.md"
    ? relativePath.replace(/\.md$/, ".html")
    : relativePath.replace(/\.md$/, "/index.html");
  console.log(relativePath, "->", output, dirname(output));
  console.log(twemoji.convert.toCodePoint(favicon));
  const dir = dirname(output);
  const path = "/" + dir.replace(/^\.$/, "");

  if (relativePath.startsWith("layouts")) {
    layout[filename] = html;
  } else {
    pages.push({ path, styles, favicon, output, title, html, name });
  }
}

console.log({ pages, layout });

const getNavigation = (currentPath: string) =>
  `<div id="nav">${
    pages.map(({ path, name }) => {
      const isSelectedPage = path === currentPath;
      const classes = `nav-item ${isSelectedPage ? "selected" : ""}`;
      return `<a class="${classes}" href=${path}>${name}</a>`;
    }).join(" | ")
  }</div>`;

const footer = layout.footer ? `<div id="footer">${layout.footer}</div>` : "";

// https://zenn.dev/catnose99/articles/3d2f439e8ed161
const genEmojiFavicon = (favicon: string) => `
<link rel="icon" type="image/png" href="https://twemoji.maxcdn.com/v/13.0.2/72x72/${
  twemoji.convert.toCodePoint(favicon)
}.png" />
`;

const getHtmlByPage = ({ path, styles, favicon, title, html }: Page) => `
<!DOCTYPE html>
<html>
  <head>
    <title>${title}</title>
    <style>${styles}</style>
    ${genEmojiFavicon(favicon)}
  </head>
  <body>
    ${getNavigation(path)}
    <div id="main">
      ${html}
    </div>
    ${footer}
  </body>
</html>`;

pages.forEach((page) => {
  const outputPath = join(BUILD_DIR, page.output);
  ensureFileSync(outputPath);
  Deno.writeTextFileSync(outputPath, getHtmlByPage(page));
});
