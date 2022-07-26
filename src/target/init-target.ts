import { createSecurityGroup } from "../aws/ec2/create-security-group.js";
import { BastionInstance } from "../bastion/bastion-instance.js";

export interface InitTarget {
  getVpcId(): Promise<string>;

  allowAccess?(input: InitTargetAllowAccessInput): Promise<void>;
}

export abstract class InitTargetBase implements InitTarget {
  abstract getVpcId(): Promise<string>;

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

  protected abstract attachSecurityGroup(groupId: string): Promise<void>;
}

export interface InitTargetAllowAccessInput {
  bastionInstance: BastionInstance;
  hooks?: {
    onSecurityGroupCreationStarted?: () => void;
    onSecurityGroupCreated?: (sgId: string) => void;
    onSecurityGroupAttachmentStarted?: () => void;
    onSecurityGroupAttached?: () => void;
  };
}
