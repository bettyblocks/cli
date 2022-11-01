import { promisify } from 'util';
import { exec } from 'child_process';

const execPromise = promisify(exec);

export const getPackageVersion = async (name: string): Promise<string> => {
  const { stdout: output, stderr: error } = await execPromise(
    `npm view ${name} version`,
  );
  const versionInfo = output.toString().trim();

  if (error) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw error;
  }

  return versionInfo;
};
