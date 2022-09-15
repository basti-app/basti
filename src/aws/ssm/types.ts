import { StartSessionRequest, StartSessionResponse } from '@aws-sdk/client-ssm';

export const AwsSsmParameterType = {
  STRING: 'string',
  STRING_LIST: 'string-list',
} as const;

export type AwsSsmParameterType =
  typeof AwsSsmParameterType[keyof typeof AwsSsmParameterType];

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
