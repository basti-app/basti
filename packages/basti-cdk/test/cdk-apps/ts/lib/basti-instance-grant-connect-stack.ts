import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BastiInstance } from 'basti-cdk';

export interface BastiInstanceGrantConnectStackProps extends cdk.StackProps {
  bastiInstance: BastiInstance;
}

export class BastiInstanceGrantConnectStack extends cdk.Stack {
  readonly role: cdk.aws_iam.Role;

  constructor(
    scope: Construct,
    id: string,
    props: BastiInstanceGrantConnectStackProps
  ) {
    super(scope, id, props);

    this.role = new cdk.aws_iam.Role(this, 'Role', {
      roleName: 'cdk-test-basti-instance-grant-connect',
      assumedBy: new cdk.aws_iam.AccountPrincipal(this.account),
    });

    props.bastiInstance.grantBastiCliConnect(this.role);
  }
}
