import {
  BUILD_DIR,
  DEFAULT_FAVICON,
  LIST_DIRECTORIES,
  NAVBAR_LINKS,
  SITE_NAME,
  SOURCE_DIR,
} from "./config.ts";
import { Layout, Page } from "./types.ts";
import { a, div, rawTag as rh, tag as h } from "./tag.ts";
import {
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
} from "./deps.ts";

const pages: Page[] = [];
const layout: Layout = {};

if (!existsSync(SOURCE_DIR)) {
  console.warn(`SOURCE_DIR: '${SOURCE_DIR}' is not exists!`);
  Deno.exit(1);
}
console.log(`Building site with '${SOURCE_DIR}' into '${BUILD_DIR}'`);

class MyRenderer extends Renderer {
  heading(text: string, level: number) {
    const id = String(text).trim().toLocaleLowerCase().replace(/\s+/g, "-");
    return `<h${level} id="${id}">${text}</h${level}>`;
  }
}
Marked.setOptions({ renderer: new MyRenderer() });

Marked.setBlockRule(/^::: *(\w+)( *\w+)?\n([\s\S]+?)\n:::/, function (execArr) {
  const [, channel, title, content] = execArr ?? [];
  if (!channel) {
    return "";
  }
  const html = Marked.parse(content).content;
  switch (channel) {
    case "details": {
      return `<details><summary>${title}</summary>${html}</details>`;
    }
  }
  return `<div class="${channel}">${html}</div>`;
});

for (const entry of walkSync(SOURCE_DIR)) {
  if (!entry.isFile || !entry.name.endsWith(".md")) {
    continue;
  }

  const markdown = Deno.readTextFileSync(entry.path);
  const { meta, content } = Marked.parse(markdown);

  // check html
  const dom = domParser.parseFromString(content, "text/html");
  if (!dom) {
    console.warn("invalid html");
    continue;
  }

  const relativePath = relative(SOURCE_DIR, entry.path);

  if (relativePath.startsWith("layouts")) {
    // use filename without extensions
    const layoutName = entry.name.replace(/\.[^.]+$/, "");
    layout[layoutName] = content;
    continue;
  }

  // console.log(...markdown.matchAll(/^#+ .+\n/gm));

  const name = dom.getElementsByTagName("h1")[0]?.textContent || "";
  const prefix = entry.name === "index.md" ? "" : "/index";
  const output = relativePath.replace(/\.md$/, `${prefix}.html`);
  const path = "/" + dirname(output).replace(/^\.$/, "");
  const { title: pageTitle, styles, favicon = DEFAULT_FAVICON } = meta;

  const title = (path === "/" ? "" : `${pageTitle || name} | `) + SITE_NAME;

  const headerLinks = [...dom.querySelectorAll("h2,h3")].map((node) => {
    const { nodeName, textContent: text, attributes } = node as Element;
    // nodeName is 'H2', 'H3', 'H4', 'H5', 'H6'
    const level = Number(nodeName.slice(1)) - 2;
    return `${"  ".repeat(level)}- [${text}](#${attributes.id})`;
  });

  const { content: toc } = Marked.parse(headerLinks.join("\n"));

  const html = h("div", { id: "toc" }, toc) + content;
  pages.push({ path, styles, favicon, output, title, html, name });
}

const defaultSorter = (a: Page, b: Page) => a.path > b.path ? 1 : -1;
LIST_DIRECTORIES.forEach(({ name, sorter }) => {
  const path = "/" + name;
  const listed = pages.filter((page) => page.path.startsWith(path));
  listed.sort(sorter || defaultSorter);

  const links = listed.map((page, idx) => {
    // generate neighbor links
    page.meta ??= {};
    if (!page.meta.prev && pages[idx - 1]) {
      page.meta.prev = pages[idx - 1].path;
    }
    if (!page.meta.next && pages[idx + 1]) {
      page.meta.next = pages[idx + 1].path;
    }

    return `- [${page.name}](${page.path})`;
  });

  const { content: html } = Marked.parse(links.join("\n"));

  const title = `${name} | ${SITE_NAME}`;
  const output = name + "/index.html";
  const styles = "";
  const favicon = DEFAULT_FAVICON;
  pages.push({ path, styles, favicon, output, title, html, name });
});

// console.log(pages);

const getPageByPath = (path: string) =>
  pages.find((page) => page.path === path);

const genNavbar = (currentPath: string) =>
  div(
    { id: "nav", style: "display:flex;align-items:stretch;" },
    div({}, a({ href: "/" }, SITE_NAME)),
    div(
      { style: "display:flex;flex:1;justify-content: flex-end;" },
      NAVBAR_LINKS.map(({ path, name }) => {
        const selected = path === currentPath ? "selected" : "";
        return a({ class: `nav-item ${selected}`, href: path }, name);
      }).join(" | "),
    ),
  );

const genHtml = (
  { path, styles, favicon, title, html, meta = {} }: Page,
) =>
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
      genNavbar(path),
      div({ id: "main" }, html),
      div(
        { id: "neighbors" },
        meta.prev
          ? a(
            { href: meta.prev },
            "< " + (getPageByPath(meta.prev)?.name || meta.prev),
          )
          : "",
        meta.prev && meta.next ? rh("span", " | ") : "",
        meta.next
          ? a(
            { href: meta.next },
            (getPageByPath(meta.next)?.name || meta.next) + " >",
          )
          : "",
      ),
      layout.footer ? div({ id: "footer" }, layout.footer) : "",
    ),
  );

const minifyOptions = { minifyCSS: true, minifyJS: true };
pages.forEach((page) => {
  const outputPath = join(BUILD_DIR, page.output);
  ensureFileSync(outputPath);
  Deno.writeTextFileSync(outputPath, minifyHTML(genHtml(page), minifyOptions));
});
