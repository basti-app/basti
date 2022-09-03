import * as cleanupOps from "../../../cleanup/get-resources-to-cleanup.js";
import {
  ManagedResourceGroup,
  ManagedResources,
} from "../../../cleanup/managed-resources.js";
import { cli } from "../../../common/cli.js";
import { fmt } from "../../../common/fmt.js";
import { getErrorDetail } from "../../error/get-error-detail.js";

const RESOURCE_GROUP_NAMES: Record<ManagedResourceGroup, string> = {
  [ManagedResourceGroup.ACCESS_SECURITY_GROUP]: "Access security groups",
  [ManagedResourceGroup.BASTION_SECURITY_GROUP]: "Bastion security groups",
  [ManagedResourceGroup.BASTION_INSTANCE]: "Bastion EC2 instances",
  [ManagedResourceGroup.BASTION_INSTANCE_PROFILE]:
    "Bastion IAM instance profiles",
  [ManagedResourceGroup.BASTION_ROLE]: "Bastion IAM roles",
};

export async function getResourcesToCleanup(): Promise<ManagedResources> {
  const subCli = cli.createSubInstance({ indent: 2 });

  let partialFailure = false;

  cli.out(`${fmt.green("❯")} Retrieving Basti-managed resources:`);
  const managedResources = await cleanupOps.getResourcesToCleanup({
    hooks: {
      onRetrievingResources: (group) =>
        subCli.progressStart(RESOURCE_GROUP_NAMES[group]),
      onResourcesRetrieved: () => subCli.progressSuccess(),
      onRetrievalFailed: (_, error) => {
        partialFailure = true;
        const warnText = getErrorDetail(error);
        subCli.progressWarn({ warnText });
      },
    },
  });

  partialFailure
    ? cli.progressWarn({
        text: "Managed resources retrieved",
        warnText:
          "Not all the resources were retrieved. The account cannot be fully cleaned up",
      })
    : cli.progressSuccess("Managed resources retrieved");

  return managedResources;
}
