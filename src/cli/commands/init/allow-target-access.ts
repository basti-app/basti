import { AwsTooManySecurityGroupsAttachedError } from '~/aws/rds/rds-errors.js';
import { Bastion } from '~/bastion/bastion.js';
import { cli } from '~/common/cli.js';
import { fmt } from '~/common/fmt.js';
import { InitTarget } from '~/target/init-target.js';
import {
  AccessSecurityGroupCreationError,
  AccessSecurityGroupAttachmentError,
} from '~/target/target-errors.js';

import { detailProvider } from '../../error/get-error-detail.js';
import { OperationError } from '../../error/operation-error.js';

export interface AllowTargetAccessInput {
  target: InitTarget;
  bastion: Bastion;
}

export async function allowTargetAccess({
  target,
  bastion,
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
      `The target has been initialized to use with Basti. Use ${fmt.code(
        'basti connect'
      )} to establish a connection`
    );
  } catch (error) {
    subCli.progressFailure();

    throw OperationError.from({
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
