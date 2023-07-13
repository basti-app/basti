export type ResourceCleaner = (resourceId: string) => Promise<void>;

export type ResourcesCleanupPreparer = (resourceIds: string[]) => Promise<void>;
