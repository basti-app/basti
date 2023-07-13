import { TerminateInstancesCommand } from '@aws-sdk/client-ec2';

import { ec2Client } from './ec2-client.js';

export interface TerminateEc2InstancesInput {
  instanceIds: string[];
}

export async function terminateEc2Instances({
  instanceIds,
}: TerminateEc2InstancesInput): Promise<void> {
  await ec2Client.send(
    new TerminateInstancesCommand({
      InstanceIds: instanceIds,
    })
  );
}
