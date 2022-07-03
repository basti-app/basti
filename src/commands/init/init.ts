import { selectInitTarget } from "./select-init-target.js";

export async function handleInit(...args: any): Promise<void> {
  const target = await selectInitTarget();

  console.log(target);
  console.log(await target.getVpcId());
}
