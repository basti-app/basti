import { aws_ec2 } from 'aws-cdk-lib';

import { generateShortId } from './basti-helper';
import { TARGET_ACCESS_SECURITY_GROUP_NAME_PREFIX } from './basti-constants';

import type { Construct } from 'constructs';
import type { IBastiInstance } from './basti-instance';

/**
 * The properties for the bastion access security group.
 */
export interface BastiAccessSecurityGroupProps
  extends aws_ec2.SecurityGroupProps {
  /**
   * Basti ID
   *
   * This ID is used as a suffix for the name, it is not the ID of the basti
   * instance.
   *
   * @default - A 8-character pseudo-random string
   */
  readonly bastiId?: string;
}

/**
 * The security group for the bastion instance.
 */
export class BastiAccessSecurityGroup extends aws_ec2.SecurityGroup {
  /**
   * The basti custom ID for the security group.
   */
  readonly bastiId: string;

  /**
   * Constructs a new instance of the BastiAccessSecurityGroup class.
   * @param scope The scope of the construct.
   * @param id The ID of the construct.
   * @param props The properties of the construct.
   */
  constructor(
    scope: Construct,
    id: string,
    props: BastiAccessSecurityGroupProps
  ) {
    const bastiId = props.bastiId ?? generateShortId(id);
    super(scope, id, {
      securityGroupName: `${TARGET_ACCESS_SECURITY_GROUP_NAME_PREFIX}-${bastiId}`,
      vpc: props.vpc,
      allowAllOutbound: true,
    });

    this.bastiId = bastiId;
  }

  /**
   * Adds an ingress rule to the security group. That allows the
   * bastion instance to access the target instance.
   *
   * @param bastiInstance The Basti instance
   * @param port The port to allow access to
   */
  public allowBastiInstanceConnection(
    bastiInstance: IBastiInstance,
    port: aws_ec2.Port
  ): void {
    this.addIngressRule(bastiInstance.securityGroup, port);
  }
}
