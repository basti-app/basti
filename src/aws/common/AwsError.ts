export class AwsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AwsError";
  }
}

export class AwsAccessDeniedError extends AwsError {
  constructor() {
    super("User is not allowed to perform the operation");
    this.name = "AwsAccessDeniedError";
  }
}
