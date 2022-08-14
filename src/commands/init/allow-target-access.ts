import ora from "ora";

import { Bastion } from "../../bastion/bastion.js";
import { cli } from "../../common/cli.js";
import { InitTarget } from "../../target/init-target.js";

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
      `Please, make sure your target is accessible from the bastion. Bastion security group: ${bastion.securityGroupName}`
    );
    return;
  }

  const spinner = ora();

  await target.allowAccess({
    bastionInstance: bastion,
    hooks: {
      onSecurityGroupCreationStarted: () =>
        spinner.start("Creating security group for your target"),
      onSecurityGroupCreated: (sgId) =>
        spinner.succeed(`Security group created: ${sgId}`),

      onSecurityGroupAttachmentStarted: () =>
        spinner.start("Attaching security group to your target"),
      onSecurityGroupAttached: () => spinner.succeed("Security group attached"),
    },
  });
}
