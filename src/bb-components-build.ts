// tslint:disable:no-console
// tslint:disable:no-new-func
// tslint:disable:function-name
import program, { CommanderStatic } from 'commander';
import { promises, outputJson, pathExists } from 'fs-extra';
import { ComponentProps, PrefabProps, PartialProps } from './types';
import {
  validatePartialStructure,
  validateComponentStructure,
  validatePrefabStructure,
  validateDuplicateNames,
} from './utils/validation';
import transpile from './utils/transpile';
import readScripts from './utils/readScripts';

const { mkdir, readFile } = promises;

program
  .usage('[path]')
  .name('bb components build')
  .parse(process.argv);

const { args }: CommanderStatic = program;
const rootDir: string = args.length === 0 ? '.' : args[0];

const buildComponents: (rootDir: string) => Promise<void> = async (
  rootDir: string,
): Promise<void> => {
  const srcDir = `${rootDir}/src/components`;
  const distDir = `${rootDir}/dist`;
  const exists = await pathExists(srcDir);

  if (!exists) {
    return await outputJson(`${distDir}/templates.json`, []);
  }

  const componentFiles: string[] = await readScripts(srcDir);

  const promises = componentFiles.map(
    async (file: string): Promise<ComponentProps> => {
      const code = await readFile(`${srcDir}/${file}`, 'utf-8');

      return Function(`return ${transpile(code)}`)();
    },
  );

  const output: ComponentProps[] = await Promise.all(promises);
  // validateDuplicatenNames, validateComponentStructure
  validateDuplicateNames(output);
  validateComponentStructure(output);

  await mkdir(distDir, { recursive: true });
  await outputJson(`${distDir}/templates.json`, output);
};

const buildPrefabs: (rootDir: string) => Promise<void> = async (
  rootDir: string,
): Promise<void> => {
  const srcDir = `${rootDir}/src/prefabs`;
  const distDir = `${rootDir}/dist`;
  const exists = await pathExists(srcDir);

  if (!exists) {
    return await outputJson(`${distDir}/prefabs.json`, []);
  }

  const prefabFiles: string[] = await readScripts(srcDir);

  const promises = prefabFiles.map(
    async (file: string): Promise<PrefabProps> => {
      const code = await readFile(`${srcDir}/${file}`, 'utf-8');

      return Function(`return ${code}`)();
    },
  );

  const output: PrefabProps[] = await Promise.all(promises);

  validateDuplicateNames(output);
  validatePrefabStructure(output);
  await mkdir(distDir, { recursive: true });
  await outputJson(`${distDir}/prefabs.json`, output);
};

const buildPartials: (rootDir: string) => Promise<void> = async (
  rootDir: string,
): Promise<void> => {
  const srcDir = `${rootDir}/src/partials`;
  const distDir = `${rootDir}/dist`;
  const exists = await pathExists(srcDir);

  if (!exists) {
    return await outputJson(`${distDir}/partials.json`, []);
  }

  const partialFiles: string[] = await readScripts(srcDir);

  const promises = partialFiles.map(
    async (file: string): Promise<PrefabProps> => {
      const code = await readFile(`${srcDir}/${file}`, 'utf-8');

      return Function(`return ${code}`)();
    },
  );

  const output: PartialProps[] = await Promise.all(promises);
  validateDuplicateNames(output);
  validatePartialStructure(output);

  await mkdir(distDir, { recursive: true });
  await outputJson(`${distDir}/partials.json`, output);
};

(async () => {
  await buildComponents(rootDir);
  await buildPrefabs(rootDir).catch(error => console.log(error));
  await buildPartials(rootDir);
  console.info('Built component set.');
})();
