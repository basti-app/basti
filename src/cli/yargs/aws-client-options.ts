import { AwsClientConfiguration } from '#src/aws/common/aws-client.js';

export const YARGS_AWS_CLIENT_OPTIONS = {
  AWS_PROFILE: [
    'aws-profile',
    {
      type: 'string',
      description: 'AWS CLI profile to use',
    },
  ],
  AWS_REGION: [
    'aws-region',
    {
      type: 'string',
      description: 'AWS region to use',
    },
  ],
} as const;

export function getAwsClientOptions({
  awsProfile,
  awsRegion,
}: {
  awsProfile?: string;
  awsRegion?: string;
}): AwsClientConfiguration {
  return {
    profile: awsProfile,
    region: awsRegion,
  };
}
