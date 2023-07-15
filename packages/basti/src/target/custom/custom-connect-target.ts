import type { AwsClientConfiguration } from '#src/aws/common/aws-client.js';
import { getBastion } from '#src/bastion/get-bastion.js';

import { TargetNotInitializedError } from '../target-errors.js';

import type { ConnectTarget } from '../connect-target.js';

export class CustomConnectTarget implements ConnectTarget {
  readonly awsClientConfig?: AwsClientConfiguration;

  private readonly vpcId: string;
  private readonly host: string;
  private readonly port: number;

  constructor({
    custom: { vpcId, host, port },
    awsClientConfig,
  }: {
    custom: {
      vpcId: string;
      host: string;
      port: number;
    };
    awsClientConfig?: AwsClientConfiguration;
  }) {
    this.vpcId = vpcId;
    this.host = host;
    this.port = port;

    this.awsClientConfig = awsClientConfig;
  }

  async isInitialized(): Promise<boolean> {
    const bastion = await getBastion({ vpcId: this.vpcId });
    return bastion !== undefined;
  }

  // TODO: Consider changing the getBastionId signature
  // to avoid retrieving EC2 instance info multiple times
  async getBastionId(): Promise<string> {
    const bastion = await getBastion({ vpcId: this.vpcId });
    if (!bastion) {
      throw new TargetNotInitializedError();
    }

    return bastion.id;
  }

  async getHost(): Promise<string> {
    return this.host;
  }

  async getPort(): Promise<number> {
    return this.port;
  }
}
