import { StartSessionRequest, StartSessionResponse } from '@aws-sdk/client-ssm';

export const AwsSsmParameterTypes = {
  STRING: 'string',
  STRING_LIST: 'string-list',
} as const;

export type AwsSsmParameterType =
  typeof AwsSsmParameterTypes[keyof typeof AwsSsmParameterTypes];

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
