import { getTagsFromOptions } from './tags/get-tags-from-options.js';

import type { TagOptions } from './tags/get-tags-from-options.js';
import type { InitCommandInput } from '../commands/init/init-command-input.js';
import type { ConnectCommandInput } from '../commands/connect/connect.js';

export interface RdsInstanceOptions {
  rdsInstance: string;
}

export interface RdsClusterOptions {
  rdsCluster: string;
}

export interface ElasticacheRedisClusterOptions {
  elasticacheRedisCluster: string;
}

export interface ElasticacheRedisNodeOptions {
  elasticacheRedisNode: string;
}
export interface ElasticacheRedisServerlessOptions {
  elasticacheRedisServerless: string;
  readerEnpoint: boolean;
}
export interface ElasticacheMemcachedClusterOptions {
  elasticacheMemcachedCluster: string;
}

export interface ElasticacheMemcachedNodeOptions {
  elasticacheMemcachedNode: string;
}

export interface CustomTargetVpcOptions {
  customTargetVpc: string;
}

export interface CustomTargetOptions {
  customTargetVpc: string;
  customTargetHost: string;
  customTargetPort: number;
}

export type InitOptions = Partial<RdsInstanceOptions> &
  Partial<RdsClusterOptions> &
  Partial<ElasticacheRedisClusterOptions> &
  Partial<ElasticacheMemcachedClusterOptions> &
  Partial<ElasticacheRedisServerlessOptions> &
  Partial<CustomTargetVpcOptions> & {
    bastionSubnet?: string;
    bastionInstanceType?: string;
  } & TagOptions;

export type ConnectOptions = Partial<RdsInstanceOptions> &
  Partial<RdsClusterOptions> &
  Partial<ElasticacheRedisClusterOptions> &
  Partial<ElasticacheRedisNodeOptions> &
  Partial<ElasticacheMemcachedClusterOptions> &
  Partial<ElasticacheMemcachedNodeOptions> &
  Partial<ElasticacheRedisServerlessOptions> & {
    readerEndpoint?: Boolean;
  } & Partial<CustomTargetOptions> & {
    localPort?: number;
  };

export interface CleanupOptions {
  confirm?: boolean;
}

export function getInitCommandInputFromOptions(
  options: InitOptions
): InitCommandInput {
  return {
    target: isRdsInstanceOptions(options)
      ? {
          rdsInstanceId: options.rdsInstance,
        }
      : isRdsClusterOptions(options)
      ? {
          rdsClusterId: options.rdsCluster,
        }
      : isElasticacheRedisServerlessOptions(options)
      ? {
          elasticacheRedisServerlessCacheId: options.elasticacheRedisServerless,
        }
      : isElasticacheRedisClusterOptions(options)
      ? {
          elasticacheRedisClusterId: options.elasticacheRedisCluster,
        }
      : isElasticacheMemcachedClusterOptions(options)
      ? {
          elasticacheMemcachedClusterId: options.elasticacheMemcachedCluster,
        }
      : isCustomTargetOptions(options)
      ? {
          customTargetVpcId: options.customTargetVpc,
        }
      : undefined,
    bastionSubnet: options.bastionSubnet,
    tags: getTagsFromOptions(options),
    instanceType: options.bastionInstanceType,
  };
}

export function getConnectCommandInputFromOptions(
  options: ConnectOptions
): ConnectCommandInput {
  return {
    target: isRdsInstanceOptions(options)
      ? {
          rdsInstanceId: options.rdsInstance,
        }
      : isRdsClusterOptions(options)
      ? {
          rdsClusterId: options.rdsCluster,
        }
      : isElasticacheRedisServerlessOptions(options)
      ? {
          elasticacheRedisServerlessCacheId: options.elasticacheRedisServerless,
          readerEnpoint: options.readerEnpoint,
        }
      : isElasticacheRedisClusterOptions(options)
      ? {
          elasticacheRedisClusterId: options.elasticacheRedisCluster,
        }
      : isElasticacheRedisNodeOptions(options)
      ? {
          elasticacheRedisNodeId: options.elasticacheRedisNode,
        }
      : isElasticacheMemcachedClusterOptions(options)
      ? {
          elasticacheMemcachedClusterId: options.elasticacheMemcachedCluster,
        }
      : isElasticacheMemcachedNodeOptions(options)
      ? {
          elasticacheMemcachedNodeId: options.elasticacheMemcachedNode,
        }
      : isCustomTargetOptions(options)
      ? {
          customTargetVpcId: options.customTargetVpc,
          customTargetHost: options.customTargetHost,
          customTargetPort: options.customTargetPort,
        }
      : undefined,
    localPort: options.localPort,
  };
}

export function getCleanupCommandInputFromOptions(
  options: CleanupOptions
): CleanupOptions {
  return {
    confirm: options.confirm,
  };
}

function isRdsInstanceOptions(
  options: ConnectOptions | InitOptions
): options is RdsInstanceOptions {
  return 'rdsInstance' in options;
}

function isRdsClusterOptions(
  options: ConnectOptions | InitOptions
): options is RdsClusterOptions {
  return 'rdsCluster' in options;
}

function isElasticacheRedisClusterOptions(
  options: ConnectOptions | InitOptions
): options is ElasticacheRedisClusterOptions {
  return 'elasticacheRedisCluster' in options;
}
function isElasticacheRedisNodeOptions(
  options: ConnectOptions | InitOptions
): options is ElasticacheRedisNodeOptions {
  return 'elasticacheRedisNode' in options;
}
function isElasticacheRedisServerlessOptions(
  options: ConnectOptions | InitOptions
): options is ElasticacheRedisServerlessOptions {
  return 'elasticacheServerlessCache' in options;
}

function isElasticacheMemcachedClusterOptions(
  options: ConnectOptions | InitOptions
): options is ElasticacheMemcachedClusterOptions {
  return 'elasticacheMemcachedCluster' in options;
}
function isElasticacheMemcachedNodeOptions(
  options: ConnectOptions | InitOptions
): options is ElasticacheMemcachedNodeOptions {
  return 'elasticacheMemcachedNode' in options;
}

function isCustomTargetOptions(
  options: InitOptions
): options is CustomTargetVpcOptions;
function isCustomTargetOptions(
  options: ConnectOptions
): options is CustomTargetOptions;
function isCustomTargetOptions(options: ConnectOptions | InitOptions): any {
  return 'customTargetVpc' in options;
}
