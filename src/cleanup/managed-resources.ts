export const ManagedResourceGroups = [
  "accessSecurityGroups",
  "bastionSecurityGroups",
  "bastionInstances",
  "bastionInstanceProfiles",
  "bastionRoles",
] as const;
export type ManagedResourceGroups = typeof ManagedResourceGroups[number];

export type ManagedResources = {
  [key in ManagedResourceGroups]: string[];
};
