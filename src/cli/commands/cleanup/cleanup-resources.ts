import { AwsDependencyViolationError } from '#src/aws/common/aws-errors.js';
import { AwsInvalidRdsStateError } from '#src/aws/rds/rds-errors.js';
import { cleanupManagedResources } from '#src/cleanup/cleanup-managed-resources.js';
import { ManagedResources } from '#src/cleanup/managed-resources.js';
import { cli } from '#src/common/cli.js';
import { fmt } from '#src/common/fmt.js';
import {
  ManagedResourceType,
  ManagedResourceTypes,
} from '#src/common/resource-type.js';

import { detailProvider } from '../../error/get-error-detail.js';
import { OperationError } from '../../error/operation-error.js';

export interface CleanupResourcesInput {
  resources: ManagedResources;
}

const RESOURCE_NAMES: Record<ManagedResourceType, string> = {
  [ManagedResourceTypes.ACCESS_SECURITY_GROUP]: 'Access security group',
  [ManagedResourceTypes.BASTION_INSTANCE]: 'Bastion EC2 instance',
  [ManagedResourceTypes.BASTION_SECURITY_GROUP]: 'Bastion security group',
  [ManagedResourceTypes.BASTION_INSTANCE_PROFILE]:
    'Bastion IAM instance profile',
  [ManagedResourceTypes.BASTION_ROLE]: 'Bastion IAM role',
};

export async function cleanupResources({
  resources,
}: CleanupResourcesInput): Promise<void> {
  const errors: OperationError[] = [];

  await cleanupManagedResources({
    managedResources: resources,
    hooks: {
      onPreparingToCleanup: group =>
        cli.progressStart(
          `Preparing to ${fmt.lower(RESOURCE_NAMES[group])} deletion`
        ),
      onPreparationFailed: (group, error) => {
        errors.push(toPreparationError(group, error));
        cli.progressFailure(
          `Failed to prepare to ${fmt.lower(RESOURCE_NAMES[group])} deletion`
        );
      },

      onCleaningUpResource: (group, id) =>
        cli.progressStart(
          `Deleting ${fmt.lower(RESOURCE_NAMES[group])}: ${fmt.value(id)}`
        ),
      onResourceCleanupFailed: (group, id, error) => {
        errors.push(toCleanupError(group, id, error));
        cli.progressFailure(
          `Failed to delete ${fmt.lower(RESOURCE_NAMES[group])}: ${fmt.value(
            id
          )}`
        );
      },
      onResourceCleanedUp: (group, id) =>
        cli.progressSuccess(
          `${fmt.capitalize(RESOURCE_NAMES[group])} deleted: ${fmt.value(id)}`
        ),
    },
  });

  printOutcome(errors);
}

function toPreparationError(
  group: ManagedResourceType,
  error: unknown
): OperationError {
  return OperationError.fromError({
    operationName: `Preparing to ${fmt.lower(RESOURCE_NAMES[group])} deletion`,
    error,
    detailProviders: [
      detailProvider(
        AwsInvalidRdsStateError,
        () =>
          'Database is in state that does not allow deletion. Please, try again later'
      ),
    ],
  });
}

function toCleanupError(
  group: ManagedResourceType,
  id: string,
  error: unknown
): OperationError {
  return OperationError.fromError({
    operationName: `Deleting ${fmt.lower(RESOURCE_NAMES[group])} "${id}"`,
    error,
    detailProviders: [
      detailProvider(
        AwsDependencyViolationError,
        () =>
          'Other resources depend on the resource. This might happen if the Basti-managed resource has been used outside of Basti or due to previous cleanup step failures. Please, try again after manually removing the unexpected dependencies'
      ),
    ],
  });
}

function printOutcome(errors: OperationError[]): void {
  if (errors.length === 0) {
    cli.success('Basti-managed resources deleted');
    return;
  }

  cli.error('Cleanup errors:');
  cli
    .createSubInstance({ indent: 2 })
    .out(fmt.list(errors.map(error => fmt.red(error.message))));
}
