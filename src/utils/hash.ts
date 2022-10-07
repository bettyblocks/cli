import crypto from 'crypto';

export default (map: unknown): string => {
  return crypto.createHash('sha256').update(JSON.stringify(map)).digest('hex');
};
