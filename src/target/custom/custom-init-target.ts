import { InitTarget } from "../init-target.js";

export class CustomInitTarget implements InitTarget {
  private readonly vpcId: string;

  constructor({ vpcId }: { vpcId: string }) {
    this.vpcId = vpcId;
  }

  async getVpcId(): Promise<string> {
    return this.vpcId;
  }
}
