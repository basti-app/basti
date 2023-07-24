import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  BastiAccessSecurityGroup,
  BastiInstance,
  IBastiInstance,
} from 'basti-cdk';

export class BastiInstanceLookupStack extends cdk.Stack {
  readonly vpc: cdk.aws_ec2.IVpc;
  readonly bastiInstance: IBastiInstance;
  readonly bastiAccessSecurityGroup: BastiAccessSecurityGroup;

  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    this.vpc = cdk.aws_ec2.Vpc.fromLookup(this, 'Vpc', {
      vpcName: 'cdk-test',
    });

    this.bastiInstance = BastiInstance.fromBastiId(
      this,
      'BastiInstance',
      'cdk-test',
      this.vpc
    );

    this.bastiAccessSecurityGroup = new BastiAccessSecurityGroup(
      this,
      'BastiAccessSecurityGroup',
      {
        vpc: this.vpc,
        bastiId: 'cdk-test-instance-lookup',
      }
    );

    this.bastiAccessSecurityGroup.allowBastiInstanceConnection(
      this.bastiInstance,
      cdk.aws_ec2.Port.tcp(1717)
    );
  }
}
