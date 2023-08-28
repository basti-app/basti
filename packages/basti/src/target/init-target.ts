import type { AwsTag } from '#src/aws/tags/types.js';

import { createSecurityGroup } from '../aws/ec2/create-security-group.js';
import { getSecurityGroups } from '../aws/ec2/get-security-groups.js';
import { generateShortId } from '../common/short-id.js';

import {
  AccessSecurityGroupCreationError,
  AccessSecurityGroupAttachmentError,
} from './target-errors.js';
import { TARGET_ACCESS_SECURITY_GROUP_NAME_PREFIX } from './target-input.js';

import type { Bastion } from '../bastion/bastion.js';
import type { AwsSecurityGroup } from '../aws/ec2/types/aws-security-group.js';

interface InitTargetAllowAccessHooks {
  onCreatingSecurityGroup?: () => void;
  onSecurityGroupCreated?: (sgId: string) => void;
  onAttachingSecurityGroup?: () => void;
  onSecurityGroupAttached?: () => void;
}

export interface InitTargetAllowAccessInput {
  bastion: Bastion;
  tags: AwsTag[];
  hooks?: InitTargetAllowAccessHooks;
}

export interface InitTarget {
  isInitialized: () => Promise<boolean>;

  getVpcId: () => Promise<string>;

  allowAccess?: (input: InitTargetAllowAccessInput) => Promise<void>;
}

export abstract class InitTargetBase implements InitTarget {
  abstract getId(): string;
  abstract getVpcId(): Promise<string>;

  async isInitialized(): Promise<boolean> {
    const accessSecurityGroup = await this.getAccessSecurityGroup();
    return accessSecurityGroup !== undefined;
  }

  async allowAccess({
    bastion,
    tags,
    hooks,
  }: InitTargetAllowAccessInput): Promise<void> {
    const accessSecurityGroup = await this.createAccessSecurityGroup(
      bastion,
      tags,
      hooks
    );

    await this.attachAccessSecurityGroup(accessSecurityGroup, hooks);
  }

  protected abstract getTargetPort(): number;

  protected abstract getSecurityGroupIds(): Promise<string[]>;

  protected abstract attachSecurityGroup(groupId: string): Promise<void>;

  private async getAccessSecurityGroup(): Promise<
    AwsSecurityGroup | undefined
  > {
    const securityGroupIds = await this.getSecurityGroupIds();
    const securityGroups = await getSecurityGroups({ securityGroupIds });

    return securityGroups.find(group =>
      group.name.startsWith(TARGET_ACCESS_SECURITY_GROUP_NAME_PREFIX)
    );
  }

  private async createAccessSecurityGroup(
    bastion: Bastion,
    tags: AwsTag[],
    hooks?: InitTargetAllowAccessHooks
  ): Promise<AwsSecurityGroup> {
    try {
      hooks?.onCreatingSecurityGroup?.();
      const accessSecurityGroup = await createSecurityGroup({
        name: `${TARGET_ACCESS_SECURITY_GROUP_NAME_PREFIX}-${generateShortId()}`,
        description: 'Allows access from Basti instances',
        vpcId: bastion.instance.vpcId,
        ingressRules: [
          {
            ipProtocol: 'tcp',
            sources: [
              {
                securityGroupId: bastion.securityGroupId,
              },
            ],
            ports: {
              from: this.getTargetPort(),
              to: this.getTargetPort(),
            },
          },
        ],
        tags,
      });
      hooks?.onSecurityGroupCreated?.(accessSecurityGroup.id);
      return accessSecurityGroup;
    } catch (error) {
      throw new AccessSecurityGroupCreationError(error);
    }
  }

  private async attachAccessSecurityGroup(
    accessSecurityGroup: AwsSecurityGroup,
    hooks?: InitTargetAllowAccessHooks
  ): Promise<void> {
    try {
      hooks?.onAttachingSecurityGroup?.();
      await this.attachSecurityGroup(accessSecurityGroup.id);
      hooks?.onSecurityGroupAttached?.();
    } catch (error) {
      throw new AccessSecurityGroupAttachmentError(error);
    }
  }
}
