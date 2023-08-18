import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BastiInstance } from 'basti-cdk';

export class BastiInstanceStack extends cdk.Stack {
  readonly vpc: cdk.aws_ec2.Vpc;
  readonly bastiInstance: BastiInstance;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpc = new cdk.aws_ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      vpcName: 'cdk-test',
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: cdk.aws_ec2.SubnetType.PUBLIC,
        },
        {
          name: 'private',
          subnetType: cdk.aws_ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    this.bastiInstance = new BastiInstance(this, 'BastiInstance', {
      vpc: this.vpc,
      bastiId: 'cdk-test',
    });
  }
}
