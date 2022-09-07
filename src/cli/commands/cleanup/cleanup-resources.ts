import { AwsDependencyViolationError } from "../../../aws/common/aws-error.js";
import { AwsInvalidRdsStateError } from "../../../aws/rds/rds-client.js";
import { cleanupManagedResources } from "../../../cleanup/cleanup-managed-resources.js";
import { ManagedResources } from "../../../cleanup/managed-resources.js";
import { cli } from "../../../common/cli.js";
import { fmt } from "../../../common/fmt.js";
import { ManagedResourceType } from "../../../common/resource-type.js";
import { detailProvider } from "../../error/get-error-detail.js";
import { OperationError } from "../../error/operation-error.js";

export interface CleanupResourcesInput {
  resources: ManagedResources;
}

const RESOURCE_NAMES: Record<ManagedResourceType, string> = {
  [ManagedResourceType.ACCESS_SECURITY_GROUP]: "access security group",
  [ManagedResourceType.BASTION_INSTANCE]: "bastion EC2 instance",
  [ManagedResourceType.BASTION_SECURITY_GROUP]: "bastion security group",
  [ManagedResourceType.BASTION_INSTANCE_PROFILE]:
    "bastion IAM instance profile",
  [ManagedResourceType.BASTION_ROLE]: "bastion IAM role",
};

export async function cleanupResources({
  resources,
}: CleanupResourcesInput): Promise<void> {
  const errors: OperationError[] = [];

  await cleanupManagedResources({
    managedResources: resources,
    hooks: {
      onPreparingToCleanup: (group) =>
        cli.progressStart(`Preparing to ${RESOURCE_NAMES[group]} deletion`),
      onPreparationFailed: (group, error) => {
        errors.push(toPreparationError(group, error));
        cli.progressFailure(
          `Failed to prepare to ${RESOURCE_NAMES[group]} deletion`
        );
      },

      onCleaningUpResource: (group, id) =>
        cli.progressStart(
          `Deleting ${RESOURCE_NAMES[group]}: ${fmt.value(id)}`
        ),
      onResourceCleanupFailed: (group, id, error) => {
        errors.push(toCleanupError(group, id, error));
        cli.progressFailure(
          `Failed to delete ${RESOURCE_NAMES[group]}: ${fmt.value(id)}`
        );
      },
      onResourceCleanedUp: (group, id) =>
        cli.progressSuccess(
          `${capitalize(RESOURCE_NAMES[group])} deleted: ${fmt.value(id)}`
        ),
    },
  });

  printOutcome(errors);
}

function toPreparationError(
  group: ManagedResourceType,
  error: unknown
): OperationError {
  return OperationError.from({
    operationName: `preparing to ${RESOURCE_NAMES[group]} deletion`,
    error,
    detailProviders: [
      detailProvider(
        AwsInvalidRdsStateError,
        () =>
          "Database is in state that does not allow deletion. Please, try again later"
      ),
    ],
  });
}

function toCleanupError(
  group: ManagedResourceType,
  id: string,
  error: unknown
): OperationError {
  return OperationError.from({
    operationName: `deleting ${RESOURCE_NAMES[group]} "${id}"`,
    error,
    detailProviders: [
      detailProvider(
        AwsDependencyViolationError,
        () =>
          "Other resources depend on the resource. This might happen if the Basti-managed resource has been used outside of Basti or due to previous cleanup steps failures. Please, try again after manually removing the unexpected dependencies"
      ),
    ],
  });
}

function printOutcome(errors: OperationError[]): void {
  if (errors.length === 0) {
    cli.success("Basti-managed resources deleted");
    return;
  }

  cli.error("Cleanup errors:");
  cli
    .createSubInstance({ indent: 2 })
    .out(fmt.list(errors.map((error) => fmt.red(error.message))));
}

function capitalize(str: string): string {
  if (str.length === 0) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}
