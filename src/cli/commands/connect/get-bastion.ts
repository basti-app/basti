import { Bastion } from '~/bastion/bastion.js';
import * as bastionOps from '~/bastion/get-bastion.js';
import { ManagedResourceTypes } from '~/common/resource-type.js';
import {
  ResourceNotFoundError,
  UnexpectedStateError,
} from '~/common/runtime-error.js';
import { ConnectTarget } from '~/target/connect-target.js';

import { OperationError } from '../../error/operation-error.js';
import { handleOperation } from '../common/handle-operation.js';

export interface GetBastionInput {
  target: ConnectTarget;
}

export async function getBastion({
  target,
}: GetBastionInput): Promise<Bastion> {
  const bastionId = await handleOperation(
    'Retrieving bastion id from target',
    async () => await target.getBastionId()
  );

  const bastion = await handleOperation(
    'Retrieving bastion',
    async () => await bastionOps.getBastion({ bastionId })
  );

  if (!bastion) {
    throw OperationError.from({
      operationName: 'Retrieving bastion',
      error: new UnexpectedStateError(
        new ResourceNotFoundError(
          ManagedResourceTypes.BASTION_INSTANCE,
          bastionId
        )
      ),
    });
  }

  return bastion;
}
