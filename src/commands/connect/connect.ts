import { selectConnectTarget } from "./select-connect-target.js";

export async function handleConnect(): Promise<void> {
  const target = await selectConnectTarget();

  console.log({ target, bastionId: await target.getBastionId() });
}
