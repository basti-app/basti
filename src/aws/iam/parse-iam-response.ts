import { InstanceProfile, Role } from "@aws-sdk/client-iam";
import { z } from "zod";
import { AwsIamInstanceProfile, AwsRole } from "./types.js";

export const parseRoleResponse: (response: Role) => AwsRole = z
  .object({
    RoleName: z.string(),
  })
  .transform((response) => ({ name: response.RoleName })).parse;

export const parseIamInstanceProfile: (
  response: InstanceProfile
) => AwsIamInstanceProfile = z
  .object({
    InstanceProfileName: z.string(),
    Arn: z.string(),
  })
  .transform((response) => ({
    name: response.InstanceProfileName,
    arn: response.Arn,
  })).parse;
