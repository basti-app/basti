import { terminateEc2Instances } from '../aws/ec2/terminate-ec2-instances.js';

import type { ResourceCleaner } from './resource-cleaner.js';

export const bastionInstanceCleaner: ResourceCleaner = async instanceId => {
  await terminateEc2Instances({ instanceIds: [instanceId] });
};
