import { getErrorMessage } from "./get-error-message.js";

export class RuntimeError extends Error {
  public readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(cause ? `${message}. ${getErrorMessage(cause)}` : message);

    this.cause = cause;
  }
}

export class UnexpectedStateError extends RuntimeError {
  constructor(cause?: RuntimeError) {
    super(`Unexpected state`, cause);
  }
}

export const ResourceType = {
  BASTION_INSTANCE: "Bastion instance",
  BASTION_SECURITY_GROUP: "Bastion security group",
  BASTION_ROLE: "Bastion role",
  ACCESS_SECURITY_GROUP: "Access security group",
};
export type ResourceType = typeof ResourceType[keyof typeof ResourceType];

export class ResourceNotFoundError extends RuntimeError {
  public readonly resourceType: ResourceType;
  public readonly resourceId?: string;

  constructor(resourceType: ResourceType, resourceId?: string) {
    super(
      `${resourceType} ` + (resourceId ? `"${resourceId}" ` : "") + "not found"
    );

    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

export class ResourceDamagerError extends RuntimeError {
  public readonly resourceType: ResourceType;
  public readonly resourceId: string;
  public readonly detail: string;

  constructor(resourceType: ResourceType, resourceId: string, detail: string) {
    super(`${resourceType} "${resourceId}" is damaged: ${detail}`);

    this.resourceType = resourceType;
    this.resourceId = resourceId;
    this.detail = detail;
  }
}
