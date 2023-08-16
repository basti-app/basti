import { Construct } from 'constructs';
import { aws_ec2, aws_iam, Stack, Tags } from 'aws-cdk-lib';

import { BASTION_INSTANCE_CLOUD_INIT } from './bastion-cloudinit';
import { generateShortId } from './basti-helper';
import {
  BASTION_INSTANCE_CREATED_BY_TAG_NAME,
  BASTION_INSTANCE_ID_TAG_NAME,
  BASTION_INSTANCE_IN_USE_TAG_NAME,
  BASTION_INSTANCE_NAME_PREFIX,
  BASTION_INSTANCE_ROLE_NAME_PREFIX,
  BASTION_INSTANCE_SECURITY_GROUP_NAME_PREFIX,
} from './basti-constants';

/**
 * The properties for the Basti instance.
 */
export interface BastiInstanceProps {
  /**
   * The VPC to deploy the bastion instance into.
   */
  readonly vpc: aws_ec2.IVpc;

  /**
   * (Optional) The ID of the Basti instance. The ID will be used to identify
   * any resources created within this construct. If not specified, a random ID will be generated.
   *
   * @default An 8-character pseudo-random string
   */
  readonly bastiId?: string;

  /**
   * (Optional) The subnet selection to deploy the bastion instance into.
   * If not specified, any public subnet in the VPC will be used.
   *
   * @default Public subnets in the VPC
   */
  readonly vpcSubnets?: aws_ec2.SubnetSelection;

  /**
   * (Optional) The instance type to use for the bastion instance.
   *
   * @default t2.micro (subject to change)
   */
  readonly instanceType?: aws_ec2.InstanceType;

  /**
   * (Optional) The machine image to use for the bastion instance.
   * The specified machine image must have SSM agent installed and configured.
   * If not specified, the latest  Amazon Linux 2 - Kernel 5.10 AMI will be used.
   *
   * @default Latest Amazon Linux 2 - Kernel 5.10
   */
  readonly machineImage?: aws_ec2.IMachineImage;
}

export interface IBastiInstance {
  /**
   * The bastion instance role.
   */
  readonly role: aws_iam.IRole;

  /**
   * The bastion instance security group.
   */
  readonly securityGroup: aws_ec2.ISecurityGroup;

  /**
   * The ID of the Basti instance.
   */
  readonly bastiId: string;

  /**
   * The VPC the bastion instance is deployed into.
   */
  readonly vpc: aws_ec2.IVpc;
}

/**
 * The Basti instance.
 */
export class BastiInstance extends Construct implements IBastiInstance {
  /**
   * The bastion instance.
   */
  public readonly instance: aws_ec2.Instance;

  /**
   * The bastion instance role.
   */
  public readonly role: aws_iam.IRole;

  /**
   * The bastion instance security group.
   */
  public readonly securityGroup: aws_ec2.ISecurityGroup;

  /**
   * The ID of the Basti instance.
   */
  public readonly bastiId: string;

  /**
   * The VPC the bastion instance is deployed into.
   */
  public readonly vpc: aws_ec2.IVpc;

  constructor(scope: Construct, id: string, props: BastiInstanceProps) {
    super(scope, id);

    this.vpc = props.vpc;

    this.bastiId = props.bastiId ?? generateShortId(id);

    const defaultMachineImage = aws_ec2.MachineImage.fromSsmParameter(
      '/aws/service/ami-amazon-linux-latest/amzn2-ami-kernel-5.10-hvm-x86_64-gp2'
    );

    const defaultInstanceType = new aws_ec2.InstanceType('t2.micro');

    const defaultSubnetSelection = {
      subnetType: aws_ec2.SubnetType.PUBLIC,
    };
    const sessionManagerPolicy = new aws_iam.PolicyDocument({
      statements: [
        new aws_iam.PolicyStatement({
          actions: [
            'ssm:UpdateInstanceInformation',
            'ssmmessages:CreateControlChannel',
            'ssmmessages:CreateDataChannel',
            'ssmmessages:OpenControlChannel',
            'ssmmessages:OpenDataChannel',
          ],
          resources: ['*'],
        }),
      ],
    });

    this.role = new aws_iam.Role(this, 'IamRoleBastionInstance', {
      assumedBy: new aws_iam.ServicePrincipal('ec2.amazonaws.com'),
      roleName: `${BASTION_INSTANCE_ROLE_NAME_PREFIX}-${this.bastiId}`,
      inlinePolicies: {
        'session-manager-access': sessionManagerPolicy,
      },
    });

    this.securityGroup = new aws_ec2.SecurityGroup(this, 'SgBastionInstance', {
      vpc: props.vpc,
      allowAllOutbound: true,
      securityGroupName: `${BASTION_INSTANCE_SECURITY_GROUP_NAME_PREFIX}-${this.bastiId}`,
    });

    this.instance = new aws_ec2.Instance(this, 'Ec2InstanceBastion', {
      instanceName: `${BASTION_INSTANCE_NAME_PREFIX}-${this.bastiId}`,
      machineImage: props.machineImage ?? defaultMachineImage,
      instanceType: props.instanceType ?? defaultInstanceType,
      role: this.role,
      securityGroup: this.securityGroup,
      requireImdsv2: true,
      userData: aws_ec2.UserData.custom(BASTION_INSTANCE_CLOUD_INIT),
      vpc: props.vpc,
      vpcSubnets: props.vpcSubnets ?? defaultSubnetSelection,
      propagateTagsToVolumeOnCreation: true,
    });
    Tags.of(this.instance).add(BASTION_INSTANCE_ID_TAG_NAME, this.bastiId);
    Tags.of(this.instance).add(
      BASTION_INSTANCE_IN_USE_TAG_NAME,
      new Date().toISOString()
    );

    const bastiInstancePolicy = new aws_iam.PolicyDocument({
      statements: [
        new aws_iam.PolicyStatement({
          actions: ['ec2:DescribeInstances'],
          // ec2:DescribeInstances does not support resource-level permissions
          resources: ['*'],
        }),
        new aws_iam.PolicyStatement({
          actions: ['ec2:CreateTags'],
          resources: [
            `arn:aws:ec2:${Stack.of(this).region}:${
              Stack.of(this).account
            }:instance/${this.instance.instanceId}`,
          ],
        }),
      ],
    });

    this.role.attachInlinePolicy(
      new aws_iam.Policy(this, 'IamPolicyBastionInstanceEc2Access', {
        policyName: 'ec2-instance-access',
        document: bastiInstancePolicy,
      })
    );

    Tags.of(this).add(BASTION_INSTANCE_CREATED_BY_TAG_NAME, 'basti-cdk');
  }

  /**
   * Grants an IAM principal permission to connect to the Basti instance via Basti CLI.
   *
   * @param grantee The principal to grant permission to.
   */
  public grantBastiCliConnect(grantee: aws_iam.IGrantable): void {
    const account = Stack.of(this).account;
    const region = Stack.of(this).region;
    const instanceArn = `arn:aws:ec2:${region}:${account}:instance/${this.instance.instanceId}`;
    grantee.grantPrincipal.addToPrincipalPolicy(
      new aws_iam.PolicyStatement({
        actions: ['ec2:DescribeInstances'],
        resources: ['*'],
      })
    );
    grantee.grantPrincipal.addToPrincipalPolicy(
      new aws_iam.PolicyStatement({
        actions: ['ec2:StartInstances', 'ec2:CreateTags'],
        resources: [instanceArn],
      })
    );

    const documentArn = `arn:aws:ssm:${region}:${account}:document/AWS-StartPortForwardingSessionToRemoteHost`;
    grantee.grantPrincipal.addToPrincipalPolicy(
      new aws_iam.PolicyStatement({
        actions: ['ssm:StartSession'],
        resources: [instanceArn, documentArn],
      })
    );
  }

  /**
   * Looks up an existing Basti instance from its ID.
   *
   * @param scope CDK construct scope.
   * @param id CDK construct ID.
   * @param bastiId The ID of the Basti instance.
   * @param vpc The VPC that the bastion is deployed into.
   */
  static fromBastiId(
    scope: Construct,
    id: string,
    bastiId: string,
    vpc: aws_ec2.IVpc
  ): IBastiInstance {
    const roleName = `${BASTION_INSTANCE_ROLE_NAME_PREFIX}-${bastiId}`;
    const role = aws_iam.Role.fromRoleName(
      scope,
      `IamRoleBastionInstance${id}`,
      roleName
    );

    const securityGroupName = `${BASTION_INSTANCE_SECURITY_GROUP_NAME_PREFIX}-${bastiId}`;

    const securityGroup = aws_ec2.SecurityGroup.fromLookupByName(
      scope,
      `SgBastionInstance${id}`,
      securityGroupName,
      vpc
    );

    return {
      role,
      securityGroup,
      bastiId,
      vpc,
    };
  }
}
