export default {
  sourceDir: "docs",
  buildDir: "build",
  siteName: "Deno SSG site",
  defaultFavicon: "🦕",

  listDirectories: [
    { dir: "lorem", name: "Lorem" },
  ],

  navbarLinks: [
    {
      path: "/about",
    },
    {
      path: "/lorem",
    },
  ],
};
