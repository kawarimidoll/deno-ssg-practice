export interface Page {
  path: string;
  name: string;
  title: string;
  output: string;
  styles: string;
  favicon: string;
  html: string;
  meta?: PageMeta;
}

export interface PageMeta {
  title?: string;
  styles?: string;
  favicon?: string;
  prev?: string;
  next?: string;
  date?: string;
}

export interface Layout {
  [key: string]: string;
}
