import * as crypto from 'node:crypto';

/**
 * Generates a short id based on a seed.
 *
 * The result is guaranteed to be the same for the same seed. No matter the platform or the runtime.
 *
 * @param seed The seed to generate the id from.
 */
export function generateShortId(seed: string): string {
  // We can just calculate the sha1 of the seed and take the first 8 characters.
  const hash = crypto.createHash('sha1');
  hash.update(seed);
  const digest = hash.digest('hex');
  return digest.slice(0, 8);
}
