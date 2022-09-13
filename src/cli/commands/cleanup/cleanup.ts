import { cleanupResources } from "./cleanup-resources.js";
import { confirmCleanup } from "./confirm-cleanup.js";
import { getResourcesToCleanup } from "./get-resources-to-cleanup.js";

export interface CleanupCommandInput {
  confirm?: boolean;
}

export async function handleCleanup({
  confirm,
}: CleanupCommandInput): Promise<void> {
  const resources = await getResourcesToCleanup();

  confirm || (await confirmCleanup({ resources }));

  await cleanupResources({
    resources,
  });
}
