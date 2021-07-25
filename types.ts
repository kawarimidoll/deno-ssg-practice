export interface Page {
  path: string;
  name: string;
  title: string;
  html: string;
  meta?: PageMeta;
}

export interface PageMeta {
  styles?: string;
  favicon?: string;
  prev?: string;
  next?: string;
  date?: string;
}

export interface Layout {
  [key: string]: string;
}

export interface ListDirectory {
  dir: string;
  name?: string;
  sorter?: (a: Page, b: Page) => number;
}
export interface NavbarLink {
  path: string;
  name?: string;
}
export interface ConfigObject {
  sourceDir: string;
  buildDir: string;
  serverFile: string;
  siteName: string;
  defaultFavicon: string;

  listDirectories: ListDirectory[];

  navbarLinks: NavbarLink[];
}
