import { AwsTooManySecurityGroupsAttachedError } from '#src/aws/common/aws-errors.js';
import type { AwsTag } from '#src/aws/tags/types.js';
import type { Bastion } from '#src/bastion/bastion.js';
import { cli } from '#src/common/cli.js';
import { fmt } from '#src/common/fmt.js';
import type { InitTarget } from '#src/target/init-target.js';
import {
  AccessSecurityGroupCreationError,
  AccessSecurityGroupAttachmentError,
} from '#src/target/target-errors.js';

import { detailProvider } from '../../error/get-error-detail.js';
import { OperationError } from '../../error/operation-error.js';

export interface AllowTargetAccessInput {
  target: InitTarget;
  bastion: Bastion;
  tags: AwsTag[];
}

export async function allowTargetAccess({
  target,
  bastion,
  tags,
}: AllowTargetAccessInput): Promise<void> {
  if (!target.allowAccess) {
    cli.info(
      `Please, make sure your target is accessible from the bastion instance. Bastion security group: ${fmt.value(
        bastion.securityGroupName
      )}`
    );
    return;
  }

  const subCli = cli.createSubInstance({ indent: 2 });

  try {
    cli.out(`${fmt.green('❯')} Configuring target access:`);
    await target.allowAccess({
      bastion,
      tags,
      hooks: {
        onCreatingSecurityGroup: () =>
          subCli.progressStart('Creating access security group'),
        onSecurityGroupCreated: sgId =>
          subCli.progressSuccess(
            `Access security group created: ${fmt.value(sgId)}`
          ),

        onAttachingSecurityGroup: () =>
          subCli.progressStart('Attaching security group to your target'),
        onSecurityGroupAttached: () =>
          subCli.progressSuccess('Access security group attached'),
      },
    });
    cli.success(
      `The target has been initialized to use with Basti. It's recommended to give AWS a few minutes to propagate the changes before connecting with the ${fmt.code(
        'basti connect'
      )} command`
    );
  } catch (error) {
    subCli.progressFailure();

    throw OperationError.fromError({
      operationName: 'Configuring target access',
      error,
      dirtyOperation: true,
      detailProviders: [
        detailProvider(
          AccessSecurityGroupCreationError,
          () => "Can't create access security group for target"
        ),
        detailProvider(
          AccessSecurityGroupAttachmentError,
          () => "Can't attach access security group to target"
        ),
        detailProvider(
          AwsTooManySecurityGroupsAttachedError,
          () =>
            'Security group associations limit reached. Please, remove a security group from your target and try again'
        ),
      ],
    });
  }
}
