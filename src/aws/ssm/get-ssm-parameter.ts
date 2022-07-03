import { GetParameterCommand, ParameterType } from "@aws-sdk/client-ssm";
import { ssmClient } from "./ssm-client.js";

export async function getSsmStringParameter(
  name: string
): Promise<string | undefined> {
  const { Parameter } = await ssmClient.send(
    new GetParameterCommand({
      Name: name,
    })
  );

  if (!Parameter || !Parameter.Value) {
    throw new Error(`Invalid response from AWS.`);
  }

  if (Parameter.Type != ParameterType.STRING) {
    throw new Error(
      `Requested parameter "${name}" is of type "${Parameter.Type}". Expected "${ParameterType.STRING}".`
    );
  }

  return Parameter.Value;
}
