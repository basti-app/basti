import { z } from 'zod';

import type {
  ReplicationGroup,
  CacheNode,
  NodeGroupMember,
  NodeGroup,
  CacheSubnetGroup,
} from '@aws-sdk/client-elasticache';
import type {
  AwsElasticacheGenericObject,
  AwsElasticacheSubnetGroup,
} from './elasticache-types.js';

export function parseElasticacheResponse(
  response: ReplicationGroup
): AwsElasticacheGenericObject {
  return response.ClusterEnabled !== undefined && response.ClusterEnabled
    ? parseElasticacheReplicationGroupCMEResponse(response)
    : parseElasticacheReplicationGroupCMDResponse(response);
}

export function parseNodeGroupMemberResponseFunction(
  nodeGroupMember: NodeGroupMember,
  replicationGroupId: string
): AwsElasticacheGenericObject {
  const Parsed: AwsElasticacheGenericObject =
    parseNodeGroupMemberResponse(nodeGroupMember);
  Parsed.replicationGroupId = replicationGroupId;
  return Parsed;
}
export function parseNodeGroupResponseFunction(
  nodeGroup: NodeGroup,
  replicationGroupId: string
): AwsElasticacheGenericObject {
  const Parsed: AwsElasticacheGenericObject = parseNodeGroupResponse(nodeGroup);
  Parsed.replicationGroupId = replicationGroupId;
  return Parsed;
}

export const parseCacheNodeResponse: (
  response?: CacheNode
) => AwsElasticacheGenericObject = z
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
) => AwsElasticacheGenericObject = z
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
) => AwsElasticacheGenericObject = z
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

const parseNodeGroupMemberResponse: (
  response?: NodeGroupMember
) => AwsElasticacheGenericObject = z
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

export const parseNodeGroupResponse: (
  response?: NodeGroup
) => AwsElasticacheGenericObject = z
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

// export function transformReplicationGroupsCmeToChoises(replicationGroup: ReplicationGroup[]):
