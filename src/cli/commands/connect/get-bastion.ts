import { Bastion } from "../../../bastion/bastion.js";
import * as bastionOps from "../../../bastion/get-bastion.js";
import {
  ResourceNotFoundError,
  ResourceType,
  UnexpectedStateError,
} from "../../../common/runtime-error.js";
import { ConnectTarget } from "../../../target/connect-target.js";
import { OperationError } from "../../error/operation-error.js";
import { handleOperation } from "../common/handle-operation.js";

export interface GetBastionInput {
  target: ConnectTarget;
}

export async function getBastion({
  target,
}: GetBastionInput): Promise<Bastion> {
  const bastionId = await handleOperation(
    "retrieving bastion id from target",
    () => target.getBastionId()
  );

  const bastion = await handleOperation("retrieving bastion", () =>
    bastionOps.getBastion({ bastionId })
  );

  if (!bastion) {
    throw OperationError.from({
      operationName: "retrieving bastion",
      error: new UnexpectedStateError(
        new ResourceNotFoundError(ResourceType.BASTION_INSTANCE, bastionId)
      ),
    });
  }

  return bastion;
}
