import { readFileSync } from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { handleCleanup } from "./commands/cleanup/cleanup.js";
import { handleConnect } from "./commands/connect/connect.js";
import { handleInit } from "./commands/init/init.js";
import { handleAsyncErrors, withErrorHandling } from "./error/handle-error.js";
import { conflictingOptions } from "./yargs/conflicting-options-check.js";

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
    "Set up a target to use with Basti",
    (yargs) =>
      yargs
        .option("rds-cluster", {
          type: "string",
          description: "ID of the RDS cluster to be initialized",
        })
        .option("rds-instance", {
          type: "string",
          description: "ID of the RDS instance to be initialized",
        })
        .option("custom-target-vpc", {
          type: "string",
          description: "VPC of the custom target to be initialized",
        })
        .option("bastion-subnet", {
          type: "string",
          description: "ID of the public VPC subnet for the bastion instance",
        })
        .check(
          conflictingOptions("rds-cluster", "rds-instance", [
            "custom-target-vpc",
            "test",
          ])
        ),
    withErrorHandling(
      async ({ rdsInstance, rdsCluster, customTargetVpc, bastionSubnet }) => {
        const target = rdsInstance
          ? { rdsInstanceId: rdsInstance }
          : rdsCluster
          ? { rdsClusterId: rdsCluster }
          : customTargetVpc
          ? { customTargetVpcId: customTargetVpc }
          : undefined;
        await handleInit({ target: target, bastionSubnet });
      }
    )
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
    withErrorHandling(handleCleanup)
  )
  .demandCommand(1)
  .strict()
  .parse();
