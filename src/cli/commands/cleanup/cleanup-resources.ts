import { AwsDependencyViolationError } from "../../../aws/common/aws-error.js";
import { AwsInvalidRdsStateError } from "../../../aws/rds/rds-client.js";
import { cleanupManagedResources } from "../../../cleanup/cleanup-managed-resources.js";
import {
  ManagedResourceGroup,
  ManagedResources,
} from "../../../cleanup/managed-resources.js";
import { cli } from "../../../common/cli.js";
import { fmt } from "../../../common/fmt.js";
import { detailProvider } from "../../error/get-error-detail.js";
import { OperationError } from "../../error/operation-error.js";

export interface CleanupResourcesInput {
  resources: ManagedResources;
}

export type CleanupErrors = OperationError[];

const RESOURCE_NAMES: Record<ManagedResourceGroup, string> = {
  [ManagedResourceGroup.ACCESS_SECURITY_GROUP]: "access security group",
  [ManagedResourceGroup.BASTION_INSTANCE]: "bastion EC2 instance",
  [ManagedResourceGroup.BASTION_SECURITY_GROUP]: "bastion security group",
  [ManagedResourceGroup.BASTION_INSTANCE_PROFILE]:
    "bastion IAM instance profile",
  [ManagedResourceGroup.BASTION_ROLE]: "bastion IAM role",
};

export async function cleanupResources({
  resources,
}: CleanupResourcesInput): Promise<CleanupErrors> {
  const errors: CleanupErrors = [];

  await cleanupManagedResources({
    managedResources: resources,
    hooks: {
      onPreparingToCleanup: (group) =>
        cli.progressStart(`Preparing to ${RESOURCE_NAMES[group]} deletion`),
      onPreparationFailed: (group, error) => {
        errors.push(
          OperationError.from({
            operationName: `preparing to ${RESOURCE_NAMES[group]} deletion`,
            error,
            detailProviders: [
              detailProvider(
                AwsInvalidRdsStateError,
                () =>
                  "Database is in state that does not allow deletion. Please, try again later"
              ),
            ],
          })
        );
        cli.progressFailure(
          `Failed to prepare to ${RESOURCE_NAMES[group]} deletion`
        );
      },
      onCleaningUpResource: (group, id) =>
        cli.progressStart(
          `Deleting ${RESOURCE_NAMES[group]}: ${fmt.value(id)}`
        ),
      onResourceCleanedUp: (group, id) =>
        cli.progressSuccess(
          `${capitalize(RESOURCE_NAMES[group])} deleted: ${fmt.value(id)}`
        ),
      onResourceCleanupFailed: (group, id, error) => {
        errors.push(
          OperationError.from({
            operationName: `deleting ${RESOURCE_NAMES[group]} "${id}"`,
            error,
            detailProviders: [
              detailProvider(
                AwsDependencyViolationError,
                () =>
                  "Other resources depend on the resource. This might happen if the Basti-managed resource has been used outside of Basti or due to previous cleanup steps failures. Please, try again after manually removing the unexpected dependencies"
              ),
            ],
          })
        );
        cli.progressFailure(
          `Failed to delete ${RESOURCE_NAMES[group]}: ${fmt.value(id)}`
        );
      },
    },
  });

  return errors;
}

function capitalize(str: string): string {
  if (str.length === 0) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}
