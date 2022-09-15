import { DeleteSecurityGroupCommand } from '@aws-sdk/client-ec2';
import { ec2Client } from './ec2-client.js';

export interface DeleteSecurityGroupInput {
  groupId: string;
}

export async function deleteSecurityGroup({
  groupId,
}: DeleteSecurityGroupInput): Promise<void> {
  await ec2Client.send(
    new DeleteSecurityGroupCommand({
      GroupId: groupId,
    })
  );
}
