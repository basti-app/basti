<!-- omit from toc -->
# Configuration file reference

The goal of the Basti configuration file is to make CLI usage faster, less error-prone and much more convenient. With configuration file, you can predefine connections and targets to use with the [basti connect](./cli.md#basti-connect-command) command.

<!-- omit from toc -->
## Table of contents
- [Location](#location)
- [Example](#example)
- [Structure](#structure)
- [Types](#types)
  - [Connections](#connections)
  - [Connection](#connection)
  - [Targets](#targets)
  - [Target](#target-1)

## Location

The configuration file must be named `.basti.yaml`, `.basti.yml`, or `.basti.json`. 
Basti CLI looks for the configuration file in the current directory and all the parent directories up to the home directory with the closest one taking precedence.

## Example

```yaml
# - Connections are used with the `basti connect <connection>` command
# - Targets' fields are the same as the options for the `basti connect` command
connections: 
  database-dev:
    target:
      rdsInstance: my-dev-database
      awsProfile: dev
    localPort: 5432

  database-prod:
    target:
      rdsInstance: my-prod-database
      awsProfile: prod
    localPort: 5432

  # Default AWS profile and region are used if not specified in the target
  redis-cache-dev:
    target:
      elasticacheRedisCluster: my-dev-cache
    localPort: 6379

  # Same target but with different local port
  custom-target-local:
    target: custom-target
    localPort: 4646

# Targets can be extracted and reused in multiple connections
# with different local ports
targets:
  custom-target:
    customTargetVpc: vpc-1234567890
    customTargetHost: 10.0.1.1
    customTargetPort: 4646
    awsProfile: prod
    awsRegion: us-east-1 -->
```

## Structure

* `connections:` [Connections map](#connections)
  * `<connection-name>:` [Connection object](#connection)
  
    ...

* `targets:` [Targets map](#targets)
  * `<target-name>:` [Target object](#target-type)
  
    ...

## Types

### Connections

_Map (Key: Connection name, Value: [Connection object](#connection))_

A map of connections. The keys in this map can be used as connection names in the [basti connect](./cli.md#basti-connect-command) command.

### Connection

_Object_ 

Describes a connection that can be used with the [basti connect](./cli.md#basti-connect-command) command.

<!-- omit from toc -->
#### `target`

_[Target object](#target-type) or [Target name](#targets)_

The target to connect to.

<!-- omit from toc -->
#### `localPort`

_Integer_

The local port to forward the target port to. The connection target will be available on `localhost:<port>`.

### Targets

_Map (Key: Target name, Value: [Target object](#target))_

A map of targets. The keys in this map can be used as target names in [connections](#connection).

### Target<span id="target-type"></span>

_Object_

Describes a connection target that can be used in a [connection](#connection).

<!-- omit from toc -->
#### `rdsInstance`

_String_

The ID of the RDS instance to connect to.

<!-- omit from toc -->
#### `rdsCluster`

_String_

The ID of the RDS cluster to connect to.

<!-- omit from toc -->
#### `elasticacheRedisCluster`

_String_

The ID of the Elasticache Redis cluster to connect to. For a Cluster Mode Disabled (CMD) cluster, the primary endpoint is used. For a Cluster Mode Enabled (CME) cluster, the configuration endpoint is used.

<!-- omit from toc -->
#### `elasticacheRedisNode`

_String_

The ID of the Elasticache Redis node to connect to. You can specify both primary and replica nodes.

<!-- omit from toc -->
#### `elasticacheMemcachedCluster`

_String_

The ID of the Elasticache Memcached cluster to connect to. The primary endpoint is used.

<!-- omit from toc -->
#### `elasticacheMemcachedNode`

_String_

The ID of the Elasticache Memcached node to connect to. You can specify both primary and replica nodes.

<!-- omit from toc -->
#### `customTargetVpc`

_String_

The ID of the custom connection target's VPC.

<!-- omit from toc -->
#### `customTargetHost`

_String_

The IP address or the DNS name of the custom connection target.

<!-- omit from toc -->
#### `customTargetPort`

_Integer_

The port of the custom connection target.

<!-- omit from toc -->
#### `awsProfile`

_String_

The name of the AWS profile to use. If not specified, the default profile is used.

<!-- omit from toc -->
#### `awsRegion`

_String_

The name of the AWS region to use. If not specified, the default region configured in the AWS profile is used.