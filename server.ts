/// <reference path="./deploy.d.ts" />

async function handleRequest(request: Request) {
  const { pathname } = new URL(request.url);

  const filename = "./build" + (pathname === "/" ? "" : pathname) +
    (pathname.includes(".") ? "" : "/index.html");

  const file = new URL(filename, import.meta.url);
  console.log(file);
  const type = pathname.endsWith(".css")
    ? "text/css"
    : pathname.endsWith(".svg")
    ? "image/svg+xml"
    : "text/html";

  const content = await fetch(file);
  return new Response(
    await content.text(),
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
