import fs from 'fs-extra';
import test, { ExecutionContext } from 'ava';
import path from 'path';
import {
  blockDefinitionPath,
  blockDefinitions,
  createPackageJson,
  newBlockDefinition,
} from '../../src/blocks/blockDefinitions';

type Context = ExecutionContext<unknown>;

console.log(process.cwd());

const supportDir = path.join(process.cwd(), '__tests__/support/blocks/');

test.afterEach(() => {
  fs.emptyDirSync(supportDir);
});

test('blockDefinitionPath', async (t: Context): Promise<void> => {
  t.is(blockDefinitionPath('/blocks', 'test'), '/blocks/test.json');
});

test('creating a new blockDefinition', async (t: Context): Promise<void> => {
  const blockName = `block${Math.random().toString()}`;

  t.is(
    newBlockDefinition(supportDir, blockName),
    `blocks/${blockName}.json created`,
  );
});

test('returns 2 blocks', async (t: Context): Promise<void> => {
  fs.emptyDirSync(supportDir);
  const newBlocks = ['test', 'block'];

  newBlocks.map((block) => newBlockDefinition(supportDir, block));

  const blocks = blockDefinitions(supportDir);
  const numberOfBlocks = blocks.length;

  t.assert(numberOfBlocks === 2);
});

test('creating a package.json', async (t: Context): Promise<void> => {
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

  t.assert(
    createPackageJson('test', '__tests__/blocks/rootPackage.json', [
      'lodash',
    ]) === packageJson,
  );
});
