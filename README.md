<h1 align="center">Basti</h1>

<div align="center">
  <a href="https://www.npmjs.com/package/basti">
    <img alt="NPM Package" src="https://img.shields.io/npm/v/basti?color=blue">
  </a>
  <a href="https://www.npmjs.com/package/basti">
    <img alt="NPM" src="https://img.shields.io/npm/dw/basti">
  </a>
  <a href="https://github.com/BohdanPetryshyn/basti/blob/main/LICENSE">
    <img alt="GitHub" src="https://img.shields.io/github/license/BohdanPetryshyn/basti">
  </a>
</div>

<br/>

<div align="center">
  <a href="https://github.com/BohdanPetryshyn/basti">Basti</a> <em>(from <a href="https://en.wikipedia.org/wiki/Bastion_host"><strong>Basti</strong>on Host</a>)</em> is a CLI tool for securely accessing your DB instances and other AWS resources in private networks at almost no cost. 
  <br/>
  <br/>
  💵 <em>No idle costs.</em>  🔑 <em>No SSH keys.</em> 🔒 <em>Fully IAM-driven.</em>
</div>

<br/>

<div align="center">
  <img alt="Demo" src="https://user-images.githubusercontent.com/45905756/211385579-3ac54ad5-7c90-4b68-9b22-239f4b26ad61.gif">
</div>

<br/>

<!-- The following toc is generated with the Markdown All in One VSCode extension (https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one) -->
<!-- omit from toc -->
## Table of contents
- [Why Basti?](#why-basti)
- [How it works](#how-it-works)
- [Installation](#installation)
- [Basic usage](#basic-usage)
  - [Initialize target](#initialize-target)
  - [Connect to target](#connect-to-target)
  - [Use target on _localhost_](#use-target-on-localhost)
  - [Cleanup (optional)](#cleanup-optional)
- [Custom connection targets](#custom-connection-targets)
- [Advanced initialization options](#advanced-initialization-options)
  - [Resource tags](#resource-tags)
  - [Bastion instance type](#bastion-instance-type)
- [Basti in CI/CD pipelines](#basti-in-cicd-pipelines)
  - [Automatic mode](#automatic-mode)
- [Basti configuration file](#basti-configuration-file)
- [Basti infrastructure as code (IaC)](#basti-infrastructure-as-code-iac)
- [Basti in teams and organizations](#basti-in-teams-and-organizations)
  - [Minimal IAM permissions](#minimal-iam-permissions)
  - [Usage audit](#usage-audit)
  - [Shared configuration](#shared-configuration)
- [Security](#security)
  - [Network](#network)
  - [Access control](#access-control)
  - [Software](#software)
- [Development](#development)
  - [Build](#build)
  - [Run](#run)
  - [Test](#test)
- [License](#license)

<br/>


## Why Basti?

With [Basti](https://github.com/BohdanPetryshyn/basti), you can securely connect to your RDS/Aurora/Elasticache/EC2 instances in private VPC subnets from a local machine or CI/CD pipeline almost for free!

## How it works

- 🏰 Basti sets up a so called _bastion EC2 instance_ in the connection target's VPC.

- 🧑‍💻 The bastion instance is used with [AWS Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html) port forwarding capability to make the target available on your _localhost_.

- 💵 Basti takes care of keeping the bastion instance stopped when it's not used to make the solution cost as low as **≈ 0.01 USD** per hour of connection plus **≈ 0.80 USD** per month of maintaining the instance in a stopped state.

- 🔒 [Security](#security) completely relies on AWS Session Manager and IAM policies. The bastion instance is not accessible from the Internet and no SSH keys are used.

## Installation

```sh
npm install --global basti
```

Other, NodeJS-independent, installation options are coming soon!

## Basic usage

Basti uses AWS SDK and relies on credentials to be configured in your system. You can use any of [the methods](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html) supported by AWS SDK to configure credentials.

> 💡 You can expect Basti to work if you can use AWS CLI in your terminal.

### Initialize target

First, initialize your target for use with Basti. The following command will set up all the infrastructure required to start a connection. _You only need to do this once_.

```sh
basti init
```

You will be prompted for a target to initialize and a **public** VPC subnet to create the bastion EC2 instance in.

### Connect to target

Now, you can start the connection. This command will establish a secure port forwarding session and make the target available on your _localhost_.

```sh
basti connect
```

You will be prompted for the target to connect to as well as the local port to forward the connection to.

### Use target on _localhost_

Finally, you can use the target same way as it was running on your _localhost_ and port you specified in the previous step.

```sh
psql -h localhost -p 5432
```

> 💡 _psql_, the PostgreSQL client, is used as an example here. Basti can be used to connect to any type of database or other services as long as the communication is done over TCP.

### Cleanup (optional)

You can remove all the resources created by Basti in you AWS account.

```sh
basti cleanup
```

The list of resources will be displayed and you will be prompted to confirm the cleanup.

## Custom connection targets

Basti provides first class support for RDS instances and Aurora clusters. However, you can use Basti to connect to any other target in your AWS VPC (e.g. Elasticache instance, EC2 instance, etc.).

To connect to a custom target, select the `Custom` option when prompted for a target to initialize or connect to. You will be prompted for the target's VPC, IP address and port.

> 🤝 Feel free to open an issue or a pull request if you want to extend the list of natively supported targets

## Advanced initialization options

The `basti init` command has a number of advanced options that can be used to customize the bastion instance and other resources created by Basti.

### Resource tags

You can specify tags to be applied to the bastion instance and other resources created by Basti. This can be done in three ways:

1. By entering the tags in the advanced options section of the interactive mode.
2. By passing the `--tag` option. This option accepts tag name and value separated by an equal sign. For example, `--tag Project=my-project` This option can be used multiple times to specify multiple tags.
3. By passing the `--tags-file` option. This option accepts a path to a JSON file with tags. The option can be used multiple times to specify multiple files.

Example of a tags file:

```json
{
  "Project": "my-project",
  "Environment": "production"
}
```

Tags with the same name will be overwritten in the order they are specified. Tags specified with the `--tag` option will always overwrite tags specified in the tags file.

> 💡 If your tags contain special characters, it might be easier to use interactive mode or the `--tags-file` command than escaping the characters in the `--tag` option.

### Bastion instance type

You can specify the EC2 instance type to be used for the bastion instance using the `--bastion-instance-type` option or by entering it in the advanced options section of the interactive mode. The default instance type is `t2.micro`, but it's subject to change in the future.

## Basti in CI/CD pipelines

### Automatic mode

Using interactive mode is convenient when you're getting used to Basti. However, in Continuous Integration and Continuous Delivery (CI/CD) pipelines, you will probably want to disable interactivity and pass all the options as command line arguments:

```sh
basti connect --rds-instance your-instance-id --local-port your-port
```

Use `basti <command> --help` to see all the available options for `basti connect` and other commands.

To continue executing the script after the connection is established, you can use Basti in conjunction with the [wait-on utility](https://www.npmjs.com/package/wait-on) and the `&` shell operator:

```sh
basti connect --rds-instance your-instance-id --local-port your-port &
wait-on tcp:localhost:your-port
```

## Basti configuration file

<!-- When working with multiple targets, it's convenient to store the target's configuration
as well as other Basti settings  -->

When dealing with multiple connection targets, it becomes convenient to store their configurations
and other Basti settings in a dedicated configuration file. To facilitate this, Basti automatically 
searches for the configuration file in the current directory and its parent directories. 
The supported file names are `.basti.yaml`, `.basti.yml`, and `.basti.json`.

You can quickly start a connection defined in the configuration file by passing its
name to the `basti connect` command:

```sh
basti connect your-connection
```

<details>
<summary><b> Configuration file example </b></summary>
<br/>

This example uses YAML format. The same configuration can be written in JSON.

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
  aurora-cluster-dev:
    target:
      rdsCluster: my-prod-aurora-cluster
    localPort: 5432

  custom-target:
    target: custom-target
    localPort: 4647

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
    awsRegion: us-east-1
```

</details>

## Basti infrastructure as code (IaC)

Introducing, [Basti CDK](https://constructs.dev/packages/basti-cdk), an [AWS CDK](https://aws.amazon.com/cdk/) construct library that allows you to integrate Basti with your existing CDK-managed infrastructure.

Feel free to open an issue if you want to see Basti in Terraform or other IaC tools. Contributions are welcome 🤗

## Basti in teams and organizations

Basti was designed with organizational usage patterns in mind. The bastion instance and other infrastructure created by Basti is reused across all the users in your organization.

### Minimal IAM permissions

Basti commands require different sets of IAM permissions. `basti init` needs broad permissions to set up all the infrastructure required to start a connection. `basti connect`, on the other hand, requires only minimal permissions to start a connection. This means that the AWS account administrator can run the `basti init` command once and then grant the minimal permissions to the IAM users who need to start connections.

<details>
<summary><b> Minimal IAM policy for connection </b></summary>
<br/>

The following command is optimized for minimal permissions required to start a connection. It doesn't need to retrieve the target information as it's passed as command line arguments.

```sh
basti connect --custom-target-vpc your-vpc-id --custom-target-host your-target-host --custom-target-port your-target-port --local-port your-local-port
```

Minimal policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "ec2:DescribeInstances",
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": "ec2:StartInstances",
      "Resource": "arn:aws:ec2:<your-region>:<your-account-id>:instance/<your-basti-instance-id>"
    },
    {
      "Effect": "Allow",
      "Action": "ec2:CreateTags",
      "Resource": "arn:aws:ec2:<your-region>:<your-account-id>:instance/<your-basti-instance-id>"
    },
    {
      "Effect": "Allow",
      "Action": "ssm:StartSession",
      "Resource": [
        "arn:aws:ssm:*:*:document/AWS-StartPortForwardingSessionToRemoteHost",
        "arn:aws:ec2:<your-region>:<your-account-id>:instance/<your-basti-instance-id>"
      ]
    }
  ]
}
```

</details>

### Usage audit

Since Basti uses IAM for access control, the connection history, along with the _responsible IAM user_ and all the connection details, can be audited using AWS CloudTrail by filtering on the "StartSession" event. Please, refer to the [AWS CloudTrail documentation](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html) for more details.

A simple connections history can also be found in the AWS Session Manager history. See [AWS Session Manager documentation](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-view-history.html) for more details.

### Shared configuration
The [Basti configuration file](#basti-configuration-file) file can be shared across your organization, making it easy for all developers to connect to the project's cloud infrastructure. A recommended practice is to store the configuration file in the root of your project's repository. This ensures that the configuration is readily accessible to all team members, enabling quick and seamless connections to the required cloud resources.

## Security

Security is a top priority for Basti. The following sections describe the security measures taken by Basti.

### Network

The bastion EC2 instance reachability from the Internet is completely disabled with AWS Security Groups configuration. _No ports are open for inbound traffic._ The bastion instance is only accessible through [AWS Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html).

Basti automatically adjusts the target's Security Group to allow inbound traffic from the bastion instance's Security Group.

### Access control

[AWS Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html), which is used by Basti to establish a port forwarding session, doesn't use SSH keys for access control. Instead, it relies on [AWS IAM](https://aws.amazon.com/iam/) users and their permissions in your AWS account. This also means that [AWS CloudTrail](https://aws.amazon.com/cloudtrail/) could be used to _audit Basti usage_.

### Software

Basti uses the latest Amazon Linux 2 - Kernel 5.10 AMI available at the initialization time (`basti init` command) for the bastion instance.

The bastion instance is being stopped when it's not used for some short period of time. These shutdowns are also used to _update the bastion instance's software packages and OS kernel_. By default, the updates happen once a day but not more often than the bastion instance is used.

## Development

First of all, thank you for your interest in contributing to Basti! 🎉

The following section describes how to run your local version of Basti CLI
as you make changes to the code. Please, feel free to open an issue if you want to see Basti CDK development guide!

### Build

Before proceeding to development, it's recommended to run the _full build_.
This requires Docker to be installed on your machine and may take a couple of minutes.

```sh
npm run build
```

Full Basti build consists of two parts:

1. Compiling Basti TypeScript code. The code has to be compiled after each change.
   ```sh
   npm run build-src

   # Or, if you want to automatically recompile on each change:
   npm run build-src-watch
   ```
2. Building non-NodeJS dependencies (AWS session-manger-plugin).
   This step is only required after the first checkout or in a rare
   case when the dependencies are updated.
   ```sh
   npm run build-deps
   ```

### Run

After the build is complete, you can run Basti:

```sh
npm run start -- <command> <options>
```

Alternatively, you can link-install the local version of Basti in your system
and use it as you would usually use Basti:

```sh
# Link-install the local version of Basti
npm link

# Run Basti
basti <command> <options>
```

### Test

Before submitting a pull request, please make sure that all the tests and
checks pass:

```sh
npm run test
```

## License

Usage is provided under the MIT License. See [LICENSE](https://github.com/BohdanPetryshyn/basti/blob/main/LICENSE) for the full details.
