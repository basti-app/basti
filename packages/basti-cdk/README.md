# Basti CDK
Basti CDK is a library that provides constructs for AWS CDK that allow you to easily create a Basti instance within your existing infrastructure. 

## The purpose of this construct
The purpose of this construct is to allow you to easily create a Basti instance within your existing infrastructure.
It provides all the benefits of using the Basti CLI while still having the ability to manage your infrastructure as you would any other infrastucture. 
Integrating basti in IaC adds transparently to your application giving you and your team a better overview.


## Installation
The Construct is available in both TypeScript and Python, through the use of [jsii](https://github.com/aws/jsii).

npm:
```bash
npm install basti-cdk
```

python:
```bash
pip install basti-cdk
```

### Example
The example below is a simple setup of a basti instance and an RDS instance.
The construct can be modified but this is the simplest way to get started.

```typescript
const app = new cdk.App();
const bastiStack = new cdk.Stack(app, 'bastiStack');

// VPC to deploy basti into
const bastiVpc = new aws_ec2.Vpc(bastiStack, 'bastiVpc', {});

// Special basti security group
const bastiAccessSecurityGroup = new BastiAccessSecurityGroup(
  bastiStack,
  'bastiAccessSecurityGroup',
  {
    vpc: bastiVpc,
  }
);

// The basti instance itself
const basti = new BastiInstance(bastiStack, 'basti', {
  vpc: bastiVpc,
});

// An RDS instance to test basti with
const rdsInstance = new aws_rds.DatabaseInstance(
  bastiStack,
  'rdsInstance',
  {
    vpc: bastiVpc,
    engine: aws_rds.DatabaseInstanceEngine.POSTGRES,
    instanceType: aws_ec2.InstanceType.of(
      aws_ec2.InstanceClass.BURSTABLE2,
      aws_ec2.InstanceSize.MICRO
    ),
    // Here basti takes the security group we created earlier
    securityGroups: [bastiAccessSecurityGroup],
    port: 5432,
  }
);

// We then allow the basti instance access to the port of the RDS instance
bastiAccessSecurityGroup.addBastiInstance(
  // basti instance we created earlier
  basti,
  // Port can also be defined manually if needed
  aws_ec2.Port.tcp(rdsInstance.instanceEndpoint.port)
);
```

The basti instance can also allow roles to connect to it with the `grantBastiCliConnect` method.

```typescript
// The basti instance itself
import {BastiInstance} from "basti-cdk";

const basti = new BastiInstance(...);
const role = new aws_iam.Role(...);

// Gives all the requires permissions to connect to the basti instance. With the direct conection option.
basti.grantBastiCliConnect(role);
```

## License

Usage is provided under the MIT License. See [LICENSE](https://github.com/BohdanPetryshyn/basti/blob/main/LICENSE) for the full details.
