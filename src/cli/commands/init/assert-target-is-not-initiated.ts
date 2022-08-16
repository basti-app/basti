import { AwsAccessDeniedError } from "../../../aws/common/AwsError.js";
import { cli } from "../../../common/cli.js";
import { InitTarget } from "../../../target/init-target.js";
import { ExpectedError, UnexpectedError } from "../../error.js";

export interface AssertTargetIsNotInitiatedInput {
  target: InitTarget;
}

export async function assertTargetIsNotInitialized({
  target,
}: AssertTargetIsNotInitiatedInput): Promise<void> {
  const targetInitialized = await isTargetInitialized(target);

  if (targetInitialized) {
    cli.info(
      "The selected target has already been initialized. If you'd like to re-initialize Basti, please, clean up your account first"
    );
    process.exit(0);
  }
}

async function isTargetInitialized(target: InitTarget): Promise<boolean> {
  if (!target.hasAccessAllowed) {
    return false;
  }

  try {
    cli.progressStart("Checking target state");
    const isAccessAllowed = await target.hasAccessAllowed();
    cli.progressStop();
    return isAccessAllowed;
  } catch (error) {
    if (error instanceof AwsAccessDeniedError) {
      throw new ExpectedError(
        "Failed to check target state. Access denied by IAM"
      );
    }
    throw new UnexpectedError("Failed to check target state", error);
  }
}
