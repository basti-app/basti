import {
  waitUntilInstanceRunning,
  waitUntilInstanceStopped,
} from "@aws-sdk/client-ec2";
import { COMMON_WAITER_CONFIG } from "../common/waiter-config.js";
import { ec2Client } from "./ec2-client.js";

export interface WaitEc2InstanceInput {
  instanceId: string;
}

export async function waitEc2InstanceIsRunning({
  instanceId,
}: WaitEc2InstanceInput): Promise<void> {
  await waitUntilInstanceRunning(
    { ...COMMON_WAITER_CONFIG, client: ec2Client },
    { InstanceIds: [instanceId] }
  );
}

export async function waitEc2InstanceIsStopped({
  instanceId,
}: WaitEc2InstanceInput): Promise<void> {
  await waitUntilInstanceStopped(
    { ...COMMON_WAITER_CONFIG, client: ec2Client },
    { InstanceIds: [instanceId] }
  );
}
