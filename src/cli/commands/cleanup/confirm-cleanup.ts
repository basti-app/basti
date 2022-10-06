import {
  CLEANUP_ORDER,
  ManagedResources,
} from '~/cleanup/managed-resources.js';
import { cli } from '~/common/cli.js';
import { fmt } from '~/common/fmt.js';
import {
  ManagedResourceType,
  ManagedResourceTypes,
} from '~/common/resource-type.js';

import { EarlyExitError } from '../../error/early-exit-error.js';

export interface ConfirmCleanupInput {
  resources: ManagedResources;
}

const RESOURCE_GROUP_TITLES: Record<ManagedResourceType, string> = {
  [ManagedResourceTypes.ACCESS_SECURITY_GROUP]: 'Access security groups',
  [ManagedResourceTypes.BASTION_SECURITY_GROUP]: 'Bastion security groups',
  [ManagedResourceTypes.BASTION_INSTANCE]: 'Bastion EC2 instances',
  [ManagedResourceTypes.BASTION_INSTANCE_PROFILE]:
    'Bastion IAM instance profiles',
  [ManagedResourceTypes.BASTION_ROLE]: 'Bastion IAM roles',
};

export async function confirmCleanup({
  resources,
}: ConfirmCleanupInput): Promise<void> {
  if (isEmpty(resources)) {
    throw new EarlyExitError(
      'No Basti-managed resources found in your account'
    );
  }

  printResources(resources);

  const { confirm } = await cli.prompt({
    type: 'confirm',
    name: 'confirm',
    message: 'Proceed to cleanup?',
    default: true,
  });

  if (!(confirm as boolean)) {
    throw new EarlyExitError('Cleanup aborted');
  }
}

function isEmpty(resources: ManagedResources): boolean {
  return Object.values(resources).every(group => group.length === 0);
}

function printResources(resources: ManagedResources): void {
  const subCli = cli.createSubInstance({ indent: 2 });

  cli.info('The following resources are going to be deleted:');

  CLEANUP_ORDER.filter(group => resources[group].length > 0).forEach(group => {
    cli.out(`${RESOURCE_GROUP_TITLES[group]}`);
    subCli.out(fmt.list(resources[group].map(resource => fmt.value(resource))));
  });
}
