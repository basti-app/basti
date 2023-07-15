export interface AwsRole {
  name: string;
}

export interface AwsRoleAttachedPolicy {
  name: string;
  arn: string;
}

export interface AwsIamInstanceProfile {
  name: string;

  arn: string;

  roles: AwsRole[];
}
