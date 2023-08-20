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

export interface ElasticacheClusterOptions {
  elasticacheCluster: string;
}

export interface ElasticacheNodeOptions {
  elasticachenode: string;
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
  Partial<ElasticacheClusterOptions> &
  Partial<CustomTargetVpcOptions> & {
    bastionSubnet?: string;
    bastionInstanceType?: string;
  } & TagOptions;

export type ConnectOptions = Partial<RdsInstanceOptions> &
  Partial<RdsClusterOptions> &
  Partial<ElasticacheNodeOptions> &
  Partial<CustomTargetOptions> & {
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
      : isElasticacheClusterOptions(options)
      ? {
          elasticacheCluster: options.elasticacheCluster,
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

function isElasticacheClusterOptions(
  options: ConnectOptions | InitOptions
): options is ElasticacheClusterOptions {
  return 'elasticacheCluster' in options;
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
