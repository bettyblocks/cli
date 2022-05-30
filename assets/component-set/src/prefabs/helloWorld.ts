import * as React from 'react';
import {
  component,
  prefab,
  variable,
  Icon,
  font,
  buttongroup,
  color,
  ThemeColor,
} from '@betty-blocks/component-sdk';
import { showOn } from '../utils';

const attributes = {
  category: 'CONTENT',
  icon: Icon.TextInputIcon,
};

const options = {
  content: variable('Content', { value: ['This is my first component!'] }),
  type: font('Type', { value: 'Title1' }),
  align: buttongroup(
    'Align',
    [
      ['Left', 'left'],
      ['Center', 'center'],
      ['Right', 'right'],
    ],
    { value: 'left' },
  ),
  padding: buttongroup(
    'Padding',
    [
      ['None', 'none'],
      ['Dense', 'dense'],
      ['Normal', 'normal'],
    ],
    { value: 'normal' },
  ),
  color: color('Text color', {
    value: ThemeColor.BLACK,
    ...showOn('styles'),
  }),
};

export default prefab('Hello World', attributes, null, [
  component('HelloWorld', { options }, []),
]);
