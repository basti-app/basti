import { OperationError } from '../error/operation-error.js';

import {
  isRdsClusterTargetConfig,
  isRdsInstanceTargetConfig,
} from './config-parser.js';

import type { ConnectCommandInput } from '../commands/connect/connect.js';
import type { Config } from './config-parser.js';

export function getConnectCommandInputFromConfig(
  config: Config | undefined,
  optionsSet: string
): ConnectCommandInput {
  if (!config) {
    throw OperationError.fromErrorMessage({
      operationName: 'Resoling options set',
      message: 'No configuration file found',
    });
  }

  const connectOptionsConfig = config.connect[optionsSet];

  if (!connectOptionsConfig) {
    throw OperationError.fromErrorMessage({
      operationName: 'Resolving options set from configuration file',
      message: `No options set named "${optionsSet}" found in configuration file`,
    });
  }

  const connectionTarget = config.targets[connectOptionsConfig.target];

  if (!connectionTarget) {
    throw OperationError.fromErrorMessage({
      operationName: 'Resoling options set from configuration file',
      message: `No target named "${connectOptionsConfig.target}" found in configuration file`,
    });
  }

  const awsClientConfig =
    connectionTarget.awsProfile !== undefined ||
    connectionTarget.awsRegion !== undefined
      ? {
          profile: connectionTarget.awsProfile,
          region: connectionTarget.awsRegion,
        }
      : undefined;

  return {
    target: isRdsInstanceTargetConfig(connectionTarget)
      ? {
          rdsInstanceId: connectionTarget.rdsInstance,
          awsClientConfig,
        }
      : isRdsClusterTargetConfig(connectionTarget)
      ? {
          rdsClusterId: connectionTarget.rdsCluster,
          awsClientConfig,
        }
      : {
          customTargetVpcId: connectionTarget.customTargetVpc,
          customTargetHost: connectionTarget.customTargetHost,
          customTargetPort: connectionTarget.customTargetPort,
          awsClientConfig,
        },
    localPort: connectOptionsConfig.localPort,
  };
}
