import fs from 'node:fs';

import { fromZodError } from 'zod-validation-error';

import type { AwsTag } from '#src/aws/tags/types.js';
import { OperationError } from '#src/cli/error/operation-error.js';

import { TagsFileParser } from './tags-file-parser.js';

export function getTagsFromFile(tagsFilePath: string): AwsTag[] {
  const tagsFile = readTagsFile(tagsFilePath);

  return parseTagsFile(tagsFile);
}

function readTagsFile(path: string): unknown {
  try {
    const content = fs.readFileSync(path);

    return JSON.parse(content.toString());
  } catch (error) {
    throw OperationError.fromError({
      error,
      operationName: 'Reading tags file',
    });
  }
}

function parseTagsFile(tagsFile: unknown): AwsTag[] {
  const result = TagsFileParser.safeParse(tagsFile);

  if (!result.success) {
    throw OperationError.fromErrorMessage({
      operationName: 'Parsing tags file',
      message: fromZodError(result.error).message,
    });
  }

  return Object.entries(result.data).map(([key, value]) => ({ key, value }));
}
