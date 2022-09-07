import { InitTarget } from "../../../target/init-target.js";
import { handleOperation } from "../common/handle-operation.js";

export async function getTargetVpc(target: InitTarget): Promise<string> {
  return handleOperation("retrieving target VPC", () => target.getVpcId());
}
