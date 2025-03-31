import { InitCommandInput, InitCommandRequiredInput } from '../commands/init/init-command-input.js';
import { OperationError } from '../error/operation-error.js';
import { InitOptions } from '../yargs/get-command-input.js';
import { getTagsFromOptions } from '../yargs/tags/get-tags-from-options.js';

import {
  isRdsClusterTargetConfig,
  isRdsInstanceTargetConfig,
  isElasticacheRedisClusterTargetConfig,
  isElasticacheRedisNodeTargetConfig,
  isElasticacheMemcachedClusterTargetConfig,
  isElasticacheMemcachedNodeTargetConfig,
} from './config-parser.js';


import type { Config } from './config-parser.js';

export function getInitCommandInputFromConfig(
  config: Config | undefined,
  target: string,
  options: InitOptions
): InitCommandInput {
  if (!config) {
    throw OperationError.fromErrorMessage({
      operationName: 'Resolving target from configuration file',
      message: 'No configuration file found',
    });
  }

  const targetConfig = config.targets?.[target];

  if (!targetConfig) {
    throw OperationError.fromErrorMessage({
      operationName: 'Resolving initialization from configuration file',
      message: `No target with name "${target}" found in configuration file`,
    });
  }
  console.log(targetConfig)
  
  const initTarget =
    typeof targetConfig === 'object'
      ? targetConfig
      : config.targets?.[target];

  if (!initTarget) {
    throw OperationError.fromErrorMessage({
      operationName: 'Resolving target from configuration file',
      message: `No target with name "${
        target as string
      }" found in configuration file`,
    });
  }

  const awsClientConfig =
    initTarget.awsProfile !== undefined ||
    initTarget.awsRegion !== undefined
      ? {
          profile: initTarget.awsProfile,
          region: initTarget.awsRegion,
        }
      : undefined;

  return {
    target: isRdsInstanceTargetConfig(initTarget)
      ? {
          rdsInstanceId: initTarget.rdsInstance,
          awsClientConfig,
        }
      : isRdsClusterTargetConfig(initTarget)
      ? {
          rdsClusterId: initTarget.rdsCluster,
          awsClientConfig,
        }
      : isElasticacheRedisClusterTargetConfig(initTarget)
      ? {
          elasticacheRedisClusterId: initTarget.elasticacheRedisCluster,
          awsClientConfig,
        }
      : isElasticacheRedisNodeTargetConfig(initTarget)
      ? {
          elasticacheRedisNodeId: initTarget.elasticacheRedisNode,
          awsClientConfig,
        }
      : isElasticacheMemcachedClusterTargetConfig(initTarget)
      ? {
          elasticacheMemcachedClusterId:
            initTarget.elasticacheMemcachedCluster,
          awsClientConfig,
        }
      : isElasticacheMemcachedNodeTargetConfig(initTarget)
      ? {
          elasticacheMemcachedNodeId: initTarget.elasticacheMemcachedNode,
          awsClientConfig,
        }
      : {
          customTargetVpcId: initTarget.customTargetVpc,
          awsClientConfig,
        },
    bastionSubnet: initTarget.bastionSubnet,
    tags: getTagsFromOptions(options)
  };
}
