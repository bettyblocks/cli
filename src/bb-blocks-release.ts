import program from 'commander';
import releaseBlocks from './blocks/releaseBlocks';

program
  .usage('[options] [blockIds...]')
  .option(
    '-a, --all',
    'release all dev blocks that are attached to your account',
  )
  .name('bb blocks release')
  .parse(process.argv);

const { all }: { all?: boolean } = program.opts();
const blockIds = program.args;

if (!all && !blockIds.length) {
  console.error('No block IDs provided');
  process.exit(1);
}

// eslint-disable-next-line no-void
void (async (): Promise<void> => {
  await releaseBlocks({ all, blockIds });
})();
