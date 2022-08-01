import { StartSessionRequest, StartSessionResponse } from "@aws-sdk/client-ssm";

export type AwsSsmParameterType = "string" | "string-list";

export interface AwsSsmParameter {
  name: string;
  value: string;
  type: AwsSsmParameterType;
}

export interface AwsSsmSessionDescriptor {
  request: StartSessionRequest;
  response: Required<StartSessionResponse>;
  region: string;
  endpoint: string;
}
