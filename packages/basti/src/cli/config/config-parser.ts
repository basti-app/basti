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

const ElasticacheRedisClusterTargetConfigParser = z
  .union([
    z
      .object({
        elasticacheRedisCluster: z.string(),
      })
      .merge(TargetConfigBaseParser),
    z
      .object({
        elasticacheCluster: z.string(),
      })
      .merge(TargetConfigBaseParser),
  ])
  .transform(config => {
    return 'elasticacheRedisCluster' in config
      ? config
      : { ...config, elasticacheRedisCluster: config.elasticacheCluster };
  });

export type ElasticacheRedisClusterTargetConfig = z.infer<
  typeof ElasticacheRedisClusterTargetConfigParser
>;

const ElasticacheRedisNodeTargetConfigParser = z
  .union([
    z
      .object({
        elasticacheRedisNode: z.string(),
      })
      .merge(TargetConfigBaseParser),
    z
      .object({
        elasticacheNode: z.string(),
      })
      .merge(TargetConfigBaseParser),
  ])
  .transform(config => {
    return 'elasticacheRedisNode' in config
      ? config
      : { ...config, elasticacheRedisNode: config.elasticacheNode };
  });
export type ElasticacheRedisNodeTargetConfig = z.infer<
  typeof ElasticacheRedisNodeTargetConfigParser
>;

const ElasticacheMemcachedClusterTargetConfigParser = z
  .object({
    elasticacheMemcachedCluster: z.string(),
  })
  .merge(TargetConfigBaseParser);
export type ElasticacheMemcachedClusterTargetConfig = z.infer<
  typeof ElasticacheMemcachedClusterTargetConfigParser
>;

const ElasticacheRedisServerlessTargetConfigParser = z
  .object({
    elasticacheRedisServerlessCache: z.string(),
    readerEnpoint: z.boolean().optional(),
  })
  .merge(TargetConfigBaseParser);
export type ElasticacheRedisServerlessTargetConfig = z.infer<
  typeof ElasticacheRedisServerlessTargetConfigParser
>;

const ElasticacheMemcachedNodeTargetConfigParser = z
  .object({
    elasticacheMemcachedNode: z.string(),
  })
  .merge(TargetConfigBaseParser);
export type ElasticacheMemcachedNodeTargetConfig = z.infer<
  typeof ElasticacheMemcachedNodeTargetConfigParser
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
  ElasticacheRedisClusterTargetConfigParser,
  ElasticacheRedisNodeTargetConfigParser,
  ElasticacheRedisServerlessTargetConfigParser,
  ElasticacheMemcachedClusterTargetConfigParser,
  ElasticacheMemcachedNodeTargetConfigParser,
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
export function isElasticacheRedisServerlessTargetConfig(
  target: ConnectionTargetConfig
): target is ElasticacheRedisServerlessTargetConfig {
  return 'elasticacheServerlessCache' in target;
}

export function isElasticacheRedisClusterTargetConfig(
  target: ConnectionTargetConfig
): target is ElasticacheRedisClusterTargetConfig {
  return 'elasticacheRedisCluster' in target || 'elasticacheCluster' in target;
}

export function isElasticacheRedisNodeTargetConfig(
  target: ConnectionTargetConfig
): target is ElasticacheRedisNodeTargetConfig {
  return 'elasticacheRedisNode' in target || 'elasticacheNode' in target;
}
export function isElasticacheMemcachedClusterTargetConfig(
  target: ConnectionTargetConfig
): target is ElasticacheMemcachedClusterTargetConfig {
  return 'elasticacheMemcachedCluster' in target;
}

export function isElasticacheMemcachedNodeTargetConfig(
  target: ConnectionTargetConfig
): target is ElasticacheMemcachedNodeTargetConfig {
  return 'elasticacheMemcachedNode' in target;
}

export function isCustomTargetConfig(
  target: ConnectionTargetConfig
): target is CustomTargetConfig {
  return 'customTargetVpc' in target;
}
