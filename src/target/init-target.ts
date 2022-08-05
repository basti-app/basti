import { createSecurityGroup } from "../aws/ec2/create-security-group.js";
import { getSecurityGroups } from "../aws/ec2/get-security-groups.js";
import { Bastion } from "../bastion/bastion.js";
import { TARGET_ACCESS_SECURITY_GROUP_NAME_PREFIX } from "./target-input.js";

export interface InitTarget {
  getVpcId(): Promise<string>;

  hasAccessAllowed?(): Promise<boolean>;
  allowAccess?(input: InitTargetAllowAccessInput): Promise<void>;
}

export abstract class InitTargetBase implements InitTarget {
  abstract getVpcId(): Promise<string>;

  async hasAccessAllowed(): Promise<boolean> {
    const securityGroupIds = await this.getSecurityGroupIds();
    const securityGroups = await getSecurityGroups({ securityGroupIds });

    return securityGroups.some((group) =>
      group.name.startsWith(TARGET_ACCESS_SECURITY_GROUP_NAME_PREFIX)
    );
  }

  async allowAccess({
    bastionInstance,
    hooks,
  }: InitTargetAllowAccessInput): Promise<void> {
    hooks?.onSecurityGroupCreationStarted?.();
    const allowAccessSecurityGroup = await createSecurityGroup({
      name: `basti-access-${bastionInstance.id}`,
      description: "Allows access from the basti instance.",
      vpcId: await this.getVpcId(),
      ingressRules: [
        {
          ipProtocol: "tcp",
          sources: [
            {
              securityGroupId: bastionInstance.securityGroupId,
            },
          ],
          ports: {
            from: this.getTargetPort(),
            to: this.getTargetPort(),
          },
        },
      ],
    });
    hooks?.onSecurityGroupCreated?.(allowAccessSecurityGroup.id);

    hooks?.onSecurityGroupAttachmentStarted?.();
    await this.attachSecurityGroup(allowAccessSecurityGroup.id);
    hooks?.onSecurityGroupAttached?.();
  }

  protected abstract getTargetPort(): number;

  protected abstract getSecurityGroupIds(): Promise<string[]>;

  protected abstract attachSecurityGroup(groupId: string): Promise<void>;
}

export interface InitTargetAllowAccessInput {
  bastionInstance: Bastion;
  hooks?: {
    onSecurityGroupCreationStarted?: () => void;
    onSecurityGroupCreated?: (sgId: string) => void;
    onSecurityGroupAttachmentStarted?: () => void;
    onSecurityGroupAttached?: () => void;
  };
}
