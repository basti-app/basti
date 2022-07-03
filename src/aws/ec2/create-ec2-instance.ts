import { RunInstancesCommand } from "@aws-sdk/client-ec2";
import { AwsTag } from "../types.js";
import { ec2Client } from "./ec2-client.js";
import { AwsEc2Instance } from "./types.js";

export interface CreateEc2InstanceInput {
  imageId: string;
  instanceType: string;
  subnetId: string;
  instanceProfileName: string;
  tags: AwsTag[];
}

export async function createEc2Instance({
  imageId,
  instanceType,
  subnetId,
  instanceProfileName,
  tags,
}: CreateEc2InstanceInput): Promise<AwsEc2Instance> {
  const { Instances } = await ec2Client.send(
    new RunInstancesCommand({
      ImageId: imageId,
      InstanceType: instanceType,
      SubnetId: subnetId,
      IamInstanceProfile: {
        Name: instanceProfileName,
      },
      TagSpecifications: [
        {
          ResourceType: "instance",
          Tags: tags.map((tag) => ({ Name: tag.name, Value: tag.value })),
        },
      ],

      MinCount: 1,
      MaxCount: 1,
    })
  );

  if (!Instances || !Instances[0] || !Instances[0].InstanceId) {
    throw new Error(`Invalid response from AWS.`);
  }

  return {
    id: Instances[0].InstanceId,
  };
}
