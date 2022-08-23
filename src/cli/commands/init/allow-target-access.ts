import { Bastion } from "../../../bastion/bastion.js";
import { cli } from "../../../common/cli.js";
import { fmt } from "../../../common/fmt.js";
import { InitTarget } from "../../../target/init-target.js";
import { OperationError } from "../../error/operation-error.js";

export interface AllowTargetAccessInput {
  target: InitTarget;
  bastion: Bastion;
}

export async function allowTargetAccess({
  target,
  bastion,
}: AllowTargetAccessInput): Promise<void> {
  if (!target.allowAccess) {
    cli.info(
      `Please, make sure your target is accessible from the bastion instance. Bastion security group: ${fmt.value(
        bastion.securityGroupName
      )}`
    );
    return;
  }

  const subCli = cli.createSubInstance({ indent: 2 });

  try {
    cli.info(`${fmt.green("❯")} Configuring target access:`);
    await target.allowAccess({
      bastionInstance: bastion,
      hooks: {
        onCreatingSecurityGroup: () =>
          subCli.progressStart("Creating access security group"),
        onSecurityGroupCreated: (sgId) =>
          subCli.progressSuccess(`Access security group created: ${sgId}`),

        onAttachingSecurityGroup: () =>
          subCli.progressStart("Attaching security group to your target"),
        onSecurityGroupAttached: () =>
          subCli.progressSuccess("Access security group attached"),
      },
    });
    cli.progressSuccess("Target configured");
  } catch (error) {
    subCli.progressFailure();

    throw OperationError.from("configuring target access", error, []);
  }
}
