import { BUILD_DIR, FAVICON, SITE_NAME, SOURCE_DIR } from "./config.ts";
import { Layout, Page, TocItem } from "./types.ts";
import { a, div, rawTag as rh, tag as h } from "./tag.ts";
import {
  dirname,
  domParser,
  ensureFileSync,
  existsSync,
  join,
  Marked,
  minifyHTML,
  relative,
  twemoji,
  walkSync,
} from "./deps.ts";

const pages: Page[] = [];
const layout: Layout = {};

if (!existsSync(SOURCE_DIR)) {
  console.warn(`SOURCE_DIR: '${SOURCE_DIR}' is not exists!`);
  Deno.exit(1);
}
console.log(`Building site with '${SOURCE_DIR}' into '${BUILD_DIR}'`);

for (const entry of walkSync(SOURCE_DIR)) {
  if (!entry.isFile || !entry.name.endsWith(".md")) {
    continue;
  }

  const markdown = Deno.readTextFileSync(entry.path);
  const { meta, content: html } = Marked.parse(markdown);

  // check html
  const dom = domParser.parseFromString(html, "text/html");
  if (!dom) {
    console.warn("invalid html");
    continue;
  }

  const relativePath = relative(SOURCE_DIR, entry.path);

  if (relativePath.startsWith("layouts")) {
    // use filename without extensions
    const layoutName = entry.name.replace(/\.[^.]+$/, "");
    layout[layoutName] = html;
    continue;
  }

  const name = dom.getElementsByTagName("h1")[0]?.textContent || "";
  const prefix = entry.name === "index.md" ? "" : "/index";
  const output = relativePath.replace(/\.md$/, `${prefix}.html`);
  const path = "/" + dirname(output).replace(/^\.$/, "");
  const { title: pageTitle, styles, favicon = FAVICON } = meta;

  const title = (path === "/" ? "" : `${pageTitle || name} | `) + SITE_NAME;

  const toc: TocItem[] = [...dom.querySelectorAll("h2,h3")].map((elm) => {
    const { nodeName, textContent: text, attributes }: {
      nodeName: string;
      textContent: string;
      attributes?: Record<string, string>;
    } = elm;
    const href = attributes?.id || "";
    // nodeName is 'H2', 'H3', 'H4', 'H5', 'H6'
    const level = Number(nodeName.slice(1));
    return { level, text, href };
  });
  pages.push({ path, styles, favicon, output, title, html, name, toc });
}

// console.log({ pages, layout });
pages.forEach((page) => console.log(page.toc));

const genHtml = ({ path: currentPath, styles, favicon, title, html }: Page) =>
  "<!DOCTYPE html>" +
  rh(
    "html",
    rh(
      "head",
      rh("title", title),
      rh("style", styles),
      h("link", {
        // https://zenn.dev/catnose99/articles/3d2f439e8ed161
        rel: "icon",
        type: "image/png",
        href: `https://twemoji.maxcdn.com/v/13.0.2/72x72/${
          twemoji.convert.toCodePoint(favicon)
        }.png`,
      }),
    ),
    rh(
      "body",
      div(
        { id: "nav" },
        pages.map(({ path, name }) => {
          const selected = path === currentPath ? "selected" : "";
          return a({ class: `nav-item ${selected}`, href: path }, name);
        }).join(" | "),
      ),
      div({ id: "main" }, html),
      layout.footer ? div({ id: "footer" }, layout.footer) : "",
    ),
  );

const minifyOptions = { minifyCSS: true, minifyJS: true };
pages.forEach((page) => {
  const outputPath = join(BUILD_DIR, page.output);
  ensureFileSync(outputPath);
  Deno.writeTextFileSync(outputPath, minifyHTML(genHtml(page), minifyOptions));
});
