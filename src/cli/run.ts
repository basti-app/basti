import { readFileSync } from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { handleCleanup } from "./commands/cleanup/cleanup.js";
import { handleConnect } from "./commands/connect/connect.js";
import { handleInit } from "./commands/init/init.js";
import { handleAsyncErrors, withErrorHandling } from "./error/handle-error.js";
import { conflictingOptions } from "./yargs/conflicting-options-check.js";
import { optionGroup } from "./yargs/option-group-check.js";

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
        .option("rds-instance", {
          type: "string",
          description: "ID of the RDS instance to be initialized",
        })
        .option("rds-cluster", {
          type: "string",
          description: "ID of the RDS cluster to be initialized",
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
          conflictingOptions("rds-cluster", "rds-instance", "custom-target-vpc")
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
    (yargs) =>
      yargs
        .option("rds-instance", {
          type: "string",
          description: "ID of the RDS instance to connect to",
        })
        .option("rds-cluster", {
          type: "string",
          description: "ID of the RDS cluster to connect to",
        })
        .option("custom-target-vpc", {
          type: "string",
          description: "VPC of the custom connection target",
        })
        .option("custom-target-host", {
          type: "string",
          description:
            "Host name or IP address of the custom connection target",
        })
        .option("custom-target-port", {
          type: "number",
          description: "Port of the custom connection target",
        })
        .option("local-port", {
          type: "number",
          description: "Local port to forward the target to",
        })
        .check(
          conflictingOptions("rds-instance", "rds-cluster", [
            "custom-target-vpc",
            "custom-target-host",
            "custom-target-port",
          ])
        )
        .check(
          optionGroup(
            "custom-target-vpc",
            "custom-target-host",
            "custom-target-port"
          )
        ),
    withErrorHandling(
      async ({
        rdsInstance,
        rdsCluster,
        customTargetVpc,
        customTargetHost,
        customTargetPort,
        localPort,
      }) => {
        const target = rdsInstance
          ? { rdsInstanceId: rdsInstance }
          : rdsCluster
          ? { rdsClusterId: rdsCluster }
          : customTargetVpc && customTargetHost && customTargetPort
          ? {
              customTargetVpcId: customTargetVpc,
              customTargetHost,
              customTargetPort,
            }
          : undefined;
        await handleConnect({ target, localPort });
      }
    )
  )
  .command(
    "cleanup",
    "Remove all resources created by Basti",
    (yargs) =>
      yargs.option("confirm", {
        type: "boolean",
        alias: ["c", "y"],
        description: "Automatically confirm cleanup",
      }),
    withErrorHandling(async ({ confirm }) => handleCleanup({ confirm }))
  )
  .demandCommand(1)
  .strict()
  .parse();
