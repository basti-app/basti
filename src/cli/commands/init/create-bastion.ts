import { AwsInstanceProfileNotFoundError } from '~/aws/ec2/ec2-errors.js';
import {
  BastionImageRetrievalError,
  BastionRoleCreationError,
  BastionSecurityGroupCreationError,
  BastionInstanceCreationError,
} from '~/bastion/bastion-errors.js';
import { Bastion } from '~/bastion/bastion.js';
import * as bastionOps from '~/bastion/create-bastion.js';
import { cli } from '~/common/cli.js';
import { fmt } from '~/common/fmt.js';

import { detailProvider } from '../../error/get-error-detail.js';
import { OperationError } from '../../error/operation-error.js';

export interface CreateBastionInput {
  vpcId: string;
  subnetId: string;
}

export async function createBastion({
  vpcId,
  subnetId,
}: CreateBastionInput): Promise<Bastion> {
  const subCli = cli.createSubInstance({ indent: 2 });

  try {
    cli.out(`${fmt.green('❯')} Setting up bastion:`);
    const bastion = await bastionOps.createBastion({
      vpcId,
      subnetId,
      hooks: {
        onRetrievingImageId: () =>
          subCli.progressStart('Retrieving the latest EC2 AMI'),
        onImageIdRetrieved: imageId =>
          subCli.progressSuccess(
            `Bastion EC2 AMI to be used: ${fmt.value(imageId)}`
          ),

        onCreatingRole: () => subCli.progressStart('Creating bastion IAM role'),
        onRoleCreated: roleName =>
          subCli.progressSuccess(
            `Bastion IAM role created: ${fmt.value(roleName)}`
          ),

        onCreatingSecurityGroup: () =>
          subCli.progressStart('Creating bastion security group'),
        onSecurityGroupCreated: sgId =>
          subCli.progressSuccess(
            `Bastion security group created: ${fmt.value(sgId)}`
          ),

        onCreatingInstance: () =>
          subCli.progressStart('Creating bastion EC2 instance'),
        onInstanceCreated: instanceId =>
          subCli.progressSuccess(
            `Bastion EC2 instance created: ${fmt.value(instanceId)}`
          ),
      },
    });
    cli.progressSuccess(`Bastion set up. Bastion id: ${fmt.value(bastion.id)}`);

    return bastion;
  } catch (error) {
    subCli.progressFailure();

    throw OperationError.from({
      operationName: 'Setting up bastion',
      error,
      dirtyOperation: true,
      detailProviders: [
        detailProvider(
          BastionImageRetrievalError,
          () => "Can't retrieve EC2 AMI for bastion instance"
        ),
        detailProvider(
          BastionRoleCreationError,
          () => "Can't create IAM role for bastion instance"
        ),
        detailProvider(
          BastionSecurityGroupCreationError,
          () => "Can't create security group for bastion instance"
        ),
        detailProvider(
          BastionInstanceCreationError,
          () => "Can't create bastion EC2 instance"
        ),
        detailProvider(
          AwsInstanceProfileNotFoundError,
          () =>
            'Instance profile not found. This looks like an AWS delay. Please try again'
        ),
      ],
    });
  }
}
