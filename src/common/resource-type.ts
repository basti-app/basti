export const ManagedResourceType = {
  ACCESS_SECURITY_GROUP: 'ACCESS_SECURITY_GROUP',
  BASTION_INSTANCE: 'BASTION_INSTANCE',
  BASTION_SECURITY_GROUP: 'BASTION_SECURITY_GROUP',
  BASTION_INSTANCE_PROFILE: 'BASTION_INSTANCE_PROFILE',
  BASTION_ROLE: 'BASTION_ROLE',
} as const;
export type ManagedResourceType =
  typeof ManagedResourceType[keyof typeof ManagedResourceType];

export const TargetType = {
  RDS_INSTANCE: 'RDS_INSTANCE',
  RDS_CLUSTER: 'RDS_CLUSTER',
  CUSTOM: 'CUSTOM',
} as const;
export type TargetType = typeof TargetType[keyof typeof TargetType];

export type ResourceType = ManagedResourceType | TargetType;
