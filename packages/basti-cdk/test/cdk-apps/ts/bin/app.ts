#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BastiInstanceStack } from '../lib/basti-instance-stack';
import { RdsInstanceConnectStack } from '../lib/rds-instance-connect-stack';
import { BastiInstanceLookupStack } from '../lib/basti-instance-lookup-stack';
import { BastiInstanceGrantConnectStack } from '../lib/basti-instance-grant-connect-stack';

const app = new cdk.App();

const bastiInstanceStack = new BastiInstanceStack(app, 'BastiInstance', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

new RdsInstanceConnectStack(app, 'RdsInstanceConnect', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },

  vpc: bastiInstanceStack.vpc,
  bastiInstance: bastiInstanceStack.bastiInstance,
});

const bastiInstanceLookupStack = new BastiInstanceLookupStack(
  app,
  'BastiInstanceLookup',
  {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
  }
);
bastiInstanceLookupStack.addDependency(bastiInstanceStack);

new BastiInstanceGrantConnectStack(app, 'BastiInstanceGrantConnect', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },

  bastiInstance: bastiInstanceStack.bastiInstance,
});
