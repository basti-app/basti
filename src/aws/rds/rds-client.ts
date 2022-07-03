import { RDSClient } from "@aws-sdk/client-rds";
import { z } from "zod";

export const rdsClient = new RDSClient({ region: "us-east-1" });
