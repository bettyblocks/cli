import crypto from 'crypto';

export default (map: unknown): string =>
  crypto.createHash('sha256').update(JSON.stringify(map)).digest('hex');
