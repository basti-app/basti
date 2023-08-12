import { aws_ec2, Tags } from 'aws-cdk-lib';

import { generateShortId } from './basti-helper';
import {
  BASTION_INSTANCE_CREATED_BY_TAG_NAME,
  TARGET_ACCESS_SECURITY_GROUP_NAME_PREFIX,
} from './basti-constants';

import type { Construct } from 'constructs';
import type { IBastiInstance } from './basti-instance';

/**
 * The properties for the Basti access security group.
 */
export interface BastiAccessSecurityGroupProps {
  /**
   * The VPC in which to create the security group.
   */
  readonly vpc: aws_ec2.IVpc;

  /**
   * (Optional) The ID of the Basti access security group. The ID will be used to identify
   * any resources created within this construct. If not specified, a random ID will be generated.
   *
   * @default An 8-character pseudo-random string
   */
  readonly bastiId?: string;
}

/**
 * The Basti access security group. This security group is used to allow access to a connection
 * target from a Basti instance.
 */
export class BastiAccessSecurityGroup extends aws_ec2.SecurityGroup {
  /**
   * The ID of the Basti access security group.
   */
  readonly bastiId: string;

  constructor(
    scope: Construct,
    id: string,
    props: BastiAccessSecurityGroupProps
  ) {
    const bastiId = props.bastiId ?? generateShortId(id);

    const securityGroupName = `${TARGET_ACCESS_SECURITY_GROUP_NAME_PREFIX}-${bastiId}`;
    super(scope, id, {
      securityGroupName,
      vpc: props.vpc,
      allowAllOutbound: true,
    });

    this.bastiId = bastiId;

    Tags.of(this).add(BASTION_INSTANCE_CREATED_BY_TAG_NAME, 'basti-cdk');
  }

  /**
   * Allows connection from the provided Basti instance to the given port
   * by creating an ingress rule.
   *
   * @param bastiInstance The Basti instance.
   * @param port The port to allow access to.
   */
  public allowBastiInstanceConnection(
    bastiInstance: IBastiInstance,
    port: aws_ec2.Port
  ): void {
    this.addIngressRule(bastiInstance.securityGroup, port);
  }
}
