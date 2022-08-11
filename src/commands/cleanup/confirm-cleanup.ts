import inquirer from "inquirer";
import {
  ManagedResourceGroups,
  ManagedResources,
} from "../../cleanup/managed-resources.js";
import { formatList } from "../../common/format-list.js";

export interface ConfirmCleanupInput {
  resources: ManagedResources;
}

const RESOURCE_GROUP_TITLES: Record<ManagedResourceGroups, string> = {
  accessSecurityGroups: "Access security groups:",
  bastionSecurityGroups: "Bastion security groups:",
  bastionInstances: "Bastion EC2 instances:",
  bastionInstanceProfiles: "Bastion IAM instance profiles:",
  bastionRoles: "Bastion IAM roles:",
};

export async function confirmCleanup({
  resources,
}: ConfirmCleanupInput): Promise<void> {
  console.log("The following resources will be deleted:");

  ManagedResourceGroups.forEach((group) => {
    console.log(RESOURCE_GROUP_TITLES[group]);
    console.log(formatList(resources[group]));
  });

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
