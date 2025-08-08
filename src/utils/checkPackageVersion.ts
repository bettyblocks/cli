import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export const checkPackageVersion = async (name: string): Promise<void> => {
  const { stderr: error } = await execPromise(`npm view ${name} version`);
  if (error) {
    throw new Error(error);
  }
};
