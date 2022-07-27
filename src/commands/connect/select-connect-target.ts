import { ConnectTarget } from "../../target/connect-target.js";
import { createConnectTarget } from "../../target/create-connect-target.js";
import { selectTarget } from "../common/select-target.js";

export async function selectConnectTarget(): Promise<ConnectTarget> {
  const target = await selectTarget();

  return createConnectTarget(target);
}
