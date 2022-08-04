import { getBastion } from "../../bastion/get-bastion.js";
import { ConnectTarget } from "../connect-target.js";

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

  // TODO: Consider changing the getBastionId signature
  // to avoid retrieving EC2 instance info multiple times
  async getBastionId(): Promise<string> {
    const bastion = await getBastion({ vpcId: this.vpcId });
    if (!bastion) {
      throw new Error(`Can't find bastion for the selected VPC.`);
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
