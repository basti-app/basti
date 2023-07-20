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
const bastiInstance = new BastiInstance(bastiStack, 'basti', {
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
  bastiInstance,
  // Port can also be defined manually if needed
  aws_ec2.Port.tcp(rdsInstance.instanceEndpoint.port)
);
```

The basti instance can also allow roles to connect to it with the `grantBastiCliConnect` method. 
You can also use this method to give groups/users permissions to connect to basti. 

```typescript
// The basti instance itself
import {BastiInstance} from "basti-cdk";

const bastiInstance = new BastiInstance(...);
const role = new aws_iam.Role(...);

// Gives all the requires permissions to connect to the basti instance. With the direct conection option.
bastiInstance.grantBastiCliConnect(role);
```

An interface version of basti can also be created using `BastiInstance.fromBastiId(...)`. This method can be used
if your application is spread out over multiple projects. 
```typescript
const app = new cdk.App();

const bastiStack = new cdk.Stack(app, 'bastiStack', {
    env: {
        account: '123456789012',
        region: 'us-east-1',
    },
});

// Ok so importing a security group (which is done when calling .fromBastiId)
// requires a vpc to be passed in without tokens.
// There is no way around this. So we "import" the vpc again. Again without tokens.
// it must have a fixed name.
const importedVpc = aws_ec2.Vpc.fromLookup(bastiStack, 'importedVpc', {
    vpcName: 'importedVpc',
});

const importedBastiInstance = BastiInstance.fromBastiId(
    bastiStack,
    'importedBastiInstance',
    'TEST_ID',
    importedVpc
);
```

## License

Usage is provided under the MIT License. See [LICENSE](https://github.com/BohdanPetryshyn/basti/blob/main/LICENSE) for the full details.
