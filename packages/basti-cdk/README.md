<h1 align="center">Basti CDK</h1>

<div align="center">
  <a href="https://www.npmjs.com/package/basti-cdk">
    <img alt="NPM Package" src="https://img.shields.io/npm/v/basti-cdk?color=green">
  </a>
  <a href="https://pypi.org/project/basti-cdk">
    <img alt="PyPI" src="https://img.shields.io/pypi/v/basti-cdk?color=blue">
  </a>
  <a href="https://github.com/basti-app/basti/blob/main/packages/basti-cdk/LICENSE">
    <img alt="GitHub" src="https://img.shields.io/github/license/basti-app/basti">
  </a>
</div>

<br/>

<div align="center">
  <a href="https://github.com/basti-app/basti/tree/main/packages/basti-cdk">Basti CDK</a> is a construct library that allows you to create cost-efficient <a href="https://en.wikipedia.org/wiki/Bastion_host">bastion instances</a> and easily connect to your infrastructure with <a href="https://github.com/basti-app/basti">Basti CLI</a>.
  <br/>
  <br/>
  💵 <em>No idle costs.</em>  🔑 <em>No SSH keys.</em> 🔒 <em>Fully IAM-driven.</em>
</div>

<br/>

<div align="center">
  <img alt="Diagram" src="https://github.com/basti-app/basti/assets/45905756/1fa0762e-d6a1-4449-9e83-da87b53c3604">
</div>

<br/>

<!-- The following toc is generated with the Markdown All in One VSCode extension (https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one) -->
<!-- omit from toc -->
## Table of contents
- [Why Basti?](#why-basti)
- [How it works](#how-it-works)
- [Installation](#installation)
  - [NPM](#npm)
  - [PyPI](#pypi)
- [API reference](#api-reference)
- [Examples](#examples)
- [Basic usage](#basic-usage)
  - [Set up Basti instance](#set-up-basti-instance)
  - [Allow connection to target](#allow-connection-to-target)
  - [Connect to target](#connect-to-target)
- [Advanced usage](#advanced-usage)
  - [Importing existing Basti instance](#importing-existing-basti-instance)
  - [Granting access to use Basti instance](#granting-access-to-use-basti-instance)
- [License](#license)

<br/>

## Why Basti?

With [Basti](https://github.com/basti-app/basti), you can securely connect to your RDS/Aurora/Elasticache/EC2 instances in private VPC subnets from a local machine or CI/CD pipeline almost for free!

## How it works

- 🏰 Using Basti CDK, you set up a bastion instance in the connection target's VPC.

- 🧑‍💻 You use [Basti CLI](https://github.com/basti-app/basti) to conveniently connect to your target through the bastion instance.

- 💵 Basti takes care of keeping the bastion instance stopped when it's not used to make the solution cost as low as **≈ 0.01 USD** per hour of connection plus **≈ 0.80 USD** per month of maintaining the instance in a stopped state.

- 🔒 Security completely relies on AWS Session Manager and IAM policies. The bastion instance is not accessible from the Internet and no SSH keys are used.

## Installation

The construct is available in multiple languages thanks to [JSII](https://github.com/aws/jsii).

### NPM

```bash
npm install basti-cdk
```

### PyPI

```bash
pip install basti-cdk
```

## API reference

See the full API reference [on Construct Hub](https://constructs.dev/packages/basti-cdk).

## Examples

See [the test CDK apps](https://github.com/basti-app/basti/tree/main/packages/basti-cdk/test/cdk-apps) for working examples of each feature the library provides.

## Basic usage

Basti constructs can be imported from the `basti-cdk` package.

```ts
import { BastiAccessSecurityGroup, BastiInstance } from 'basti-cdk';
```

> 💡 RDS instance is used as an example target. You can use Basti to connect to any other AWS resource that supports security groups.

### Set up Basti instance

Use `BastiInstance` construct to create Basti EC2 instance.

```ts
const bastiInstance = new BastiInstance(
  stack,
  'BastiInstance',
  {
    vpc,
    
    // Optional. Randomly generated if omitted.
    // Used to name the EC2 instance and other resources.
    // The resulting name will be "basti-instance-my-bastion"
    bastiId: 'my-bastion'
  }
);
```

### Allow connection to target

Use `BastiAccessSecurityGroup` construct to create a security group for your target. This security group will allow the Basti instance to connect to the target. 

```ts
// Create a security group for your target
const bastiAccessSecurityGroup = new BastiAccessSecurityGroup(
  stack,
  'BastiAccessSecurityGroup', 
  {
    vpc,

    // Optional. Randomly generated if omitted.
    // Used to name the security group and other resources.
    // The resulting name will be "basti-access-my-target"
    bastiId: 'my-target'
  }
);

// Create the target
const rdsInstance = new aws_rds.DatabaseInstance(
  stack,
  'RdsInstance',
  {
    // Unrelated properties are omitted for brevity

    vpc,
    port: 5432,

    securityGroups: [
      bastiAccessSecurityGroup
    ]
  }
);

// Allow the Basti instance to connect to the target on the specified port
bastiAccessSecurityGroup.allowBastiInstanceConnection(
  bastiInstance,
  aws_ec2.Port.tcp(rdsInstance.instanceEndpoint.port)
);
```

### Connect to target

When the stack is deployed, you can use [Basti CLI](https://github.com/basti-app/basti) to connect to your target.

```sh
basti connect
```

## Advanced usage

### Importing existing Basti instance

When sharing a Basti instance across stacks, you can just pass it as a property to the other stack. In case you need to import a Basti instance created in a separate CDK app or not managed by CDK at all, you can use the `BastiInstance.fromBastiId` method. The method returns an `IBastiInstance` object which is sufficient for granting access to a connection target.

```ts
// Most likely, the VPC was created separately as well
const vpc = aws_ec2.Vpc.fromLookup(stack, 'Vpc', {
    vpcName: 'existing-vpc-id',
});

const bastiInstance = BastiInstance.fromBastiId(
    this,
    'BastiInstance',
    // The BastiID of the Basti instance you want to import
    'existing-basti-id',
    vpc
);

// bastiInstance can now be used to allow access to a connection target
bastiAccessSecurityGroup.allowBastiInstanceConnection(
  bastiInstance,
  aws_ec2.Port.tcp(1717)
);
```

### Granting access to use Basti instance

You can grant the ability to connect to a Basti instance to other resources (users, roles, etc.) using the `grantBastiCliConnect` method of an existing Basti instance.

```ts
const bastiInstance = new BastiInstance(/*...*/);
const grantee = new aws_iam.Role(/*...*/);

bastiInstance.grantBastiCliConnect(grantee);
```

## License

Usage is provided under the MIT License. See [LICENSE](https://github.com/basti-app/basti/blob/main/packages/basti-cdk/LICENSE) for the full details.
