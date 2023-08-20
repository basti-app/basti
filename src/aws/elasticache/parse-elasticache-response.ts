import { z } from 'zod';

import type {
  ReplicationGroup,
  CacheNode,
  NodeGroupMember,
  NodeGroup,
  CacheSubnetGroup,
} from '@aws-sdk/client-elasticache';
import type {
  awsElasticacheCluster,
  AwsElasticacheSubnetGroup,
} from './elasticache-types.js';

export function parseElasticacheResponse(
  response: ReplicationGroup
): awsElasticacheCluster {
  return response.ClusterEnabled !== undefined && response.ClusterEnabled
    ? parseElasticacheReplicationGroupCMEResponse(response)
    : parseElasticacheReplicationGroupCMDResponse(response);
}

export const parseCacheNodeResponse: (
  response?: CacheNode
) => awsElasticacheCluster = z
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
    ClusterMode: 'enabled',
    NodeGroups: [],
    replicationGroupId: '',
  })).parse;

export const parseElasticacheReplicationGroupCMDResponse: (
  response?: ReplicationGroup
) => awsElasticacheCluster = z
  .object({
    NodeGroups: z.any(),
    ReplicationGroupId: z.string(),
  })
  .transform(response => ({
    identifier: response.ReplicationGroupId,
    host: response.NodeGroups[0].PrimaryEndpoint.Address,
    port: response.NodeGroups[0].PrimaryEndpoint.Port,
    ClusterMode: 'disabled',
    NodeGroups: response.NodeGroups,
    replicationGroupId: response.ReplicationGroupId,
  })).parse;

export const parseElasticacheReplicationGroupCMEResponse: (
  response?: ReplicationGroup
) => awsElasticacheCluster = z
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
    ClusterMode: response.ClusterMode,
    NodeGroups: response.NodeGroups,
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

export const parseNodeGroupMemberResponse: (
  response?: NodeGroupMember
) => awsElasticacheCluster = z
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
    ClusterMode: 'disabled',
    NodeGroups: [],
    replicationGroupId: '',
  })).parse;

export const parseNodeGroupResponse: (
  response?: NodeGroup
) => awsElasticacheCluster = z
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
    ClusterMode: 'disabled',
    NodeGroups: [],
    replicationGroupId: '',
  })).parse;
