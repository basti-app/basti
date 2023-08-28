import { z } from 'zod';

export const TagsFileParser = z.record(z.string(), z.string());

export type TagsFile = z.infer<typeof TagsFileParser>;
