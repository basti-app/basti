import { z } from 'zod';

const TargetConfigBaseParser = z.object({
  awsProfile: z.string().optional(),
  awsRegion: z.string().optional(),
});
export type TargetConfigBase = z.infer<typeof TargetConfigBaseParser>;

const RdsInstanceTargetConfigParser = z
  .object({
    rdsInstance: z.string(),
  })
  .merge(TargetConfigBaseParser);
export type RdsInstanceTargetConfig = z.infer<
  typeof RdsInstanceTargetConfigParser
>;

const RdsClusterTargetConfigParser = z
  .object({
    rdsCluster: z.string(),
  })
  .merge(TargetConfigBaseParser);
export type RdsClusterTargetConfig = z.infer<
  typeof RdsClusterTargetConfigParser
>;

const ElasticacheClusterTargetConfigParser = z
  .object({
    elasticacheCluster: z.string(),
  })
  .merge(TargetConfigBaseParser);
export type ElasticacheClusterTargetConfig = z.infer<
  typeof ElasticacheClusterTargetConfigParser
>;

const ElasticacheNodeTargetConfigParser = z
  .object({
    elasticacheNode: z.string(),
  })
  .merge(TargetConfigBaseParser);
export type ElasticacheNodeTargetConfig = z.infer<
  typeof ElasticacheNodeTargetConfigParser
>;

const CustomTargetConfigParser = z
  .object({
    customTargetVpc: z.string(),
    customTargetHost: z.string(),
    customTargetPort: z.number(),
  })
  .merge(TargetConfigBaseParser);
export type CustomTargetConfig = z.infer<typeof CustomTargetConfigParser>;

const ConnectionTargetConfigParser = z.union([
  RdsInstanceTargetConfigParser,
  RdsClusterTargetConfigParser,
  ElasticacheClusterTargetConfigParser,
  ElasticacheNodeTargetConfigParser,
  CustomTargetConfigParser,
]);
export type ConnectionTargetConfig = z.infer<
  typeof ConnectionTargetConfigParser
>;

const ConnectionConfigParser = z.object({
  target: z.union([z.string(), ConnectionTargetConfigParser]),
  localPort: z.number(),
});
export type ConnectionConfig = z.infer<typeof ConnectionConfigParser>;

export const ConfigParser = z.object({
  connections: z.record(z.string(), ConnectionConfigParser).optional(),
  targets: z.record(z.string(), ConnectionTargetConfigParser).optional(),
});
export type Config = z.infer<typeof ConfigParser>;

export function isRdsInstanceTargetConfig(
  target: ConnectionTargetConfig
): target is RdsInstanceTargetConfig {
  return 'rdsInstance' in target;
}

export function isRdsClusterTargetConfig(
  target: ConnectionTargetConfig
): target is RdsClusterTargetConfig {
  return 'rdsCluster' in target;
}

export function isElasticacheClusterTargetConfig(
  target: ConnectionTargetConfig
): target is ElasticacheClusterTargetConfig {
  return 'elasticacheCluster' in target;
}

export function isElasticacheNodeTargetConfig(
  target: ConnectionTargetConfig
): target is ElasticacheNodeTargetConfig {
  return 'elasticacheNode' in target;
}

export function isCustomTargetConfig(
  target: ConnectionTargetConfig
): target is CustomTargetConfig {
  return 'customTargetVpc' in target;
}
