import { GetParameterCommand, ParameterType } from "@aws-sdk/client-ssm";
import { parseSsmParameter } from "./parse-ssm-response.js";
import { ssmClient } from "./ssm-client.js";
import { AwsSsmParameter } from "./types.js";

export interface GetSsmParameterInput {
  name: string;
}

export async function getSsmParameter({
  name,
}: GetSsmParameterInput): Promise<AwsSsmParameter | undefined> {
  const { Parameter } = await ssmClient.send(
    new GetParameterCommand({
      Name: name,
    })
  );

  if (!Parameter) {
    return;
  }

  return parseSsmParameter(Parameter);
}

export async function getStringSsmParameter(
  input: GetSsmParameterInput
): Promise<string | undefined> {
  const parameter = await getSsmParameter(input);

  if (!parameter) {
    return;
  }

  if (parameter.type !== "string") {
    throw new Error(
      `Expecting SSM parameter "${parameter.name}" to be of type "string" but got "${parameter.type}."`
    );
  }

  return parameter.value;
}
