import { Schema, Validator } from 'jsonschema';
import { promises, readJson, readdir, outputJson, pathExists } from 'fs-extra';

const { readFile } = promises;

export type InteractionConfigurationParameter = {
  type: 'BOOLEAN' | 'INVALIDATE_QUERIES' | 'NUMBER' | 'STRING' | 'MUTATION';
};

export type InteractionConfiguration = {
  name: string;
  parameters: Record<string /* name */, InteractionConfigurationParameter>;
  returnType: 'BOOLEAN' | 'NUMBER' | 'STRING' | 'VOID';
};

export type InteractionSource = InteractionConfiguration & { code: string };

export type Source = {
  apiVersion: 'v2';
  interactions: InteractionSource[];
};

const validator = new Validator();

const jsonFileSchema: Schema = {
  properties: {
    name: { type: 'string' },
    parameters: {
      additionalProperties: {
        type: 'object',
        properties: {
          type: {
            enum: [
              'BOOLEAN',
              'INVALIDATE_QUERIES',
              'NUMBER',
              'STRING',
              'MUTATION',
            ],
          },
        },
        required: ['type'],
      },
      required: [],
      type: 'object',
    },
    returnType: { enum: ['BOOLEAN', 'NUMBER', 'STRING', 'VOID'] },
  },
  required: ['name', 'parameters', 'returnType'],
  type: 'object',
};

async function readInteraction(
  jsonFile: string,
  codeFile: string,
): Promise<InteractionSource> {
  const jsonFileContent: unknown = await readJson(jsonFile);

  const jsonFileValidateResult = validator.validate(
    jsonFileContent,
    jsonFileSchema,
  );

  if (!jsonFileValidateResult.valid) {
    throw new Error(
      `Cannot build interaction \`${jsonFile}\`: ${jsonFileValidateResult.errors.toString()}`,
    );
  }

  const configuration = jsonFileContent as InteractionConfiguration;

  const code = await readFile(codeFile, 'utf-8');

  return {
    ...configuration,
    code,
  };
}

export async function buildInteractions(rootDir: string): Promise<void> {
  const srcDir = `${rootDir}/src/interactions`;
  const distDir = `${rootDir}/dist`;

  if (!(await pathExists(srcDir))) {
    return;
  }

  const files: string[] = await readdir(srcDir);

  const output: Source = {
    apiVersion: 'v2',
    interactions: await Promise.all(
      files
        .filter((file) => file.endsWith('.json'))
        .map((file) =>
          readInteraction(
            `${srcDir}/${file}`,
            `${srcDir}/${file.substring(0, file.length - 5)}.js`,
          ),
        ),
    ),
  };

  await outputJson(`${distDir}/interactions.json`, output);
}
