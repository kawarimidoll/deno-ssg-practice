// deno-lint-ignore-file no-unused-vars
import { BUILD_DIR, FAVICON, SITE_NAME, SOURCE_DIR } from "./config.ts";
import { ensureFileSync, existsSync, Marked, walkSync } from "./deps.ts";
import { relative } from "https://deno.land/std@0.102.0/path/mod.ts";
import { extname } from "https://deno.land/std@0.102.0/path/mod.ts";

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
  const { meta, content } = Marked.parse(markdown);
  const name = (meta.title ? `${meta.title} | ` : "") + SITE_NAME;
  // const { styles, favicon = FAVICON } = meta;
  // console.log({ name, styles, favicon });
  // console.log(content);
  const relativePath = relative(SOURCE_DIR, entry.path);
  const path = entry.name == "index.md"
    ? relativePath.replace(/\.md$/, ".html")
    : relativePath.replace(/\.md$/, "/index.html");
  console.log(relativePath, "->", path);

  // const html = `<style>${styles}</style>${content}`;
  const html = content;

  if (relativePath.startsWith("layouts")) {
    layout[filename] = html;
  } else {
    pages.push({ path, name, html });
  }
}

console.log({ pages, layout });
//
// const isHomePath = (path: string) => path === HOME_PATH;
// const getStylesheetHref = (path: string) =>
//   (isHomePath(path) ? "" : "../") + STYLESHEET_PATH;
// const getFaviconSvg = (emoji?: string) =>
//   `<svg xmlns="http://www.w3.org/2000/svg"><text y="32" font-size="32">${emoji ||
//     "🦕"}</text></svg>`;
// const getNavigation = (currentPath: string) =>
//   `<div id="nav">${
//     pages.map(({ path, name }) => {
//       const href = path === HOME_PATH ? "/" : path;
//       const isSelectedPage = path === currentPath;
//       const classes = `nav-item ${isSelectedPage ? "selected" : ""}`;
//       return `<a class="${classes}" href=${href}>${name}</a>`;
//     }).join("")
//   }</div>`;
// const footer = layout.footer ? `<div id="footer">${layout.footer}</div>` : "";
// const getHtmlByPage = ({ path, name, html }: Page) => `
// <!DOCTYPE html>
// <html>
//   <head>
//     <title>${name} | ${title}</title>
//     <link rel="stylesheet" href="${getStylesheetHref(path)}">
//     <link rel="icon" href="/favicon.svg">
//   </head>
//   <body>
//     <div id="title">
//       ${title}
//     </div>
//     ${getNavigation(path)}
//     <div id="main">
//       ${html}
//     </div>
//     ${footer}
//   </body>
// </html>`;
//
// pages.forEach((page) => {
//   const { path } = page;
//   const outputDir = isHomePath(path) ? "" : path;
//   const outputPath = BUILD_DIR + outputDir + "/index.html";
//   ensureFileSync(outputPath);
//   Deno.writeTextFileSync(outputPath, getHtmlByPage(page));
// });
// Deno.writeTextFileSync(`${BUILD_DIR}/styles.css`, styles || "");
// Deno.writeTextFileSync(`${BUILD_DIR}/favicon.svg`, getFaviconSvg(favicon));
