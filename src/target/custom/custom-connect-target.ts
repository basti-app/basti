import { getBastion } from '../../bastion/get-bastion.js';
import { ConnectTarget, TargetNotInitializedError } from '../connect-target.js';

export class CustomConnectTarget implements ConnectTarget {
  private readonly vpcId: string;
  private readonly host: string;
  private readonly port: number;

  constructor({
    vpcId,
    host,
    port,
  }: {
    vpcId: string;
    host: string;
    port: number;
  }) {
    this.vpcId = vpcId;
    this.host = host;
    this.port = port;
  }

  async isInitialized() {
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
