import { cli } from "../../../common/cli.js";
import { InitTarget } from "../../../target/init-target.js";
import { handleOperation } from "../common/handle-operation.js";

export interface AssertTargetIsNotInitiatedInput {
  target: InitTarget;
}

export async function assertTargetIsNotInitialized({
  target,
}: AssertTargetIsNotInitiatedInput): Promise<void> {
  const targetInitialized = await handleOperation(
    "checking target state",
    async () => {
      return target.hasAccessAllowed ? target.hasAccessAllowed() : false;
    }
  );

  if (targetInitialized) {
    cli.info(
      "The selected target has already been initialized. If you'd like to re-initialize Basti, please, clean up your account first"
    );
    process.exit(0);
  }
}
