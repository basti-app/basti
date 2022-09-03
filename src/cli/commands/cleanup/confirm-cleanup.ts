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
  [ManagedResourceGroup.ACCESS_SECURITY_GROUP]: "Access security groups",
  [ManagedResourceGroup.BASTION_SECURITY_GROUP]: "Bastion security groups",
  [ManagedResourceGroup.BASTION_INSTANCE]: "Bastion EC2 instances",
  [ManagedResourceGroup.BASTION_INSTANCE_PROFILE]:
    "Bastion IAM instance profiles",
  [ManagedResourceGroup.BASTION_ROLE]: "Bastion IAM roles",
};

export async function confirmCleanup({
  resources,
}: ConfirmCleanupInput): Promise<void> {
  if (isEmpty(resources)) {
    cli.info("No Basti-managed resources found in your account");
    process.exit(0);
  }

  printResources(resources);

  const { confirm } = await inquirer.prompt({
    type: "confirm",
    name: "confirm",
    message: "Proceed to cleanup?",
    default: true,
  });

  if (!confirm) {
    process.exit(0);
  }
}

function isEmpty(resources: ManagedResources): boolean {
  return Object.values(resources).every((group) => group.length === 0);
}

function printResources(resources: ManagedResources) {
  const subCli = cli.createSubInstance({ indent: 2 });

  cli.out("The following resources will be deleted:");

  ManagedResourceGroups.filter((group) => resources[group].length > 0).forEach(
    (group) => {
      cli.out(`${RESOURCE_GROUP_TITLES[group]}`);
      subCli.out(fmt.list(resources[group].map(fmt.value)));
    }
  );
}
