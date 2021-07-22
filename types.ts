export interface Page {
  path: string;
  name: string;
  title: string;
  output: string;
  styles: string;
  favicon: string;
  html: string;
  toc?: TocItem[];
}

export interface TocItem {
  level: number;
  text: string;
  href: string;
}

export interface Layout {
  // deno-lint-ignore no-explicit-any
  [key: string]: any;
}
