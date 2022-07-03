import { EC2Client } from "@aws-sdk/client-ec2";

export const ec2Client = new EC2Client({ region: "us-east-1" });
