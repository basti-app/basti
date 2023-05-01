import type { AwsClientConfiguration } from '#src/aws/common/aws-client.js';

import { getSecurityGroups } from '../aws/ec2/get-security-groups.js';
import { isGroupSecurityGroupSource } from '../aws/ec2/types/aws-security-group.js';
import { BASTION_INSTANCE_NAME_PREFIX } from '../bastion/bastion.js';
import { ManagedResourceTypes } from '../common/resource-type.js';
import { ResourceDamagedError } from '../common/runtime-errors.js';

import { TargetNotInitializedError } from './target-errors.js';
import { TARGET_ACCESS_SECURITY_GROUP_NAME_PREFIX } from './target-input.js';

import type { AwsSecurityGroup } from '../aws/ec2/types/aws-security-group.js';

export interface ConnectTarget {
  // Per-target AWS client config can only be specified via config file.
  // In interactive mode as well as with CLI arguments, global client config is used.
  awsClientConfig?: AwsClientConfiguration;

  isInitialized: () => Promise<boolean>;

  getBastionId: () => Promise<string>;

  getHost: () => Promise<string>;
  getPort: () => Promise<number>;
}

export interface ConnectTargetBaseConstructorInput {
  awsClientConfig?: AwsClientConfiguration;
}

export abstract class ConnectTargetBase implements ConnectTarget {
  awsClientConfig?: AwsClientConfiguration;

  constructor({ awsClientConfig }: ConnectTargetBaseConstructorInput = {}) {
    this.awsClientConfig = awsClientConfig;
  }

  async isInitialized(): Promise<boolean> {
    const accessSecurityGroup = await this.getAccessSecurityGroup();
    return accessSecurityGroup !== undefined;
  }

  async getBastionId(): Promise<string> {
    const accessSecurityGroup = await this.getAccessSecurityGroup();
    if (!accessSecurityGroup) {
      throw new TargetNotInitializedError();
    }

    const sourceSecurityGroupIds = accessSecurityGroup.ingressRules
      .flatMap(rule => rule.sources)
      // eslint-disable-next-line unicorn/no-array-callback-reference -- breaks type guard usage
      .filter(isGroupSecurityGroupSource)
      .map(source => source.securityGroupId);

    const sourceSecurityGroups = await getSecurityGroups({
      securityGroupIds: sourceSecurityGroupIds,
    });

    const bastionId = sourceSecurityGroups
      .map(group => group.name)
      .find(name => name.startsWith(BASTION_INSTANCE_NAME_PREFIX))
      ?.slice(Math.max(0, BASTION_INSTANCE_NAME_PREFIX.length + 1)); // Prefix and ID are separated with a dash.

    if (bastionId === undefined) {
      throw new ResourceDamagedError(
        ManagedResourceTypes.ACCESS_SECURITY_GROUP,
        accessSecurityGroup.id,
        'No bastion security group found among the ingress rules'
      );
    }

    return bastionId;
  }

  abstract getHost(): Promise<string>;
  abstract getPort(): Promise<number>;

  private async getAccessSecurityGroup(): Promise<
    AwsSecurityGroup | undefined
  > {
    const securityGroupIds = await this.getSecurityGroupIds();

    const securityGroups = await getSecurityGroups({ securityGroupIds });

    return securityGroups.find(group =>
      group.name.startsWith(TARGET_ACCESS_SECURITY_GROUP_NAME_PREFIX)
    );
  }

  protected abstract getSecurityGroupIds(): Promise<string[]>;
}
