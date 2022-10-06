import { DBCluster, DBInstance, DBSubnetGroup } from '@aws-sdk/client-rds';
import { z } from 'zod';

import { AwsDbCluster, AwsDbSubnetGroup, AwsDbInstance } from './rds-types.js';

export const parseDbInstanceResponse: (response?: DBInstance) => AwsDbInstance =
  z
    .object({
      DBInstanceIdentifier: z.string(),
      DBClusterIdentifier: z.string().optional(),
      DBSubnetGroup: z.object({
        VpcId: z.string(),
      }),
      VpcSecurityGroups: z.array(
        z.object({
          VpcSecurityGroupId: z.string(),
        })
      ),
      Endpoint: z.object({
        Address: z.string(),
        Port: z.number(),
      }),
    })
    .transform(response => ({
      identifier: response.DBInstanceIdentifier,
      clusterIdentifier: response.DBClusterIdentifier,
      vpcId: response.DBSubnetGroup.VpcId,
      securityGroupIds: response.VpcSecurityGroups.map(
        sg => sg.VpcSecurityGroupId
      ),
      host: response.Endpoint.Address,
      port: response.Endpoint.Port,
    })).parse;

export const parseDbClusterResponse: (response?: DBCluster) => AwsDbCluster = z
  .object({
    DBClusterIdentifier: z.string(),
    DBSubnetGroup: z.string(),
    VpcSecurityGroups: z.array(
      z.object({
        VpcSecurityGroupId: z.string(),
      })
    ),
    Endpoint: z.string(),
    Port: z.number(),
  })
  .transform(response => ({
    identifier: response.DBClusterIdentifier,
    dbSubnetGroupName: response.DBSubnetGroup,
    securityGroupIds: response.VpcSecurityGroups.map(
      sg => sg.VpcSecurityGroupId
    ),
    host: response.Endpoint,
    port: response.Port,
  })).parse;

export const parseDbSubnetGroup: (
  response?: DBSubnetGroup
) => AwsDbSubnetGroup = z
  .object({
    DBSubnetGroupName: z.string(),
    VpcId: z.string(),
  })
  .transform(response => ({
    name: response.DBSubnetGroupName,
    vpcId: response.VpcId,
  })).parse;
