import { AwsTags } from "../../types.js";
import { AwsSecurityGroupIdentifier } from "./aws-security-group.js";

export interface AwsEc2Instance {
  id: string;
  name?: string;

  securityGroups: AwsSecurityGroupIdentifier[];

  tags: AwsTags;
}
