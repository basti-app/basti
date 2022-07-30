import {
  StartInstancesCommand,
  waitUntilInstanceRunning,
} from "@aws-sdk/client-ec2";
import { COMMON_WAITER_CONFIG } from "../common/waiter-config.js";
import { ec2Client } from "./ec2-client.js";

export interface StartEc2InstanceInput {
  instanceId: string;
}

export async function startEc2Instance({
  instanceId,
}: StartEc2InstanceInput): Promise<void> {
  await ec2Client.send(
    new StartInstancesCommand({
      InstanceIds: [instanceId],
    })
  );
  await waitUntilInstanceRunning(
    { ...COMMON_WAITER_CONFIG, client: ec2Client },
    {
      InstanceIds: [instanceId],
    }
  );
}
