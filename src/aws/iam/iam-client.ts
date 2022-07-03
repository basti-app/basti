import { IAMClient } from "@aws-sdk/client-iam";

export const iamClient = new IAMClient({ region: "us-east-1" });
