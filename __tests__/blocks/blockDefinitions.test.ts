import { afterEach, expect, test } from 'bun:test';
import fs from 'fs-extra';
import path from 'path';

import {
  blockDefinitionPath,
  blockDefinitions,
  createPackageJson,
  newBlockDefinition,
} from '../../src/blocks/blockDefinitions';

console.log(process.cwd());

const supportDir = path.join(process.cwd(), '__tests__/support/blocks/');

afterEach(() => {
  fs.emptyDirSync(supportDir);
});

test('blockDefinitionPath', async (): Promise<void> => {
  expect(blockDefinitionPath('/blocks', 'test')).toBe('/blocks/test.json');
});

test('creating a new blockDefinition', async (): Promise<void> => {
  const blockName = `block${Math.random().toString()}`;

  expect(newBlockDefinition(supportDir, blockName)).toBe(
    `blocks/${blockName}.json created`,
  );
});

test('returns 2 blocks', async (): Promise<void> => {
  fs.emptyDirSync(supportDir);
  const newBlocks = ['test', 'block'];

  newBlocks.forEach((block) => newBlockDefinition(supportDir, block));

  const blocks = blockDefinitions(supportDir);
  const numberOfBlocks = blocks.length;

  expect(numberOfBlocks).toBe(2);
});

test('creating a package.json', async (): Promise<void> => {
  const packageJson = JSON.stringify(
    {
      dependencies: {
        case: '^1.6.3',
      },
      name: 'test',
      private: 'true',
      version: '1.0.0',
    },
    null,
    2,
  );

  expect(
    createPackageJson('test', '__tests__/blocks/rootPackage.json', ['case']),
  ).toBe(packageJson);
});
