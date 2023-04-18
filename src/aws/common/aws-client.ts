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

// The global config is expected to be overriden on the application startup before
// the command dynamic import happens and any AWS client is instantiated.
const AWS_CLIENT_GLOBAL_CONFIGURATION: AwsClientConfiguration = {};

export const setAwsClientGlobalConfiguration = (
  config: AwsClientConfiguration
): void => {
  Object.assign(AWS_CLIENT_GLOBAL_CONFIGURATION, config);
};

export class AwsClient<T extends RawAwsClient> {
  public readonly client: T;
  private readonly errorHandler?: AwsClientErrorHandler<ReturnType<T['send']>>;

  constructor({
    Client,
    errorHandler,
  }: {
    Client: AwsClientConstructor<T>;
    errorHandler?: AwsClientErrorHandler<ReturnType<T['send']>>;
  }) {
    this.client = new Client(AWS_CLIENT_GLOBAL_CONFIGURATION);
    this.errorHandler = errorHandler;
  }

  send: T['send'] = async (...args) =>
    this.errorHandler !== undefined
      ? await this.errorHandler(async () => await this.client.send(...args))
      : await this.client.send(...args);
}
