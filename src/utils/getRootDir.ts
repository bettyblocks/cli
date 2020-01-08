import findUp from 'find-up';

export default async (): Promise<string> => {
  const yaml = await findUp('bettyblocks.yaml');

  if (typeof yaml === 'string') {
    return yaml.split('/bettyblocks.yaml')[0];
  }

  throw new Error(
    'Cannot find the root directory of the project, please try again in the component set folder',
  );
};
