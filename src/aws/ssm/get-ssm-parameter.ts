import { GetParameterCommand } from '@aws-sdk/client-ssm';
import { AwsError, AwsNotFoundError } from '../common/aws-error.js';
import { parseSsmParameter } from './parse-ssm-response.js';
import { ssmClient } from './ssm-client.js';
import { AwsSsmParameter, AwsSsmParameterTypes } from './types.js';

export interface GetSsmParameterInput {
  name: string;
}

export async function getSsmParameter({
  name,
}: GetSsmParameterInput): Promise<AwsSsmParameter | undefined> {
  try {
    const { Parameter } = await ssmClient.send(
      new GetParameterCommand({
        Name: name,
      })
    );

    if (!Parameter) {
      throw new Error(`Invalid response from AWS.`);
    }

    return parseSsmParameter(Parameter);
  } catch (error) {
    if (error instanceof AwsNotFoundError) {
      return undefined;
    }
    throw error;
  }
}

export async function getStringSsmParameter(
  input: GetSsmParameterInput
): Promise<string | undefined> {
  const parameter = await getSsmParameter(input);

  if (!parameter) {
    return;
  }

  if (parameter.type !== 'string') {
    throw new AwsWrongSsmParameterTypeError(
      AwsSsmParameterTypes.STRING,
      parameter.name,
      parameter.type
    );
  }

  return parameter.value;
}

export class AwsWrongSsmParameterTypeError extends AwsError {
  constructor(
    public readonly expectedType: string,
    public readonly parameterName: string,
    public readonly parameterType: string
  ) {
    super(
      `Expecting SSM parameter "${parameterName}" to be of type "${expectedType}" but got "${parameterType}"`
    );
  }
}
