import { cli } from '#src/common/cli.js';
import { uniqueBy } from '#src/common/data-structures.js';
import { fmt } from '#src/common/fmt.js';

import type { InitCommandAdvancedInput } from '../init-command-input.js';

type TagsInput = InitCommandAdvancedInput['tags'];

export async function selectTags(tagsInput: TagsInput): Promise<TagsInput> {
  if (tagsInput.length > 0) {
    return tagsInput;
  }

  cli.out(`${fmt.green('❯')} Enter tags to be added to all created resources`);

  const subCli = cli.createSubInstance({ indent: 2 });

  const tags: TagsInput = [];
  while (true) {
    const { tagKey } = await subCli.prompt({
      type: 'input',
      name: 'tagKey',
      message: 'Tag key (leave empty to proceed)',
    });
    if (typeof tagKey !== 'string' || tagKey.length === 0) {
      break;
    }

    const { tagValue } = await subCli.prompt({
      type: 'input',
      name: 'tagValue',
      message: `Tag value`,
    });

    tags.push({ key: tagKey, value: tagValue });
  }

  return uniqueBy(tags, 'key');
}
