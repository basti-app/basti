import ora from "ora";

import { Bastion } from "../../bastion/bastion.js";
import * as bastionOps from "../../bastion/create-bastion.js";
import { cli } from "../../common/cli.js";

export interface CreateBastionInput {
  vpcId: string;
  subnetId: string;
}

export async function createBastion({
  vpcId,
  subnetId,
}: CreateBastionInput): Promise<Bastion> {
  const spinner = ora();
  const subSpinner = ora({ indent: 2 });

  cli.info(`${green("❯")} Creating bastion:`);

  const bastion = await bastionOps.createBastion({
    vpcId,
    subnetId,
    hooks: {
      onImageIdRetrievalStarted: () =>
        subSpinner.start("Retrieving the latest EC2 AMI"),
      onImageIdRetrieved: (imageId) =>
        subSpinner.succeed(`EC2 AMI retrieved: ${imageId}`),

      onRoleCreationStarted: () => subSpinner.start("Creating IAM role"),
      onRoleCreated: (roleName) =>
        subSpinner.succeed(`IAM role created: ${roleName}`),

      onSecurityGroupCreationStarted: () =>
        subSpinner.start("Creating security group"),
      onSecurityGroupCreated: (sgId) =>
        subSpinner.succeed(`Security group created: ${sgId}`),

      onInstanceCreationStarted: () =>
        subSpinner.start("Creating EC2 instance"),
      onInstanceCreated: (instanceId) =>
        subSpinner.succeed(`EC2 instance created: ${instanceId}`),
    },
  });

  spinner.succeed(`Bastion created: ${bastion.id}`);

  return bastion;
}

function green(str: string): string {
  return `\x1b[32m${str}\x1b[0m`;
}
