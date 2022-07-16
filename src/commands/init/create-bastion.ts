import ora from "ora";

import { BastionInstance } from "../../bastion/bastion-instance.js";
import { createBastionInstance } from "../../bastion/create-bastion-instance.js";

export interface CreateBastionInput {
  vpcId: string;
  subnetId: string;
}

export async function createBastion({
  vpcId,
  subnetId,
}: CreateBastionInput): Promise<BastionInstance> {
  const spinner = ora();

  return createBastionInstance({
    vpcId,
    subnetId,
    hooks: {
      onImageIdRetrievalStarted: () =>
        spinner.start("Retrieving the latest EC2 AMI"),
      onImageIdRetrieved: (imageId) =>
        spinner.succeed(`EC2 AMI retrieved: ${imageId}`),

      onRoleCreationStarted: () => spinner.start("Creating IAM role"),
      onRoleCreated: (roleName) =>
        spinner.succeed(`IAM role created: ${roleName}`),

      onSecurityGroupCreationStarted: () =>
        spinner.start("Creating security group"),
      onSecurityGroupCreated: (sgId) =>
        spinner.succeed(`Security group created: ${sgId}`),

      onInstanceCreationStarted: () => spinner.start("Creating EC2 instance"),
      onInstanceCreated: (instanceId) =>
        spinner.succeed(`EC2 instance created: ${instanceId}`),
    },
  });
}
