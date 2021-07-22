export interface Page {
  path: string;
  name: string;
  title: string;
  output: string;
  styles: string;
  favicon: string;
  html: string;
  meta?: { [key: string]: string };
}

export interface Layout {
  [key: string]: string;
}
