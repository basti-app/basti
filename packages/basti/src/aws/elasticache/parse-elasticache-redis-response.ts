import { z } from 'zod';

import type {
  ReplicationGroup,
  CacheNode,
  NodeGroupMember,
  NodeGroup,
  CacheSubnetGroup,
  ServerlessCache,
} from '@aws-sdk/client-elasticache';
import type {
  AwsElasticacheRedisGenericObject,
  AwsElasticacheSubnetGroup,
  AwsElasticacheServerlessCache,
} from './elasticache-types.js';

export function parseElasticacheResponse(
  response: ReplicationGroup
): AwsElasticacheRedisGenericObject {
  return response.ClusterEnabled !== undefined && response.ClusterEnabled
    ? parseElasticacheReplicationGroupCMEResponse(response)
    : parseElasticacheReplicationGroupCMDResponse(response);
}

export function parseNodeGroupMemberResponse(
  nodeGroupMember: NodeGroupMember,
  replicationGroupId: string
): AwsElasticacheRedisGenericObject {
  const Parsed: AwsElasticacheRedisGenericObject =
    transformNodeGroupMemberResponse(nodeGroupMember);
  Parsed.replicationGroupId = replicationGroupId;
  return Parsed;
}
export function parseNodeGroupResponse(
  nodeGroup: NodeGroup,
  replicationGroupId: string
): AwsElasticacheRedisGenericObject {
  const Parsed: AwsElasticacheRedisGenericObject =
    transformNodeGroupResponse(nodeGroup);
  Parsed.replicationGroupId = replicationGroupId;
  return Parsed;
}

export function parseCacheNodeResponse(
  cacheNode: CacheNode,
  replicationGroupId: string
): AwsElasticacheRedisGenericObject {
  const Parsed: AwsElasticacheRedisGenericObject =
    transformCacheNodeResponse(cacheNode);
  Parsed.replicationGroupId = replicationGroupId;
  return Parsed;
}

const transformCacheNodeResponse: (
  response?: CacheNode
) => AwsElasticacheRedisGenericObject = z
  .object({
    CacheNodeId: z.string(),
    Endpoint: z.object({
      Address: z.string(),
      Port: z.number(),
    }),
  })
  .transform(response => ({
    identifier: response.CacheNodeId,
    host: response.Endpoint.Address,
    port: response.Endpoint.Port,
    clusterMode: 'enabled',
    nodeGroups: [],
    replicationGroupId: '',
  })).parse;

export const parseElasticacheReplicationGroupCMDResponse: (
  response?: ReplicationGroup
) => AwsElasticacheRedisGenericObject = z
  .object({
    NodeGroups: z.any(),
    ReplicationGroupId: z.string(),
  })
  .transform(response => ({
    identifier: response.ReplicationGroupId,
    host: response.NodeGroups[0].PrimaryEndpoint.Address,
    port: response.NodeGroups[0].PrimaryEndpoint.Port,
    clusterMode: 'disabled',
    nodeGroups: response.NodeGroups,
    replicationGroupId: response.ReplicationGroupId,
  })).parse;

export const parseElasticacheReplicationGroupCMEResponse: (
  response?: ReplicationGroup
) => AwsElasticacheRedisGenericObject = z
  .object({
    ReplicationGroupId: z.string(),
    ConfigurationEndpoint: z.object({
      Address: z.string(),
      Port: z.number(),
    }),
    ClusterMode: z.string(),
    NodeGroups: z.any(),
  })
  .transform(response => ({
    identifier: response.ReplicationGroupId,
    host: response.ConfigurationEndpoint.Address,
    port: response.ConfigurationEndpoint.Port,
    clusterMode: response.ClusterMode,
    nodeGroups: response.NodeGroups,
    replicationGroupId: response.ReplicationGroupId,
  })).parse;

export const parseElasticacheSubnetGroup: (
  response?: CacheSubnetGroup
) => AwsElasticacheSubnetGroup = z
  .object({
    CacheSubnetGroupName: z.string(),
    VpcId: z.string(),
  })
  .transform(response => ({
    name: response.CacheSubnetGroupName,
    vpcId: response.VpcId,
  })).parse;

const transformNodeGroupMemberResponse: (
  response?: NodeGroupMember
) => AwsElasticacheRedisGenericObject = z
  .object({
    CacheClusterId: z.string(),
    ReadEndpoint: z.object({
      Address: z.string(),
      Port: z.number(),
    }),
    NodeGroups: z.any(),
  })
  .transform(response => ({
    identifier: response.CacheClusterId,
    host: response.ReadEndpoint.Address,
    port: response.ReadEndpoint.Port,
    clusterMode: 'disabled',
    nodeGroups: [],
    replicationGroupId: '',
  })).parse;

const transformNodeGroupResponse: (
  response?: NodeGroup
) => AwsElasticacheRedisGenericObject = z
  .object({
    NodeGroupId: z.string(),
    PrimaryEndpoint: z.object({
      Address: z.string(),
      Port: z.number(),
    }),
  })
  .transform(response => ({
    identifier: response.NodeGroupId,
    host: response.PrimaryEndpoint.Address,
    port: response.PrimaryEndpoint.Port,
    clusterMode: 'disabled',
    nodeGroups: [],
    replicationGroupId: '',
  })).parse;

export function parseServerlessCacheResponse(
  response: ServerlessCache
): AwsElasticacheServerlessCache[] {
  return [
    {
      identifier: response.ServerlessCacheName!,
      host: response.Endpoint!.Address!,
      port: response.Endpoint!.Port!,
      securityGroups: response.SecurityGroupIds!,
      subnetGroupName: response.SubnetIds!,
      reader: false,
    },
    {
      identifier: response.ServerlessCacheName!,
      host: response.ReaderEndpoint!.Address!,
      port: response.ReaderEndpoint!.Port!,
      securityGroups: response.SecurityGroupIds!,
      subnetGroupName: response.SubnetIds!,
      reader: true,
    },
  ];
}
