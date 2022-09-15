import type { WaiterConfiguration } from '@aws-sdk/util-waiter';

export const COMMON_WAITER_CONFIG: Omit<WaiterConfiguration<any>, 'client'> = {
  minDelay: 2,
  maxDelay: 2,
  maxWaitTime: 600,
};
