export interface AwsClientConfiguration {
  region?: string;
  profile?: string;
}
export type AwsClientConstructor<T> = new (config: AwsClientConfiguration) => T;

export interface RawAwsClient {
  send: (...args: any[]) => Promise<any>;
}

export type AwsClientErrorHandler<TResponse> = (
  handler: () => Promise<TResponse>
) => Promise<TResponse>;

export class AwsClient<T extends RawAwsClient> {
  // The global config is expected to be overriden on the application startup before
  // the command dynamic import happens and any AWS client is instantiated.
  private static readonly AWS_CLIENT_GLOBAL_CONFIGURATION: AwsClientConfiguration =
    {};

  public readonly client: T;

  private readonly errorHandler?: AwsClientErrorHandler<ReturnType<T['send']>>;

  constructor({
    Client,
    errorHandler,
  }: {
    Client: AwsClientConstructor<T>;
    errorHandler?: AwsClientErrorHandler<ReturnType<T['send']>>;
  }) {
    this.client = new Client(AwsClient.AWS_CLIENT_GLOBAL_CONFIGURATION);
    this.errorHandler = errorHandler;
  }

  static setGlobalConfiguration(config: AwsClientConfiguration): void {
    Object.assign(AwsClient.AWS_CLIENT_GLOBAL_CONFIGURATION, config);
  }

  send: T['send'] = async (...args) =>
    this.errorHandler !== undefined
      ? await this.errorHandler(async () => await this.client.send(...args))
      : await this.client.send(...args);
}
