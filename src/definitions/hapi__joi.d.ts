import { Schema } from '@hapi/joi';

declare module '@hapi/joi' {
  export function custom(value: unknown): Schema;
}
