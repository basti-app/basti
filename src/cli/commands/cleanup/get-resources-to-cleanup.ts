import * as cleanupOps from '#src/cleanup/get-resources-to-cleanup.js';
import { ManagedResources } from '#src/cleanup/managed-resources.js';
import { cli } from '#src/common/cli.js';
import { fmt } from '#src/common/fmt.js';
import {
  ManagedResourceType,
  ManagedResourceTypes,
} from '#src/common/resource-type.js';

import { getErrorDetail } from '../../error/get-error-detail.js';

const RESOURCE_GROUP_NAMES: Record<ManagedResourceType, string> = {
  [ManagedResourceTypes.ACCESS_SECURITY_GROUP]: 'Access security groups',
  [ManagedResourceTypes.BASTION_SECURITY_GROUP]: 'Bastion security groups',
  [ManagedResourceTypes.BASTION_INSTANCE]: 'Bastion EC2 instances',
  [ManagedResourceTypes.BASTION_INSTANCE_PROFILE]:
    'Bastion IAM instance profiles',
  [ManagedResourceTypes.BASTION_ROLE]: 'Bastion IAM roles',
};

export async function getResourcesToCleanup(): Promise<ManagedResources> {
  const subCli = cli.createSubInstance({ indent: 2 });

  let partialFailure = false;

  cli.out(`${fmt.green('❯')} Retrieving Basti-managed resources:`);
  const managedResources = await cleanupOps.getResourcesToCleanup({
    hooks: {
      onRetrievingResources: group =>
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
        text: 'Managed resources retrieved',
        warnText:
          'Not all the resources were retrieved. The account cannot be fully cleaned up',
      })
    : cli.progressSuccess('Managed resources retrieved');

  return managedResources;
}
