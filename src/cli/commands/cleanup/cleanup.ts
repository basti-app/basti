import { cleanupResources } from "./cleanup-resources.js";
import { confirmCleanup } from "./confirm-cleanup.js";
import { getResourcesToCleanup } from "./get-resources-to-cleanup.js";

export async function handleCleanup(): Promise<void> {
  const resources = await getResourcesToCleanup();

  await confirmCleanup({ resources });

  await cleanupResources({
    resources,
  });
}
