import * as cdk from 'aws-cdk-lib';
import { BastiAccessSecurityGroup, BastiInstance } from 'basti-cdk';
import { Construct } from 'constructs';

export interface RdsInstanceStackProps extends cdk.StackProps {
  vpc: cdk.aws_ec2.Vpc;
  bastiInstance: BastiInstance;
}

export class RdsInstanceStack extends cdk.Stack {
  readonly bastiAccessSecurityGroup: BastiAccessSecurityGroup;
  readonly rdsInstance: cdk.aws_rds.DatabaseInstance;

  constructor(scope: Construct, id: string, props: RdsInstanceStackProps) {
    super(scope, id, props);

    this.bastiAccessSecurityGroup = new BastiAccessSecurityGroup(
      this,
      'BastiAccessSecurityGroup',
      {
        vpc: props.vpc,
      }
    );

    const databaseInstance = new cdk.aws_rds.DatabaseInstance(
      this,
      'DatabaseInstance',
      {
        instanceIdentifier: 'cdk-test',
        vpc: props.vpc,
        vpcSubnets: {
          subnetType: cdk.aws_ec2.SubnetType.PRIVATE_ISOLATED,
        },
        engine: cdk.aws_rds.DatabaseInstanceEngine.POSTGRES,
        instanceType: cdk.aws_ec2.InstanceType.of(
          cdk.aws_ec2.InstanceClass.BURSTABLE3,
          cdk.aws_ec2.InstanceSize.MICRO
        ),

        securityGroups: [this.bastiAccessSecurityGroup],

        backupRetention: cdk.Duration.days(0),
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }
    );

    this.bastiAccessSecurityGroup.allowBastiInstanceConnection(
      props.bastiInstance,
      cdk.aws_ec2.Port.tcp(databaseInstance.instanceEndpoint.port)
    );
  }
}
