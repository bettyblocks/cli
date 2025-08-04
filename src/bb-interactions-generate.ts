/* npm dependencies */
import chalk from 'chalk';
import { Command } from 'commander';
import { pathExists, outputFile } from 'fs-extra';

import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';

const program = new Command();

program.usage('[name]').name('bb interactions generate').parse(process.argv);

const { args } = program;

if (args.length === 0) {
  program.help();
}

const name: string = args[0];

/* generate file */
// eslint-disable-next-line no-void
void (async (): Promise<void> => {
  await checkUpdateAvailableCLI();
  if (name.includes(' ')) {
    throw new Error(chalk.red(`\nName cannot contain spaces\n`));
  }

  if (await pathExists(`src/cinteractions/${name}.js`)) {
    throw new Error(chalk.red(`\nInteraction ${name} already exists\n`));
  }

  const interaction = `
function ${name}({ event, argument }: { event: Event, argument: string }): string {
  // Logic
  return argument;
}
`;

  await Promise.all([
    outputFile(`src/interactions/${name}.ts`, interaction.trim()),
    console.log(chalk.green('The interaction has been generated')),
  ]);
})();
