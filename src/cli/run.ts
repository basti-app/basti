import { readFileSync } from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { handleCleanup } from "./commands/cleanup/cleanup.js";
import { handleConnect } from "./commands/connect/connect.js";
import { handleInit } from "./commands/init/init.js";
import { handleAsyncErrors, withErrorHandling } from "./error/handle-error.js";

const pkg: {
  version: string;
} = JSON.parse(
  readFileSync(new URL("../../package.json", import.meta.url)).toString()
);

handleAsyncErrors();

yargs(hideBin(process.argv))
  .version(pkg.version)
  .command(
    "init",
    "Set up the aws account to use Basti",
    () => {},
    withErrorHandling(handleInit)
  )
  .command(
    "connect",
    "Start port forwarding session to the selected target",
    () => {},
    withErrorHandling(handleConnect)
  )
  .command(
    "cleanup",
    "Remove all resources created by Basti",
    (yargs) => yargs,
    handleCleanup
  )
  .demandCommand(1)
  .strict()
  .parse();
