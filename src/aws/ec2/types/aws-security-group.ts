export interface AwsSecurityGroupIdentifier {
  id: string;
  name: string;
}

export interface AwsSecurityGroup extends AwsSecurityGroupIdentifier {
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
  | IpRangeSecurityGroupIngressSource
  | GroupSecurityGroupIngressSource;

export interface GroupSecurityGroupIngressSource {
  securityGroupId: string;
}

export interface IpRangeSecurityGroupIngressSource {
  cidrIp: string;
}

export interface SecurityGroupIngressPortRange {
  from: number;
  to: number;
}

export function isGroupSecurityGroupSource(
  source: SecurityGroupIngressSource
): source is GroupSecurityGroupIngressSource {
  return "securityGroupId" in source;
}

export function isIpRangeSecurityGroupSource(
  source: SecurityGroupIngressSource
): source is IpRangeSecurityGroupIngressSource {
  return "cidrIp" in source;
}
