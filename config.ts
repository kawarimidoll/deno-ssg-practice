export const SOURCE_DIR = "docs";
export const BUILD_DIR = "build";
export const SITE_NAME = "Deno SSG site";
export const DEFAULT_FAVICON = "🦕";

import { Page } from "./types.ts";

interface ListDirectory {
  name: string;
  sorter?: (a: Page, b: Page) => number;
}
interface NavbarLink {
  path: string;
  name: string;
}
export const LIST_DIRECTORIES: ListDirectory[] = [
  { name: "lorem" },
];

export const NAVBAR_LINKS: NavbarLink[] = [
  {
    path: "/about",
    name: "About",
  },
  {
    path: "/lorem",
    name: "Lorem",
  },
];
