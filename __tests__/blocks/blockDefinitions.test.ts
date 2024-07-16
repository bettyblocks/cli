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

test('blockDefinitionPath', async () => {
  expect(blockDefinitionPath('/blocks', 'test')).toBe('/blocks/test.json');
});

test('creating a new blockDefinition', async () => {
  const blockName = `block${Math.random().toString()}`;

  expect(newBlockDefinition(supportDir, blockName)).toBe(
    `blocks/${blockName}.json created`,
  );
});

test('returns 2 blocks', async () => {
  fs.emptyDirSync(supportDir);
  const newBlocks = ['test', 'block'];

  newBlocks.map((block) => newBlockDefinition(supportDir, block));

  const blocks = blockDefinitions(supportDir);
  const numberOfBlocks = blocks.length;

  expect(numberOfBlocks).toBe(2);
});

test('creating a package.json', async () => {
  const packageJson = JSON.stringify(
    {
      name: 'test',
      version: '1.0.0',
      private: 'true',
      dependencies: {
        lodash: '^4.17.21',
      },
    },
    null,
    2,
  );

  expect(
    createPackageJson('test', '__tests__/blocks/rootPackage.json', ['lodash']),
  ).toBe(packageJson);
});
