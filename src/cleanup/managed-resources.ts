export const ManagedResourceGroup = {
  ACCESS_SECURITY_GROUP: "ACCESS_SECURITY_GROUP",
  BASTION_INSTANCE: "BASTION_INSTANCE",
  BASTION_SECURITY_GROUP: "BASTION_SECURITY_GROUP",
  BASTION_INSTANCE_PROFILE: "BASTION_INSTANCE_PROFILE",
  BASTION_ROLE: "BASTION_ROLE",
} as const;
export type ManagedResourceGroup =
  typeof ManagedResourceGroup[keyof typeof ManagedResourceGroup];

export const ManagedResourceGroups = Object.values(ManagedResourceGroup);

export type ManagedResources = {
  [key in ManagedResourceGroup]: string[];
};
