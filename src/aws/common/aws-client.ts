type ClientConstructor<T> = new (input: { region: string }) => T;

interface Client {
  send: (...args: any[]) => Promise<any>;
}

type ErrorHandler<TResponse> = (
  handler: () => Promise<TResponse>
) => Promise<TResponse>;

export class AwsClient<T extends Client> {
  public readonly client: T;
  private readonly errorHandler?: ErrorHandler<ReturnType<T['send']>>;

  constructor({
    Client,
    errorHandler,
  }: {
    Client: ClientConstructor<T>;
    errorHandler?: ErrorHandler<ReturnType<T['send']>>;
  }) {
    this.client = new Client({ region: 'us-east-1' });
    this.errorHandler = errorHandler;
  }

  send: T['send'] = async (...args) =>
    this.errorHandler != null
      ? await this.errorHandler(async () => await this.client.send(...args))
      : await this.client.send(...args);
}
