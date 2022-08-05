import { InitTarget } from "../../target/init-target.js";

export interface AssertTargetIsNotInitiatedInput {
  target: InitTarget;
}

export async function assertTargetIsNotInitiated({
  target,
}: AssertTargetIsNotInitiatedInput): Promise<void> {
  if (!target.hasAccessAllowed) {
    return;
  }

  if (await target.hasAccessAllowed()) {
    console.log(
      `The selected target has already been initiated for use with Basti. If you need to re-initiate Basti, please, do cleanup first`
    );
    process.exit(1);
  }
}
