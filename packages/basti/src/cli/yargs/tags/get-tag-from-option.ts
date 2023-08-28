import type { AwsTag } from '#src/aws/tags/types.js';
import { OperationError } from '#src/cli/error/operation-error.js';

export function getTagFromOption(tagOption: string): AwsTag {
  const parts = tagOption.split('=');

  if (parts.length !== 2) {
    throw OperationError.fromErrorMessage({
      operationName: 'Parsing tags',
      message: `Each tag should be a key-value pair separated by an equal sign.`,
    });
  }
  const [key, value] = parts as [string, string];

  return { key, value };
}
