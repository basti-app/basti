import { getEc2Instances } from "../../aws/ec2/get-ec2-instances.js";
import { BASTION_INSTANCE_ID_TAG_NAME } from "../../bastion/bastion.js";
import { ConnectTarget } from "../connect-target.js";

export class CustomConnectTarget implements ConnectTarget {
  private readonly vpcId: string;

  constructor({ vpcId }: { vpcId: string }) {
    this.vpcId = vpcId;
  }

  // TODO: Consider changing the getBastionId signature
  // to avoid retrieving EC2 instance info multiple times
  async getBastionId(): Promise<string> {
    const [bastionInstance] = await getEc2Instances({
      vpcId: this.vpcId,
      tags: [{ key: BASTION_INSTANCE_ID_TAG_NAME, value: "*" }],
    });

    const bastionId = bastionInstance?.tags[BASTION_INSTANCE_ID_TAG_NAME];

    if (!bastionId) {
      throw new Error(`Can't find bastion for the selected VPC.`);
    }

    return bastionId;
  }
}
