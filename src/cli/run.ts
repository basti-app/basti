import { readFileSync } from 'node:fs';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { setUpDebugMode } from '#src/common/debug.js';
import { AwsClient } from '#src/aws/common/aws-client.js';

import { handleAsyncErrors, withErrorHandling } from './error/handle-error.js';
import { conflictingOptions } from './yargs/conflicting-options-check.js';
import { optionGroup } from './yargs/option-group-check.js';
import {
  YARGS_AWS_CLIENT_OPTIONS,
  getAwsClientOptions,
} from './yargs/aws-client-options.js';
import { getConfig } from './config/get-config.js';
import { getConnectCommandInputFromConfig } from './config/get-command-input.js';
import {
  getCleanupCommandInputFromOptions,
  getConnectCommandInputFromOptions,
  getInitCommandInputFromOptions,
} from './yargs/get-command-input.js';

const pkg: {
  version: string;
} = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url)).toString()
);

setUpDebugMode();
handleAsyncErrors();

void yargs(hideBin(process.argv))
  .version(pkg.version)
  .command(
    ['init', 'i'],
    'Initialize a target to use with Basti',
    yargs =>
      yargs
        .option('rds-instance', {
          type: 'string',
          description: 'ID of the RDS instance to be initialized',
        })
        .option('rds-cluster', {
          type: 'string',
          description: 'ID of the RDS cluster to be initialized',
        })
        .option('elasticache-cluster', {
          type: 'string',
          description: 'ID of the Elasticache cluster to be initialized',
        })
        .option('custom-target-vpc', {
          type: 'string',
          description: 'VPC of the custom target to be initialized',
        })
        .option('bastion-subnet', {
          type: 'string',
          description: 'ID of the public VPC subnet for the bastion instance',
        })
        .option('bastion-instance-type', {
          type: 'string',
          description: 'EC2 instance type for the bastion instance',
        })
        .option('tag', {
          type: 'string',
          description:
            'Tag to be added to all created resources. Can be used multiple times',
        })
        .options('tags-file', {
          type: 'string',
          description:
            'Path to a JSON file containing tags to be added to all created resources. Can be used multiple times',
        })
        .option(...YARGS_AWS_CLIENT_OPTIONS.AWS_PROFILE)
        .option(...YARGS_AWS_CLIENT_OPTIONS.AWS_REGION)
        .check(
          conflictingOptions('rds-cluster', 'rds-instance', 'custom-target-vpc')
        )
        .example([
          ['$0 init', 'Use interactive mode'],
          [
            '$0 init --rds-instance <id> --bastion-subnet <id>',
            'Select target and bastion subnet automatically',
          ],
        ]),
    withErrorHandling(async options => {
      AwsClient.setGlobalConfiguration(getAwsClientOptions(options));

      const commandOptions = getInitCommandInputFromOptions(options);

      const { handleInit } = await import('./commands/init/init.js');
      await handleInit(commandOptions);
    })
  )
  .command(
    ['connect [connection]', 'c'],
    'Start port forwarding session with the selected target',
    yargs =>
      yargs
        .positional('connection', {
          type: 'string',
          description:
            'Name of the connection in the configuration file. Conflicts with other options',
        })
        .option('rds-instance', {
          type: 'string',
          description: 'ID of the RDS instance to connect to',
        })
        .option('rds-cluster', {
          type: 'string',
          description: 'ID of the RDS cluster to connect to',
        })
        .option('elasticache-cluster', {
          type: 'string',
          description: 'ID of the elasticache cluster to be initialized',
        })
        .option('elasticache-node', {
          type: 'string',
          description: 'ID of the elasticache node to be initialized',
        })
        .option('custom-target-vpc', {
          type: 'string',
          description: 'VPC of the custom connection target',
        })
        .option('custom-target-host', {
          type: 'string',
          description:
            'Host name or IP address of the custom connection target',
        })
        .option('custom-target-port', {
          type: 'number',
          description: 'Port of the custom connection target',
        })
        .option('local-port', {
          type: 'number',
          description: 'Local port to forward the target to',
        })
        .option(...YARGS_AWS_CLIENT_OPTIONS.AWS_PROFILE)
        .option(...YARGS_AWS_CLIENT_OPTIONS.AWS_REGION)
        .check(
          conflictingOptions(
            'connection',
            'rds-instance',
            'rds-cluster',
            'elasticache-cluster',
            'elasticache-node',
            ['custom-target-vpc', 'custom-target-host', 'custom-target-port']
          )
        )
        .check(conflictingOptions('connection', 'local-port'))
        .check(
          conflictingOptions(
            'connection',
            YARGS_AWS_CLIENT_OPTIONS.AWS_PROFILE[0]
          )
        )
        .check(
          conflictingOptions(
            'connection',
            YARGS_AWS_CLIENT_OPTIONS.AWS_REGION[0]
          )
        )
        .check(
          optionGroup(
            'custom-target-vpc',
            'custom-target-host',
            'custom-target-port'
          )
        )
        .example([
          ['$0 connect', 'Use interactive mode'],
          [
            '$0 connect --rds-instance <id> --local-port <port>',
            'Select target and local port automatically',
          ],
          [
            '$0 connect <connection>',
            'Use connection configuration from the configuration file',
          ],
        ]),
    withErrorHandling(async options => {
      const config = await getConfig();

      const commandInput =
        options.connection !== undefined
          ? getConnectCommandInputFromConfig(config, options.connection)
          : getConnectCommandInputFromOptions(options);

      // TODO: Relying on setting the global configuration before the command is
      // imported is dangerous as it might be accidentally imported before the
      // configuration is set. The approach has to be changed to passing the configuration
      // to the AWS commands directly. This will also become a must with the
      // introduction of multiple simultaneous connections support as each target
      // will have its own AWS client configuration.
      AwsClient.setGlobalConfiguration(
        commandInput.target?.awsClientConfig ?? getAwsClientOptions(options)
      );

      const { handleConnect } = await import('./commands/connect/connect.js');
      await handleConnect(commandInput);
    })
  )
  .command(
    ['cleanup', 'cl'],
    'Remove all resources created by Basti',
    yargs =>
      yargs
        .option('confirm', {
          type: 'boolean',
          alias: ['c', 'y'],
          description: 'Automatically confirm cleanup',
        })
        .option(...YARGS_AWS_CLIENT_OPTIONS.AWS_PROFILE)
        .option(...YARGS_AWS_CLIENT_OPTIONS.AWS_REGION)
        .example([
          ['$0 cleanup', 'Use interactive mode'],
          ['$0 cleanup -y', 'Confirm cleanup automatically'],
        ]),

    withErrorHandling(async options => {
      AwsClient.setGlobalConfiguration(getAwsClientOptions(options));

      const commandOptions = getCleanupCommandInputFromOptions(options);

      const { handleCleanup } = await import('./commands/cleanup/cleanup.js');
      return await handleCleanup(commandOptions);
    })
  )
  .demandCommand(1)
  .strict()
  .alias('help', 'h')
  .alias('version', 'v')
  .example([
    ['$0 init', 'Initialize a target in interactive mode'],
    ['$0 connect', 'Start connection in interactive mode'],
    [
      '$0 cleanup',
      'Cleanup Basti resources in interactive mode (requires confirmation)',
    ],
  ])
  .completion('completion', 'Generate completion script for your shell')
  .recommendCommands()
  .wrap(process.stdout.columns)
  .parse();
