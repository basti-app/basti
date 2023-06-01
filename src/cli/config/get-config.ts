import { cosmiconfig } from 'cosmiconfig';
import { fromZodError } from 'zod-validation-error';

import { OperationError } from '../error/operation-error.js';

import { ConfigParser } from './config-parser.js';

import type { Config } from './config-parser.js';

export async function getConfig(): Promise<Config | undefined> {
  const configExplorer = cosmiconfig('basti', {
    searchPlaces: ['basti.yaml', 'basti.yml', 'basti.json'],
  });
  const configResult = await configExplorer.search();

  if (configResult === null) {
    return undefined;
  }

  return parseConfig(configResult.config);
}

function parseConfig(config: unknown): Config {
  const result = ConfigParser.safeParse(config);

  if (result.success) {
    return result.data;
  }

  throw OperationError.fromErrorMessage({
    operationName: 'Reading configuration file',
    message: fromZodError(result.error).message,
  });
}
