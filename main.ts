const [filename, buildPath = "./build"] = Deno.args;

console.log(filename, buildPath);

if (!filename) {
  console.log("Please specify .md file as a source!");
  Deno.exit(1);
} else {
  console.log(`Building site with '${filename}' into '${buildPath}'`);
}
