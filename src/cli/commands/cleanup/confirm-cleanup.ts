import inquirer from "inquirer";
import {
  ManagedResourceGroup,
  ManagedResourceGroups,
  ManagedResources,
} from "../../../cleanup/managed-resources.js";
import { cli } from "../../../common/cli.js";
import { fmt } from "../../../common/fmt.js";

export interface ConfirmCleanupInput {
  resources: ManagedResources;
}

const RESOURCE_GROUP_TITLES: Record<ManagedResourceGroup, string> = {
  accessSecurityGroups: "Access security groups:",
  bastionSecurityGroups: "Bastion security groups:",
  bastionInstances: "Bastion EC2 instances:",
  bastionInstanceProfiles: "Bastion IAM instance profiles:",
  bastionRoles: "Bastion IAM roles:",
};

export async function confirmCleanup({
  resources,
}: ConfirmCleanupInput): Promise<void> {
  if (isEmpty(resources)) {
    cli.info("No Basti-managed resources found in your account");
    process.exit(0);
  }

  cli.out("The following resources will be deleted:");

  ManagedResourceGroups.filter((group) => resources[group].length > 0).forEach(
    (group) => {
      cli.out(RESOURCE_GROUP_TITLES[group]);
      cli.out(fmt.list(resources[group].map(fmt.value)));
    }
  );

  const { confirm } = await inquirer.prompt({
    type: "confirm",
    name: "confirm",
    message: "Confirm cleanup?",
    default: true,
  });

  if (!confirm) {
    process.exit(0);
  }
}

function isEmpty(resources: ManagedResources): boolean {
  return Object.values(resources).every((group) => group.length === 0);
}
