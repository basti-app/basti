import { getBastion } from '~/bastion/get-bastion.js';

import { InitTarget } from '../init-target.js';

export class CustomInitTarget implements InitTarget {
  private readonly vpcId: string;

  constructor({ vpcId }: { vpcId: string }) {
    this.vpcId = vpcId;
  }

  async isInitialized(): Promise<boolean> {
    const bastion = await getBastion({ vpcId: this.vpcId });
    return bastion !== undefined;
  }

  async getVpcId(): Promise<string> {
    return this.vpcId;
  }
}
