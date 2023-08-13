import { AwsInstanceProfileNotFoundError } from '#src/aws/ec2/ec2-errors.js';
import type { AwsTag } from '#src/aws/tags/types.js';
import {
  BastionImageRetrievalError,
  BastionRoleCreationError,
  BastionSecurityGroupCreationError,
  BastionInstanceCreationError,
  BastionInlinePoliciesCreationError,
} from '#src/bastion/bastion-errors.js';
import type { Bastion } from '#src/bastion/bastion.js';
import * as bastionOps from '#src/bastion/create-bastion.js';
import { cli } from '#src/common/cli.js';
import { fmt } from '#src/common/fmt.js';

import { detailProvider } from '../../error/get-error-detail.js';
import { OperationError } from '../../error/operation-error.js';

export interface CreateBastionInput {
  vpcId: string;
  subnetId: string;
  instanceType: string | undefined;
  tags: AwsTag[];
}

export async function createBastion({
  vpcId,
  subnetId,
  instanceType,
  tags,
}: CreateBastionInput): Promise<Bastion> {
  const subCli = cli.createSubInstance({ indent: 2 });

  try {
    cli.out(`${fmt.green('❯')} Setting up bastion:`);
    const bastion = await bastionOps.createBastion({
      vpcId,
      subnetId,
      instanceType,
      tags,
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

        onCreatingInlinePolicies: () =>
          subCli.progressStart('Creating bastion IAM role policies'),
        onInlinePoliciesCreated: () =>
          subCli.progressSuccess('Bastion IAM role policies created'),

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

    throw OperationError.fromError({
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
          BastionInlinePoliciesCreationError,
          () => "Can't create IAM role policies for bastion instance"
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
