import { EC2Client } from '@aws-sdk/client-ec2';

import { AwsClient } from '../common/aws-client.js';

import { ec2ErrorHandler } from './ec2-errors.js';

export const ec2Client = new AwsClient({
  Client: EC2Client,
  errorHandler: ec2ErrorHandler,
});
