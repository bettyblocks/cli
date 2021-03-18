import crypto from 'crypto';
import { Component } from 'src/types';

export default function(component: Component): string {
  const { name, orientation, jsx, styles, type, allowedTypes } = component;

  return crypto
    .createHash('sha256')
    .update(
      JSON.stringify({
        name,
        orientation,
        jsx,
        styles,
        type,
        allowedTypes,
      }),
    )
    .digest('hex');
}
