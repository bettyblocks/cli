import crypto from 'crypto';

export default function(map: unknown): string {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(map))
    .digest('hex');
}
