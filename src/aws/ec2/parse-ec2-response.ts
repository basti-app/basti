import { Vpc } from "@aws-sdk/client-ec2";
import { z } from "zod";
import { AwsVpc } from "./types.js";

export const parseVpcResponse: (response: Vpc) => AwsVpc = z
  .object({
    VpcId: z.string(),
  })
  .transform((response) => ({ id: response.VpcId })).parse;
