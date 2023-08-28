import { OperationError } from '../error/operation-error.js';

import {
  isRdsClusterTargetConfig,
  isRdsInstanceTargetConfig,
  isElasticacheClusterTargetConfig,
  isElasticacheNodeTargetConfig,
} from './config-parser.js';

import type { ConnectCommandInput } from '../commands/connect/connect.js';
import type { Config } from './config-parser.js';

export function getConnectCommandInputFromConfig(
  config: Config | undefined,
  connection: string
): ConnectCommandInput {
  if (!config) {
    throw OperationError.fromErrorMessage({
      operationName: 'Resoling connection from configuration file',
      message: 'No configuration file found',
    });
  }

  const connectionConfig = config.connections?.[connection];

  if (!connectionConfig) {
    throw OperationError.fromErrorMessage({
      operationName: 'Resolving connection from configuration file',
      message: `No connection with name "${connection}" found in configuration file`,
    });
  }

  const connectionTarget =
    typeof connectionConfig.target === 'object'
      ? connectionConfig.target
      : config.targets?.[connectionConfig.target];

  if (!connectionTarget) {
    throw OperationError.fromErrorMessage({
      operationName: 'Resoling connection from configuration file',
      message: `No target with name "${
        connectionConfig.target as string
      }" found in configuration file`,
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
      : isElasticacheClusterTargetConfig(connectionTarget)
      ? {
          elasticacheClusterId: connectionTarget.elasticacheCluster,
          awsClientConfig,
        }
      : isElasticacheNodeTargetConfig(connectionTarget)
      ? {
          elasticacheNodeId: connectionTarget.elasticacheNode,
          awsClientConfig,
        }
      : {
          customTargetVpcId: connectionTarget.customTargetVpc,
          customTargetHost: connectionTarget.customTargetHost,
          customTargetPort: connectionTarget.customTargetPort,
          awsClientConfig,
        },
    localPort: connectionConfig.localPort,
  };
}
