import { readFileSync } from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { handleInit } from "./commands/init/init.js";

const pkg: {
  version: string;
} = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url)).toString()
);

yargs(hideBin(process.argv))
  .version(pkg.version)
  .command("init", "Initialize bastion instance", (yargs) => yargs, handleInit)
  .demandCommand(1)
  .strict()
  .parse();
