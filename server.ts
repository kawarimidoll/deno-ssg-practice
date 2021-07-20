/// <reference path="./deploy.d.ts" />

import mime from "https://cdn.skypack.dev/mime@2.5.2/lite?dts";
import ky from "https://cdn.skypack.dev/ky@0.28.5?dts";

async function handleRequest(request: Request) {
  const { pathname } = new URL(request.url);

  const filename = "./build" + (pathname === "/" ? "" : pathname) +
    (pathname.includes(".") ? "" : "/index.html");

  const file = new URL(filename, import.meta.url);
  console.log(file);

  const ext = file.href.replace(/^.*\.([^.]+)$/, "$1");
  const type = mime.getType(ext);
  console.log({ pathname, ext, type });

  return new Response(
    await ky(file).text(),
    {
      headers: {
        "content-type": `${type}; charset=utf-8`,
      },
    },
  );
}

addEventListener("fetch", (event: FetchEvent) => {
  event.respondWith(handleRequest(event.request));
});
