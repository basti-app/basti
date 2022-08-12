export const ManagedResourceGroups = [
  "accessSecurityGroups",
  "bastionSecurityGroups",
  "bastionInstances",
  "bastionInstanceProfiles",
  "bastionRoles",
] as const;
export type ManagedResourceGroup = typeof ManagedResourceGroups[number];

export type ManagedResources = {
  [key in ManagedResourceGroup]: string[];
};
