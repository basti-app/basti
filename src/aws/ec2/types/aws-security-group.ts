export interface AwsSecurityGroup {
  id: string;
  name: string;
  vpcId: string;
  description: string;

  ingressRules: SecurityGroupIngressRule[];
}

export interface SecurityGroupIngressRule {
  sources: SecurityGroupIngressSource[];
  ports?: SecurityGroupIngressPortRange;
  ipProtocol: string;
}

export type SecurityGroupIngressSource =
  | {
      cidrIp: string;
    }
  | {
      securityGroupId: string;
    };

export interface SecurityGroupIngressPortRange {
  from: number;
  to: number;
}
