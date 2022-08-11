import ora from "ora";
import { getManagedResources } from "../../cleanup/get-managed-resources.js";
import { ManagedResources } from "../../cleanup/managed-resources.js";

export async function getResourcesToCleanup(): Promise<ManagedResources> {
  const spinner = ora();

  const managedResources = await getManagedResources({
    hooks: {
      onRetrievingAccessSecurityGroups: () =>
        spinner.start("Retrieving access security groups"),
      onRetrievingBastionSecurityGroups: () =>
        spinner.start("Retrieving bastion security groups"),
      onRetrievingBastionInstances: () =>
        spinner.start("Retrieving bastion instances"),
      onRetrievingBastionRoles: () =>
        spinner.start("Retrieving bastion IAM roles"),
      onRetrievingBastionInstanceProfiles: () =>
        spinner.start("Retrieving bastion IAM instance profiles"),
    },
  });

  spinner.succeed("Managed resources retrieved");

  return managedResources;
}
