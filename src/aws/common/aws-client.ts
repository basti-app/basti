type ClientConstructor<T> = new (input: { region: string }) => T;

interface Client {
  send: (...args: any[]) => Promise<any>;
}

type ErrorHandler<TResponse> = (
  handler: () => Promise<TResponse>
) => Promise<TResponse>;

export class AwsClient<T extends Client> {
  public readonly client: T;
  private readonly errorHandler?: ErrorHandler<ReturnType<T["send"]>>;

  constructor({
    client,
    errorHandler,
  }: {
    client: ClientConstructor<T>;
    errorHandler?: ErrorHandler<ReturnType<T["send"]>>;
  }) {
    this.client = new client({ region: "us-east-1" });
    this.errorHandler = errorHandler;
  }

  send: T["send"] = (...args) =>
    this.errorHandler
      ? this.errorHandler(() => this.client.send(...args))
      : this.client.send(...args);
}
