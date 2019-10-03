import { promisify } from 'util';
import { exec } from 'child_process';
import { pathExists } from 'fs-extra';
import { path } from 'app-root-path';

const execute = promisify(exec);
const BB = `node ${path}/build/bb.js`;

beforeAll(async () => {
  await execute('rm -rf test-* /tmp/test-01');
});

afterAll(async () => {
  await execute('rm -rf test-* /tmp/test-01');
});

describe('BB CLI - create', () => {
  it('should create a folder in the CWD', async () => {
    await execute(`${BB} components create test-01`);

    const exist = await pathExists('test-01');
    expect(exist).toEqual(true);
  });

  it('should create a folder in given path', async () => {
    await execute(`${BB} components create /tmp/test-01`);

    const exist = await pathExists('/tmp/test-01');
    expect(exist).toEqual(true);
  });

  it('should display command help output when no name is given', async () => {
    const { stdout, stderr } = await execute(`${BB} components create`);

    expect(stderr).toBeFalsy();

    const expected = expect.stringMatching(
      'Usage: bb components create <path>',
    );

    expect(stdout).toEqual(expected);
  });
});

describe('BB CLI - build', () => {
  it('should build a component set', async () => {
    await execute(`${BB} components create test-02`);

    let exist = await pathExists('test-02/dist');
    expect(exist).toBeFalsy();

    await execute(`${BB} components build test-02`);

    exist = await pathExists('test-02/dist');
    expect(exist).toEqual(true);

    const { stdout, stderr } = await execute('ls test-02/dist');
    expect(stderr).toBeFalsy();

    const templates = expect.stringMatching('templates.json');
    const prefabs = expect.stringMatching('prefabs.json');

    expect(stdout).toEqual(templates);
    expect(stdout).toEqual(prefabs);
  });

  it('should throw an error when there are duplicate components name', async () => {
    await execute(`${BB} components create test-03`);

    const component =
      // tslint:disable-next-line: max-line-length
      '(() => ({name: "HelloWorld", type: "ROW", allowedTypes: [], orientation: "HORIZONTAL", jsx: "", styles: "" }))();';
    await execute(`echo '${component}' > test-03/src/components/sameName.js`);

    await expect(execute(`${BB} components build test-03`)).rejects.toThrow(
      /duplicate name/,
    );
  });

  it('should throw an error when there are syntax error in one of the components', async () => {
    await execute(`${BB} components create test-04`);

    const component = '(() => ({name: HelloWorld}))();';
    await execute(
      `echo '${component}' > test-04/src/components/brokenComponent.js`,
    );

    await expect(execute(`${BB} components build test-04`)).rejects.toThrow(
      /HelloWorld is not defined/,
    );
  });

  it('should throw an error when required properties are no present in the component', async () => {
    await execute(`${BB} components create test-05`);

    const component = '(() => ({name: "HelloWorld"}))();';
    await execute(
      `echo '${component}' > test-05/src/components/brokenComponent.js`,
    );

    await expect(execute(`${BB} components build test-05`)).rejects.toThrow(
      /required properties are missing from your component/,
    );
  });
});

describe('BB CLI - publish', () => {
  it('should throw an error when azure blob account is not set', async () => {
    await execute(`${BB} components create test-06`);
    await execute(`${BB} components build test-06`);

    await expect(
      execute(`AZURE_BLOB_ACCOUNT= ${BB} components publish test-06`),
    ).rejects.toThrow(/AZURE_BLOB_ACCOUNT is required/);
  });

  it('should throw an error when azure blob account key is not set', async () => {
    await execute(`${BB} components create test-07`);
    await execute(`${BB} components build test-07`);

    await expect(
      execute(
        `AZURE_BLOB_ACCOUNT=pepe AZURE_BLOB_ACCOUNT_KEY= ${BB} components publish test-07`,
      ),
    ).rejects.toThrow(/AZURE_BLOB_ACCOUNT_KEY is required/);
  });

  it('should throw an error when bucket name is not provided', async () => {
    await execute(`${BB} components create test-08`);
    await execute(`${BB} components build test-08`);

    await expect(
      execute(
        `AZURE_BLOB_ACCOUNT=pepe AZURE_BLOB_ACCOUNT_KEY=akey ${BB} components publish test-08`,
      ),
    ).rejects.toThrow(/-b or --bucket/);
  });
});
