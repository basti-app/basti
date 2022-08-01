import { StartSessionCommand } from "@aws-sdk/client-ssm";
import { parseStartSsmSessionResponse } from "./parse-ssm-response.js";
import { ssmClient } from "./ssm-client.js";
import { AwsSsmSessionDescriptor } from "./types.js";

export interface StartSsmPortForwardingSession {
  bastionInstanceId: string;

  targetHost: string;
  targetPort: number;
}

export async function startSsmPortForwardingSession({
  bastionInstanceId,
  targetHost,
  targetPort,
}: StartSsmPortForwardingSession): Promise<AwsSsmSessionDescriptor> {
  const request = {
    Target: bastionInstanceId,
    DocumentName: "AWS-StartPortForwardingSessionToRemoteHost",
    Parameters: {
      host: [targetHost],
      portNumber: [String(targetPort)],
      localPortNumber: [String(54321)],
    },
  };

  const response = await ssmClient.send(new StartSessionCommand(request));

  return {
    request,
    response: parseStartSsmSessionResponse(response),
    region: await getSsmClientRegion(),
    endpoint: await getSsmClientEndpoint(),
  };
}

async function getSsmClientRegion(): Promise<string> {
  const clientRegion = ssmClient.config.region;

  return typeof clientRegion === "string" ? clientRegion : await clientRegion();
}

async function getSsmClientEndpoint(): Promise<string> {
  const { protocol, hostname, port, path, query } =
    await ssmClient.config.endpoint();

  const portPart = port ? `:${port}` : "";
  const queryPart = query ? `:${query}` : "";
  return `${protocol}://${hostname}${portPart}${path}${queryPart}`;
}
