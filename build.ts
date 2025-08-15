import { Glob } from 'bun';

const glob = new Glob('./src/bb*.ts');

const entrypoints = await Array.fromAsync(glob.scan('.'));

await Bun.build({
  entrypoints,
  outdir: './build',
  target: 'node',
});
