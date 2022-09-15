import {
  ManagedResourceType,
  ManagedResourceTypes,
} from '../common/resource-type.js';

export type ManagedResources = {
  [key in ManagedResourceType]: string[];
};

export const CLEANUP_ORDER: ManagedResourceType[] = [
  ManagedResourceTypes.ACCESS_SECURITY_GROUP,
  ManagedResourceTypes.BASTION_INSTANCE,
  ManagedResourceTypes.BASTION_SECURITY_GROUP,
  ManagedResourceTypes.BASTION_INSTANCE_PROFILE,
  ManagedResourceTypes.BASTION_ROLE,
];
