import { ManagedResourceType } from "../common/resource-type.js";

export type ManagedResources = {
  [key in ManagedResourceType]: string[];
};

export const CLEANUP_ORDER: ManagedResourceType[] = [
  ManagedResourceType.ACCESS_SECURITY_GROUP,
  ManagedResourceType.BASTION_INSTANCE,
  ManagedResourceType.BASTION_SECURITY_GROUP,
  ManagedResourceType.BASTION_INSTANCE_PROFILE,
  ManagedResourceType.BASTION_ROLE,
];
