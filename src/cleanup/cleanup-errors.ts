import { ManagedResources } from "./managed-resources.js";

export type CleanupErrorReason = "UNKNOWN" | "DEPENDENCY_VIOLATION";

export interface CleanupError {
  reason: CleanupErrorReason;
  message?: string;
}

export interface ResourceCleanupError extends CleanupError {
  resourceId: string;
}

export interface BatchCleanupError extends CleanupError {}

export type ManagedResourcesCleanupErrors = {
  [key in keyof ManagedResources]:
    | ResourceCleanupError[]
    | BatchCleanupError
    | undefined;
};

export type ResourceCleaner = (
  resourceId: string
) => Promise<CleanupError | undefined>;

export type BatchResourceCleaner = (
  resourceIds: string[]
) => Promise<CleanupError | undefined>;
