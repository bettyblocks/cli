/* npm dependencies */
import chalk from 'chalk';
import program, { CommanderStatic } from 'commander';
import { pathExists, outputFile } from 'fs-extra';

/* internal dependencies */
import { checkUpdateAvailableCLI } from './utils/checkUpdateAvailable';

/* process arguments */
program
  .usage('[name]')
  .name('bb interactions generate')
  .parse(process.argv);

const { args }: CommanderStatic = program;

if (args.length === 0) {
  program.help();
}

const name: string = args[0];

/* generate file */
(async (): Promise<void> => {
  await checkUpdateAvailableCLI();
  if (name.includes(' ')) {
    throw new Error(chalk.red(`\nName cannot contain spaces\n`));
  }

  if (await pathExists(`src/cinteractions/${name}.js`)) {
    throw new Error(chalk.red(`\nInteraction ${name} already exists\n`));
  }

  const interaction = `
function ${name}(argument: string): string {
  // Function logic
  return argument;
}
  `;

  await Promise.all([
    outputFile(`src/interactions/${name}.ts`, interaction.trim()),
    console.log(chalk.green('The interaction has been generated')),
  ]);
})();
