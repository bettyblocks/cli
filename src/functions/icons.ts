import chalk from 'chalk';
import fs from 'fs-extra';

import {
  functionDefinition,
  functionDefinitionPath,
  functionDirs,
} from './functionDefinitions';

const check = chalk.green(`✔`);

const convert = (functionsPath: string): void => {
  const { log } = console;

  log('Checking for function icons to convert ...');

  functionDirs(functionsPath, true).forEach((functionPath) => {
    const definition = functionDefinition(functionPath, functionsPath);
    const { name, version } = definition;
    const fn = `${name}-${version}`;

    if (typeof definition.schema.icon === 'string') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const icon = {
        AuthenticateIcon: { color: 'Teal', name: 'UserArrowInIcon' },
        ConditionIcon: { color: 'Yellow', name: 'ConditionIcon' },
        CreateIcon: { color: 'Green', name: 'PlusIcon' },
        DeleteIcon: { color: 'Pink', name: 'TrashIcon' },
        EmailIcon: { color: 'Orange', name: 'AtIcon' },
        FinishFlagIcon: { color: 'Grey', name: 'FinishIcon' },
        HttpRequestIcon: { color: 'Orange', name: 'CloudIcon' },
        LogsIcon: { color: 'Orange', name: 'FileLogIcon' },
        LoopIcon: { color: 'Blue', name: 'LoopIcon' },
        UpdateIcon: { color: 'Green', name: 'ArrowClockwiseIcon' },
        UploadIcon: { color: 'Orange', name: 'UploadIcon' },
      }[definition.schema.icon];

      definition.schema.icon = icon || { color: 'Orange', name: 'ActionsIcon' };

      fs.writeJSONSync(
        functionDefinitionPath(functionPath),
        definition.schema,
        {
          spaces: 2,
        },
      );

      log(`${check} Converted: ${fn} => ${JSON.stringify(icon)}`);
    } else {
      log(`${check} Skipped: ${fn}`);
    }
  });

  log('Done.');
};

export { convert };
