import ora from "ora";

import { BastionInstance } from "../../bastion/bastion-instance.js";
import { InitTarget } from "../../target/init-target.js";

export interface AllowTargetAccessInput {
  target: InitTarget;
  bastionInstance: BastionInstance;
}

export async function allowTargetAccess({
  target,
  bastionInstance,
}: AllowTargetAccessInput): Promise<void> {
  if (!target.allowAccess) {
    console.log(
      `Please, make sure that the your target is accessible from the bastion. Bastion security group: ${bastionInstance.securityGroupName}`
    );
    return;
  }

  const spinner = ora();

  await target.allowAccess({
    bastionInstance,
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
