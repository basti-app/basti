import * as crypto from 'node:crypto';

export function generateShortId(): string {
  return crypto.randomBytes(4).toString('hex');
}
