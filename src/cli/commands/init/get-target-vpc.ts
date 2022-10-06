import { InitTarget } from '~/target/init-target.js';

import { handleOperation } from '../common/handle-operation.js';

export async function getTargetVpc(target: InitTarget): Promise<string> {
  return await handleOperation(
    'Retrieving target VPC',
    async () => await target.getVpcId()
  );
}
