import inquirer from "inquirer";
import {
  CLEANUP_ORDER,
  ManagedResources,
} from "../../../cleanup/managed-resources.js";
import { cli } from "../../../common/cli.js";
import { fmt } from "../../../common/fmt.js";
import { ManagedResourceType } from "../../../common/resource-type.js";

export interface ConfirmCleanupInput {
  resources: ManagedResources;
}

const RESOURCE_GROUP_TITLES: Record<ManagedResourceType, string> = {
  [ManagedResourceType.ACCESS_SECURITY_GROUP]: "Access security groups",
  [ManagedResourceType.BASTION_SECURITY_GROUP]: "Bastion security groups",
  [ManagedResourceType.BASTION_INSTANCE]: "Bastion EC2 instances",
  [ManagedResourceType.BASTION_INSTANCE_PROFILE]:
    "Bastion IAM instance profiles",
  [ManagedResourceType.BASTION_ROLE]: "Bastion IAM roles",
};

export async function confirmCleanup({
  resources,
}: ConfirmCleanupInput): Promise<void> {
  if (isEmpty(resources)) {
    cli.success("No Basti-managed resources found in your account");
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

  cli.info("The following resources are going to be deleted:");

  CLEANUP_ORDER.filter((group) => resources[group].length > 0).forEach(
    (group) => {
      cli.out(`${RESOURCE_GROUP_TITLES[group]}`);
      subCli.out(fmt.list(resources[group].map(fmt.value)));
    }
  );
}
