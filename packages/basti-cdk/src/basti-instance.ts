import { Construct } from 'constructs';
import { aws_ec2, aws_iam, Tags } from 'aws-cdk-lib';

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
 * The machine configuration for the bastion instance.
 */
export interface BastiMachineProps {
  /**
   * The instance type to use for the bastion instance.
   *
   * @default t2.micro
   */
  readonly instanceType?: aws_ec2.InstanceType;
  /**
   * The machine image to use for the bastion instance.
   */
  readonly machineImage?: aws_ec2.IMachineImage;
}

/**
 * The properties for the bastion instance.
 */
export interface BastiInstanceProps {
  /**
   * The VPC to deploy the bastion instance into.
   */
  readonly vpc: aws_ec2.IVpc;

  /**
   * (Optional) The ID of the bastion instance. The ID will be used to identify
   * the bastion instance. If not specified, a random ID will be generated.
   *
   * @default - A 8-character pseudo-random string
   */
  readonly bastiId?: string;

  /**
   * (Optional) The subnet selection to deploy the bastion instance into.
   * If not specified, the default subnet selection will be used.
   *
   * @default - Public subnets in the VPC
   */
  readonly subnetSelection?: aws_ec2.SubnetSelection;

  /**
   * (Optional) The machine configuration to use for the bastion instance.
   * If not specified, the default configuration will be used.
   */
  readonly machineConfig?: BastiMachineProps;

  /**
   * (Optional) The tags to apply to the bastion instance. Key-value pairs
   */
  readonly tags?: { [key: string]: string };
}

/**
 * The basti instance.
 */
export class BastiInstance extends Construct {
  /**
   * The bastion instance.
   */
  public readonly instance: aws_ec2.Instance;

  /**
   * The bastion instance role.
   */
  public readonly role: aws_iam.Role;

  /**
   * The bastion instance security group.
   */
  public readonly securityGroup: aws_ec2.SecurityGroup;

  /**
   * The ID of the bastion instance.
   */
  public readonly bastiId: string;

  /**
   * The VPC the bastion instance is deployed into.
   */
  public readonly vpc: aws_ec2.IVpc;

  /**
   * Constructs a new instance of the BastiInstance class.
   *
   * @param scope CDK construct scope
   * @param id CDK construct ID
   * @param props BastiInstanceProps
   */

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

    this.role = new aws_iam.Role(this, 'basti-instance-role', {
      assumedBy: new aws_iam.ServicePrincipal('ec2.amazonaws.com'),
      roleName: `${BASTION_INSTANCE_ROLE_NAME_PREFIX}-${this.bastiId}`,
    });

    this.securityGroup = new aws_ec2.SecurityGroup(this, 'basti-instance-sg', {
      vpc: props.vpc,
      allowAllOutbound: true,
      securityGroupName: `${BASTION_INSTANCE_SECURITY_GROUP_NAME_PREFIX}-${this.bastiId}`,
    });

    this.instance = new aws_ec2.Instance(this, 'basti-instance', {
      instanceName: `${BASTION_INSTANCE_NAME_PREFIX}-${this.bastiId}`,
      machineImage: props.machineConfig?.machineImage ?? defaultMachineImage,
      instanceType: props.machineConfig?.instanceType ?? defaultInstanceType,
      role: this.role,
      securityGroup: this.securityGroup,
      requireImdsv2: true,
      userData: aws_ec2.UserData.custom(BASTION_INSTANCE_CLOUD_INIT),
      vpc: props.vpc,
      vpcSubnets: props.subnetSelection ?? defaultSubnetSelection,
      ssmSessionPermissions: true,
    });

    // Add tags to the bastion instance
    for (const [key, value] of Object.entries(props.tags ?? {})) {
      // Tags.of(this.instance).add(key, value);
      Tags.of(this.instance).add(key, value);
    }

    Tags.of(this.instance).add(BASTION_INSTANCE_ID_TAG_NAME, this.bastiId);

    Tags.of(this.instance).add(
      BASTION_INSTANCE_IN_USE_TAG_NAME,
      new Date().toISOString()
    );

    Tags.of(this.instance).add(BASTION_INSTANCE_CREATED_BY_TAG_NAME, 'CDK');
  }

  /**
   * Grants an IAM principal permission to connect to the bastion instance.
   * Using the Basti CLI.
   *
   * @param grantee The principal to grant permission to.
   */
  public grantBastiCliConnect(grantee: aws_iam.IGrantable): void {
    const instanceArn = `arn:aws:ec2:*:*:instance/${this.instance.instanceId}`;
    grantee.grantPrincipal.addToPrincipalPolicy(
      new aws_iam.PolicyStatement({
        actions: ['ec2:DescribeInstances'],
        resources: ['*'],
      })
    );
    grantee.grantPrincipal.addToPrincipalPolicy(
      new aws_iam.PolicyStatement({
        actions: ['ssm:StartSession', 'ec2:StartInstances', 'ec2:CreateTags'],
        resources: [instanceArn],
      })
    );
  }
}
