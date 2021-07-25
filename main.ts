import { ConfigObject, Layout, Page, PageMeta } from "./types.ts";
import { a, div, rawTag as rh, tag as h } from "./tag.ts";
import {
  deployDir,
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

import userConfig from "./config.ts";
import defaultConfig from "./default.config.ts";

const {
  buildDir,
  defaultFavicon,
  listDirectories,
  navbarLinks,
  siteName,
  sourceDir,
  serverFile,
}: ConfigObject = { ...defaultConfig, ...userConfig };

const pages: Page[] = [];
const layout: Layout = {};

if (!existsSync(sourceDir)) {
  console.warn(`SOURCE_DIR: '${sourceDir}' is not exists!`);
  Deno.exit(1);
}
console.log(`Building site with '${sourceDir}' into '${buildDir}'`);

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

for (const entry of walkSync(sourceDir)) {
  if (!entry.isFile || !entry.name.endsWith(".md")) {
    continue;
  }

  const markdown = Deno.readTextFileSync(entry.path);
  const { meta: frontMatter, content } = Marked.parse(markdown);

  // check html
  const dom = domParser.parseFromString(content, "text/html");
  if (!dom) {
    console.warn("invalid html");
    continue;
  }

  const relativePath = relative(sourceDir, entry.path);

  if (relativePath.startsWith("layouts")) {
    // use filename without extensions
    const layoutName = entry.name.replace(/\.[^.]+$/, "");
    layout[layoutName] = content;
    continue;
  }

  // console.log(...markdown.matchAll(/^#+ .+\n/gm));

  // console.log({ relativePath });
  const path = "/" + relativePath.replace(/\.md$/, ".html");
  const { title: pageTitle, styles, favicon = defaultFavicon } = frontMatter;

  const name = dom.getElementsByTagName("h1")[0]?.textContent || "";
  const title = (path === "/" ? "" : `${pageTitle || name} | `) + siteName;

  const headerLinks = [...dom.querySelectorAll("h2,h3")].map((node) => {
    const { nodeName, textContent: text, attributes } = node as Element;
    // nodeName is 'H2', 'H3', 'H4', 'H5', 'H6'
    const level = Number(nodeName.slice(1)) - 2;
    return `${"  ".repeat(level)}- [${text}](#${attributes.id})`;
  });

  const { content: toc } = Marked.parse(headerLinks.join("\n"));
  const meta: PageMeta = { styles, favicon };

  const html = h("div", { id: "toc" }, toc) + content;
  pages.push({ path, title, html, name, meta });
}

const defaultSorter = (a: Page, b: Page) => a.path > b.path ? 1 : -1;
listDirectories.forEach(({ dir, name, sorter }) => {
  name ||= dir;

  if (!dir.startsWith("/")) {
    dir = "/" + dir;
  }

  const listed = pages.filter((page) => page.path.startsWith(dir));
  listed.sort(sorter || defaultSorter);

  const links = listed.map((page, idx) => {
    // generate neighbor links
    page.meta ??= {};
    if (!page.meta.prev && listed[idx - 1]) {
      page.meta.prev = listed[idx - 1].path;
    }
    if (!page.meta.next && listed[idx + 1]) {
      page.meta.next = listed[idx + 1].path;
    }

    return `- [${page.name}](${page.path})`;
  });

  const { content: html } = Marked.parse(links.join("\n"));

  const title = `${name} | ${siteName}`;
  const path = dir + ".html";
  pages.push({ path, title, html, name });
});

console.log({ build: pages.map((page) => page.path).sort() });

const getPageByPath = (path: string) =>
  pages.find((page) => page.path === path);

const genNavbar = (currentPath: string) =>
  div(
    { id: "nav", style: "display:flex;align-items:stretch;" },
    div({}, a({ href: "/" }, siteName)),
    div(
      { style: "display:flex;flex:1;justify-content: flex-end;" },
      navbarLinks.map(({ path, name }) => {
        const selected = path === currentPath ? "selected" : "";
        return a(
          { class: `nav-item ${selected}`, href: path },
          name || getPageByPath(path)?.name ||
            path.replace(/^\/(.)/, (_, w) => w.toLocaleUpperCase()),
        );
      }).join(" | "),
    ),
  );

const genHtml = (
  { path, html, title, meta = {} }: Page,
) => {
  const { styles, favicon = defaultFavicon } = meta;
  return "<!DOCTYPE html>" +
    rh(
      "html",
      rh(
        "head",
        h("meta", { charset: "utf-8" }),
        rh("title", title),
        styles ? rh("style", styles) : "",
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
};

const minifyOptions = { minifyCSS: true, minifyJS: true };
pages.forEach((page) => {
  const outputPath = join(buildDir, page.path);
  ensureFileSync(outputPath);
  Deno.writeTextFileSync(outputPath, minifyHTML(genHtml(page), minifyOptions));
});

deployDir([buildDir, "-y", "-o", serverFile]);
