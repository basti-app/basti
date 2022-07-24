import * as crypto from "crypto";

import { createEc2Instance } from "../aws/ec2/create-ec2-instance.js";
import { createSecurityGroup } from "../aws/ec2/create-security-group.js";
import { createIamRole } from "../aws/iam/create-iam-role.js";
import { getStringSsmParameter } from "../aws/ssm/get-ssm-parameter.js";
import { BASTION_INSTANCE_CLOUD_INIT } from "./bastion-cloudinit.js";
import { BastionInstance } from "./bastion-instance.js";

export interface CreateBastionInstanceInput {
  vpcId: string;
  subnetId: string;
  hooks?: {
    onImageIdRetrievalStarted?: () => void;
    onImageIdRetrieved?: (imageId: string) => void;
    onRoleCreationStarted?: () => void;
    onRoleCreated?: (roleId: string) => void;
    onSecurityGroupCreationStarted?: () => void;
    onSecurityGroupCreated?: (securityGroupId: string) => void;
    onInstanceCreationStarted?: () => void;
    onInstanceCreated?: (instanceId: string) => void;
  };
}

export async function createBastionInstance({
  vpcId,
  subnetId,
  hooks,
}: CreateBastionInstanceInput): Promise<BastionInstance> {
  const bastionId = generateBastionInstanceId();

  hooks?.onImageIdRetrievalStarted?.();
  const bastionImageId = await getStringSsmParameter({
    name: "/aws/service/ami-amazon-linux-latest/amzn2-ami-kernel-5.10-hvm-x86_64-gp2",
  });
  if (!bastionImageId) {
    throw new Error(`Can't get latest Amazon Linux image id.`);
  }
  hooks?.onImageIdRetrieved?.(bastionImageId);

  hooks?.onRoleCreationStarted?.();
  const bastionRole = await createIamRole({
    name: `basti-instance-${bastionId}`,
    principalService: "ec2.amazonaws.com",
    managedPolicies: [
      "AmazonSSMManagedInstanceCore",
      "AmazonEC2ReadOnlyAccess",
    ],
  });
  hooks?.onRoleCreated?.(bastionRole.name);

  hooks?.onSecurityGroupCreationStarted?.();
  const bastionSecurityGroup = await createSecurityGroup({
    name: `basti-instance-${bastionId}`,
    description:
      "Identifies basti instance and allows connection to the Internet.",
    vpcId,
  });
  hooks?.onSecurityGroupCreated?.(bastionSecurityGroup.id);

  hooks?.onInstanceCreationStarted?.();
  const bastionInstance = await createEc2Instance({
    name: `basti-instance-${bastionId}`,
    imageId: bastionImageId,
    instanceType: "t2.micro",
    roleNames: [bastionRole.name],
    subnetId,
    assignPublicIp: true,
    securityGroupIds: [bastionSecurityGroup.id],
    userData: BASTION_INSTANCE_CLOUD_INIT,
    tags: [
      {
        key: "basti:id",
        value: bastionId,
      },
      {
        key: "basti:in-use",
        value: new Date().toISOString(),
      },
    ],
  });
  hooks?.onInstanceCreated?.(bastionInstance.id);

  return {
    id: bastionId,

    instanceId: bastionInstance.id,

    securityGroupId: bastionSecurityGroup.id,
    securityGroupName: bastionSecurityGroup.name,
  };
}

function generateBastionInstanceId(): string {
  return crypto.randomBytes(4).toString("hex");
}
