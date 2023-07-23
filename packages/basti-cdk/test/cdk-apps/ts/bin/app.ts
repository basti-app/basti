#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BastiInstanceStack } from '../lib/basti-instance-stack';
import { RdsInstanceStack } from '../lib/rds-instance-stack';
import { BastiInstanceLookupStack } from '../lib/basti-instance-lookup';

const app = new cdk.App();

const bastiInstanceStack = new BastiInstanceStack(app, 'BastiInstance', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

new RdsInstanceStack(app, 'RdsInstance', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },

  vpc: bastiInstanceStack.vpc,
  bastiInstance: bastiInstanceStack.bastiInstance,
});

new BastiInstanceLookupStack(app, 'BastiInstanceLookup', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
