/** Generate XML tag. */
export type Attributes = { [attr: string]: string | number };

export function tag(
  tagName: string,
  attributes: Attributes,
  ...children: string[]
): string {
  const isVoidTag = [
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "keygen",
    "link",
    "meta",
    "param",
    "source",
  ].includes(tagName);

  const attrs = Object.entries(attributes)
    .reduce((acc, [k, v]) => `${acc} ${k}="${v}"`, "");

  const close = isVoidTag ? "" : `${children.join("")}</${tagName}>`;

  return `<${tagName}${attrs}>${close}`;
}

export function rawTag(
  tagName: string,
  ...children: string[]
): string {
  return tag(tagName, {}, ...children);
}

// common-used tags
export function div(
  attributes: Attributes,
  ...children: string[]
): string {
  return tag("div", attributes, ...children);
}

export function a(
  attributes: Attributes,
  ...children: string[]
): string {
  return tag("a", attributes, ...children);
}
