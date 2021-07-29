import { ConfigObject } from "./types.ts";
import userConfig from "./config.ts";
import defaultConfig from "./default.config.ts";

import deployctl from "https://deno.land/x/deploy@0.3.0/src/subcommands/run.ts";

const {
  serverFile,
}: ConfigObject = { ...defaultConfig, ...userConfig };
// cmd: deployctl run --watch server.js
const rawArgs = {
  addr: ":8080",
  check: true,
  libs: "ns,window,fetchevent",
  watch: true,
  "_": [serverFile],
};
console.log({ rawArgs });

export async function runServer() {
  await deployctl(rawArgs);
}
