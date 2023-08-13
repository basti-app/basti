import type { AwsTag } from '#src/aws/tags/types.js';
import { uniqueBy } from '#src/common/data-structures.js';

import { getTagFromOption } from './get-tag-from-option.js';
import { getTagsFromFile } from './get-tags-from-file.js';

export interface TagOptions {
  tag?: string | string[];
  tagsFile?: string | string[];
}

export function getTagsFromOptions(options: TagOptions): AwsTag[] {
  const tagsFromFiles = toArray(options.tagsFile).flatMap(file =>
    getTagsFromFile(file)
  );
  const tagsFromOptions = toArray(options.tag).map(tag =>
    getTagFromOption(tag)
  );

  // Subsequent tag files override previous ones.
  // Subsequent tag options override previous ones.
  // Tag options always override tags from files.
  return uniqueBy([...tagsFromFiles, ...tagsFromOptions], 'key');
}

function toArray(value: string | string[] | undefined): string[] {
  return value === undefined ? [] : Array.isArray(value) ? value : [value];
}
