import { z } from 'zod';

import type { Parameter, StartSessionResponse } from '@aws-sdk/client-ssm';
import type { AwsSsmParameter, AwsSsmParameterType } from './types.js';

const ParameterTypeParser = z.enum(['String', 'SecureString', 'StringList']);

type ParameterType = z.infer<typeof ParameterTypeParser>;

export const parseSsmParameter: (response: Parameter) => AwsSsmParameter = z
  .object({
    Name: z.string(),
    Value: z.string(),
    Type: ParameterTypeParser,
  })
  .transform(response => ({
    name: response.Name,
    value: response.Value,
    type: transformParameterType(response.Type),
  })).parse;

function transformParameterType(type: ParameterType): AwsSsmParameterType {
  return (
    {
      String: 'string',
      SecureString: 'string',
      StringList: 'string-list',
    } as const
  )[type];
}

export const parseStartSsmSessionResponse: (
  response: StartSessionResponse
) => Required<StartSessionResponse> = z.object({
  SessionId: z.string(),
  StreamUrl: z.string(),
  TokenValue: z.string(),
}).parse;
