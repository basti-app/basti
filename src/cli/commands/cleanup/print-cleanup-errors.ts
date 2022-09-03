import { cli } from "../../../common/cli.js";
import { fmt } from "../../../common/fmt.js";
import { CleanupErrors } from "./cleanup-resources.js";

export function printCleanupOutcome(cleanupErrors: CleanupErrors): void {
  if (cleanupErrors.length === 0) {
    cli.success("All resources deleted");
    return;
  }

  cli.error("Cleanup errors:");
  cli
    .createSubInstance({ indent: 2 })
    .out(fmt.list(cleanupErrors.map((error) => fmt.red(error.message))));
}
