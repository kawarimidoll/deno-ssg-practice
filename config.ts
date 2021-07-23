export const SOURCE_DIR = "docs";
export const BUILD_DIR = "build";
export const SITE_NAME = "Deno SSG site";
export const DEFAULT_FAVICON = "🦕";

import { Page } from "./types.ts";

interface ListDirectory {
  dir: string;
  name?: string;
  sorter?: (a: Page, b: Page) => number;
}
interface NavbarLink {
  path: string;
  name?: string;
}
export const LIST_DIRECTORIES: ListDirectory[] = [
  { dir: "lorem", name: "Lorem" },
];

export const NAVBAR_LINKS: NavbarLink[] = [
  {
    path: "/about",
  },
  {
    path: "/lorem",
  },
];
