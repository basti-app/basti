import { cli } from "../../../common/cli.js";
import { InitTarget } from "../../../target/init-target.js";

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
    cli.info(
      "The selected target has already been initialized. If you want to re-initialize Basti, please, clean up your account first"
    );
    process.exit(0);
  }
}
