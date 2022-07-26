import { InitTarget } from "../../target/init-target.js";
import { createInitTarget } from "../../target/target.js";
import { selectTarget } from "../common/select-target.js";

export async function selectInitTarget(): Promise<InitTarget> {
  const target = await selectTarget();

  return createInitTarget(target);
}
