import {
  RunInstancesCommand,
  waitUntilInstanceExists,
} from "@aws-sdk/client-ec2";
import { COMMON_WAITER_CONFIG } from "../common/waiter-config.js";
import { createIamInstanceProfile } from "../iam/create-instance-profile.js";
import { AwsTag } from "../types.js";
import { ec2Client } from "./ec2-client.js";
import { parseEc2InstanceResponse } from "./parse-ec2-response.js";
import { AwsEc2Instance } from "./types.js";

export interface CreateEc2InstanceInput {
  imageId: string;
  name: string;
  instanceType: string;
  subnetId: string;
  roleNames: string[];
  securityGroupIds: string[];
  tags: AwsTag[];
}

export async function createEc2Instance({
  imageId,
  name,
  instanceType,
  subnetId,
  roleNames,
  securityGroupIds,
  tags,
}: CreateEc2InstanceInput): Promise<AwsEc2Instance> {
  const instanceProfile = await createIamInstanceProfile({
    name,
    roleNames,
  });

  const { Instances } = await ec2Client.send(
    new RunInstancesCommand({
      ImageId: imageId,
      InstanceType: instanceType,
      SubnetId: subnetId,
      IamInstanceProfile: {
        Name: instanceProfile.name,
      },
      SecurityGroupIds: securityGroupIds,
      TagSpecifications: [
        {
          ResourceType: "instance",
          Tags: tags
            .map((tag) => ({ Key: tag.key, Value: tag.value }))
            .concat({ Key: "Name", Value: name }),
        },
      ],

      MinCount: 1,
      MaxCount: 1,
    })
  );
  if (!Instances || !Instances[0]) {
    throw new Error(`Invalid response from AWS.`);
  }
  const instance = parseEc2InstanceResponse(Instances[0]);

  await waitUntilInstanceExists(
    { ...COMMON_WAITER_CONFIG, client: ec2Client },
    { InstanceIds: [instance.id] }
  );

  return instance;
}
