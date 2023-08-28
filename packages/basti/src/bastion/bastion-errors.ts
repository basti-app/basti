import { RuntimeError } from '#src/common/runtime-errors.js';

export class BastionImageRetrievalError extends RuntimeError {
  constructor(cause: unknown) {
    super(`Can't get latest EC2 AMI for bastion instance`, cause);
  }
}

export class BastionRoleCreationError extends RuntimeError {
  constructor(cause: unknown) {
    super(`Can't create IAM role for bastion instance`, cause);
  }
}

export class BastionInlinePoliciesCreationError extends RuntimeError {
  constructor(cause: unknown) {
    super(`Can't create IAM inline policies for bastion instance`, cause);
  }
}

export class BastionSecurityGroupCreationError extends RuntimeError {
  constructor(cause: unknown) {
    super(`Can't create security group for bastion instance`, cause);
  }
}

export class BastionInstanceCreationError extends RuntimeError {
  constructor(cause: unknown) {
    super(`Can't create bastion EC2 instance`, cause);
  }
}

export class StartingInstanceError extends RuntimeError {
  readonly instanceId: string;

  constructor(instanceId: string, cause: unknown) {
    super(`Can't start bastion instance "${instanceId}"`, cause);
    this.instanceId = instanceId;
  }
}
