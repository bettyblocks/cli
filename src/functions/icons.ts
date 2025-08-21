import chalk from 'chalk';
import fs from 'fs-extra';
import ora from 'ora';

import {
  functionDefinition,
  functionDefinitionPath,
  functionDirs,
} from './functionDefinitions';

type ICONS = Record<string, { name: string; color: string }>;

const check = chalk.green(`✔`);

const convert = (functionsPath: string): void => {
  const checkStart = ora('Checking for function icons to convert ...').start();

  functionDirs(functionsPath, true).forEach((functionPath) => {
    const definition = functionDefinition(functionPath, functionsPath);
    const { name, version } = definition;
    const fn = `${name}-${version}`;

    if (typeof definition.schema.icon === 'string') {
      const icons: ICONS = {
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
      };

      definition.schema.icon = icons[definition.schema.icon] || {
        color: 'Orange',
        name: 'ActionsIcon',
      };

      fs.writeJSONSync(
        functionDefinitionPath(functionPath),
        definition.schema,
        {
          spaces: 2,
        },
      );

      console.log(
        `${check} Converted: ${fn} => ${JSON.stringify(
          definition.schema.icon,
        )}`,
      );
    } else {
      console.log(`${check} Skipped: ${fn}`);
    }
  });

  checkStart.succeed('Done.');
};

export { convert };
