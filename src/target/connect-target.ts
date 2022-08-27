import { getSecurityGroups } from "../aws/ec2/get-security-groups.js";
import {
  AwsSecurityGroup,
  isGroupSecurityGroupSource,
} from "../aws/ec2/types/aws-security-group.js";
import { BASTION_INSTANCE_NAME_PREFIX } from "../bastion/bastion.js";
import {
  ResourceDamagedError,
  ResourceType,
  RuntimeError,
} from "../common/runtime-error.js";
import { TARGET_ACCESS_SECURITY_GROUP_NAME_PREFIX } from "./target-input.js";

export interface ConnectTarget {
  isInitialized(): Promise<boolean>;

  getBastionId(): Promise<string>;

  getHost(): Promise<string>;
  getPort(): Promise<number>;
}

export abstract class ConnectTargetBase implements ConnectTarget {
  async isInitialized() {
    const accessSecurityGroup = await this.getAccessSecurityGroup();
    return accessSecurityGroup !== undefined;
  }

  async getBastionId(): Promise<string> {
    const accessSecurityGroup = await this.getAccessSecurityGroup();
    if (!accessSecurityGroup) {
      throw new TargetNotInitializedError();
    }

    const sourceSecurityGroupIds = accessSecurityGroup.ingressRules
      .flatMap((rule) => rule.sources)
      .filter(isGroupSecurityGroupSource)
      .map((source) => source.securityGroupId);

    const sourceSecurityGroups = await getSecurityGroups({
      securityGroupIds: sourceSecurityGroupIds,
    });

    const bastionId = sourceSecurityGroups
      .map((group) => group.name)
      .find((name) => name.startsWith(BASTION_INSTANCE_NAME_PREFIX))
      ?.substring(BASTION_INSTANCE_NAME_PREFIX.length + 1); // Prefix and ID are separated with a dash.

    if (!bastionId) {
      throw new ResourceDamagedError(
        ResourceType.ACCESS_SECURITY_GROUP,
        accessSecurityGroup.id,
        "No bastion security group found among the ingress rules"
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

    return securityGroups.find((group) =>
      group.name.startsWith(TARGET_ACCESS_SECURITY_GROUP_NAME_PREFIX)
    );
  }

  protected abstract getSecurityGroupIds(): Promise<string[]>;
}

export class TargetNotInitializedError extends RuntimeError {
  constructor() {
    super("Target is not initialized");
  }
}
