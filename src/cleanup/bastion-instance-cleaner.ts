import { terminateEc2Instances } from '../aws/ec2/terminate-ec2-instances.js';
import { ResourceCleaner } from './resource-cleaner.js';

export const bastionInstanceCleaner: ResourceCleaner = async instanceId => {
  await terminateEc2Instances({ instanceIds: [instanceId] });
};
