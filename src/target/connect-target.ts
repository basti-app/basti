import { getSecurityGroups } from "../aws/ec2/get-security-groups.js";
import {
  AwsSecurityGroup,
  isGroupSecurityGroupSource,
} from "../aws/ec2/types/aws-security-group.js";
import { BASTION_INSTANCE_NAME_PREFIX } from "../bastion/bastion.js";
import { TARGET_ACCESS_SECURITY_GROUP_NAME_PREFIX } from "./target.js";

export interface ConnectTarget {
  getBastionId(): Promise<string>;
}

export abstract class ConnectTargetBase implements ConnectTarget {
  async getBastionId(): Promise<string> {
    const accessSecurityGroup = await this.getAccessSecurityGroup();

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
      throw new Error(
        `Can't find bastion instance id for the selected target.`
      );
    }

    return bastionId;
  }

  private async getAccessSecurityGroup(): Promise<AwsSecurityGroup> {
    const securityGroupIds = await this.getSecurityGroupIds();

    const securityGroups = await getSecurityGroups({ securityGroupIds });

    const accessSecurityGroup = securityGroups.find((group) =>
      group.name.startsWith(TARGET_ACCESS_SECURITY_GROUP_NAME_PREFIX)
    );

    if (!accessSecurityGroup) {
      throw new Error(`Can't find access security group on selected target.`);
    }

    return accessSecurityGroup;
  }

  protected abstract getSecurityGroupIds(): Promise<string[]>;
}
