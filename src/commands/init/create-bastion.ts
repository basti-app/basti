import { Bastion } from "../../bastion/bastion.js";
import * as bastionOps from "../../bastion/create-bastion.js";
import { cli } from "../../common/cli.js";
import { fmt } from "../../common/fmt.js";

export interface CreateBastionInput {
  vpcId: string;
  subnetId: string;
}

export async function createBastion({
  vpcId,
  subnetId,
}: CreateBastionInput): Promise<Bastion> {
  const subCli = cli.createSubInstance({ indent: 2 });

  cli.info(`${green("❯")} Creating bastion:`);

  const bastion = await bastionOps.createBastion({
    vpcId,
    subnetId,
    hooks: {
      onImageIdRetrievalStarted: () =>
        subCli.progressStart("Retrieving the latest EC2 AMI"),
      onImageIdRetrieved: (imageId) =>
        subCli.progressSuccess(`EC2 AMI retrieved: ${fmt.value(imageId)}`),

      onRoleCreationStarted: () => subCli.progressStart("Creating IAM role"),
      onRoleCreated: (roleName) =>
        subCli.progressSuccess(`IAM role created: ${fmt.value(roleName)}`),

      onSecurityGroupCreationStarted: () =>
        subCli.progressStart("Creating security group"),
      onSecurityGroupCreated: (sgId) =>
        subCli.progressSuccess(`Security group created: ${fmt.value(sgId)}`),

      onInstanceCreationStarted: () =>
        subCli.progressStart("Creating EC2 instance"),
      onInstanceCreated: (instanceId) =>
        subCli.progressSuccess(
          `EC2 instance created: ${fmt.value(instanceId)}`
        ),
    },
  });

  cli.progressSuccess(`Bastion created: ${bastion.id}`);

  return bastion;
}

function green(str: string): string {
  return `\x1b[32m${str}\x1b[0m`;
}
