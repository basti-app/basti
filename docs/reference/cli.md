<!-- omit from toc -->
# CLI reference

Basti CLI is a command line tool that allows you to connect to your private AWS resources using AWS Session Manager port forwarding. The CLI provides an end-to-end experience for setting up and using Basti. Alternatively, you can use [Basti CDK](https://github.com/basti-app/basti/tree/main/packages/basti-cdk) to set up and manage your Basti infrastructure with AWS CDK. You will still use the CLI to connect to your resources.

<!-- omit from toc -->
## Table of contents
- [Commands](#commands)
  - [basti init](#basti-init)
  - [basti connect](#basti-connect)
  - [basti cleanup](#basti-cleanup)


## Commands

### basti init<span id="basti-init-command"></span>

**Usage:**

```sh
basti init
```

Initializes the connection target. This command creates the bastion instance and all the other resources required to start a connection. You only need to run this command once for each target. The command always tries to reuse the existing resources. For example, if the bastion instance already exists in the target's VPC, a new one won't be created.

If used without arguments, the interactive mode will prompt you for all the required options. To run the command in the automatic mode, pass all the required options as command line arguments.

<!-- omit from toc -->
#### `--rds-instance <instance-id>`

_String_

The ID of the RDS instance to connect to.

<!-- omit from toc -->
#### `--rds-cluster <cluster-id>`

_String_

The ID of the RDS cluster to connect to.

<!-- omit from toc -->
#### `--elasticache-redis-cluster <cluster-id>`

_String_

The ID of the Elasticache Redis cluster to connect to. When the cluster is initialized, you can connect to any of its nodes as well as to the cluster itself.

<!-- omit from toc -->
#### `--elasticache-memcached-cluster <cluster-id>`

_String_

The ID of the Elasticache Memcached cluster to connect to. When the cluster is initialized, you can connect to any of its nodes as well as to the cluster itself.

<!-- omit from toc -->
#### `--custom-target-vpc <vpc-id>`

_String_

The ID of the VPC the custom connection target resides in. After Basti is initialized for the given VPC, you can connect to any target in the VPC using the `--custom-target-host` and `--custom-target-port` options.

<!-- omit from toc -->
#### `--bastion-instance-type <instance-type>`

_String_, _Default: "t2.micro"_

The EC2 instance type to be used for the bastion instance.

<!-- omit from toc -->
#### `--tag <tag-name>=<tag-value>`

_String_, _Can be used multiple times_

A tag to be applied to the bastion instance and other resources created by Basti. This option can be used multiple times to specify multiple tags. Tags with the same name will be overwritten in the order they are specified. Tags specified with the `--tag` option will always overwrite tags specified in the tags file.

<!-- omit from toc -->
#### `--tags-file <path>`

_String_, _Can be used multiple times_

A path to a JSON file with tags. This option can be used multiple times to specify multiple files. Tags with the same name will be overwritten in the order they are specified. Tags specified with the `--tag` option will always overwrite tags specified in the tags file.

Example of a tags file:

```json
{
  "Project": "my-project",
  "Environment": "production"
}
```

<!-- omit from toc -->
#### `--aws-profile <profile-name>`

_String_

The name of the AWS CLI profile to be used to interact with AWS. If not specified, the default profile will be used.

<!-- omit from toc -->
#### `--aws-region <region-name>`

_String_

The name of the AWS region to be used to interact with AWS. If not specified, the region from the default profile will be used.

### basti connect<span id="basti-connect-command"></span>

**Usage:**

```sh
basti connect [connection]
```

Starts a port forwarding session to the connection target. The connection target must be initialized with the [basti init](#basti-init-command) command before it can be used with this command.

If used without arguments, the interactive mode will prompt you for all the required options. Alternatively, you can pass all the required options as command line arguments or specify a `connection` defined in the [Basti configuration file](./configuration-file.md).

<!-- omit from toc -->
#### `connection` 

_String_

The name of the connection to be used. The connection must be defined in the [Basti configuration file](./configuration-file.md).

<!-- omit from toc -->
#### `--rds-instance <instance-id>`

_String_

The ID of the RDS instance to connect to.

<!-- omit from toc -->
#### `--rds-cluster <cluster-id>`

_String_

The ID of the RDS cluster to connect to.

<!-- omit from toc -->
#### `--elasticache-redis-cluster <cluster-id>`

_String_

The ID of the Elasticache Redis cluster to connect to. For a Cluster Mode Disabled (CMD) cluster, the primary endpoint is used. For a Cluster Mode Enabled (CME) cluster, the configuration endpoint is used.

<!-- omit from toc -->
#### `--elasticache-redis-node <node-id>`

_String_

The ID of the Elasticache Redis node to connect to. You can specify both primary and replica nodes.

<!-- omit from toc -->
#### `--elasticache-memcached-cluster <cluster-id>`

_String_

The ID of the Elasticache Memcached cluster to connect to. The primary endpoint is used.

<!-- omit from toc -->
#### `--elasticache-memcached-node <node-id>`

_String_

The ID of the Elasticache Memcached node to connect to. You can specify both primary and replica nodes.

<!-- omit from toc -->
#### `--custom-target-vpc <vpc-id>`

_String_

The ID of the custom connection target's VPC.

<!-- omit from toc -->
#### `--custom-target-host <host>`

_String_

The IP address or the DNS name of the custom connection target.

<!-- omit from toc -->
#### `--custom-target-port <port>`

_Integer_

The port of the custom connection target.

<!-- omit from toc -->
#### `--local-port <port>`

_Integer_

The local port to forward the connection to. The connection target will be available on `localhost:<port>`.

<!-- omit from toc -->
#### `--aws-profile <profile-name>`

_String_

The name of the AWS CLI profile to be used to interact with AWS. If not specified, the default profile will be used.

<!-- omit from toc -->
#### `--aws-region <region-name>`

_String_

The name of the AWS region to be used to interact with AWS. If not specified, the region from the default profile will be used.

### basti cleanup<span id="basti-cleanup-command"></span>

**Usage:**

```sh
basti cleanup
```

Removes all the resources created by Basti in your AWS account. The list of resources will be displayed and you will be prompted to confirm the cleanup. 

<!-- omit from toc -->
#### `--confirm`

_Boolean_, _Aliases: `-c`, `-y`_

Automatically confirm the cleanup without interactive prompting.

<!-- omit from toc -->
#### `--aws-profile <profile-name>`

_String_

The name of the AWS CLI profile to be used to interact with AWS. If not specified, the default profile will be used.

<!-- omit from toc -->
#### `--aws-region <region-name>`

_String_

The name of the AWS region to be used to interact with AWS. If not specified, the region from the default profile will be used.
