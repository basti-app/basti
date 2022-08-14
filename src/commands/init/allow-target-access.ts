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

  await target.allowAccess({
    bastionInstance: bastion,
    hooks: {
      onSecurityGroupCreationStarted: () =>
        cli.progressStart("Creating security group for your target"),
      onSecurityGroupCreated: (sgId) =>
        cli.progressSuccess(`Security group created: ${sgId}`),

      onSecurityGroupAttachmentStarted: () =>
        cli.progressStart("Attaching security group to your target"),
      onSecurityGroupAttached: () =>
        cli.progressSuccess("Security group attached"),
    },
  });
}
