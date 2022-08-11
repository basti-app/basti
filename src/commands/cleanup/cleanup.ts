import { cleanupResources } from "./cleanup-resources.js";
import { getResourcesToCleanup } from "./get-resources-to-cleanup.js";

export async function handleCleanup(): Promise<void> {
  const resources = await getResourcesToCleanup();

  const errors = await cleanupResources({
    resources,
  });

  console.log(errors);
}
