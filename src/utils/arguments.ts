export const parseDir = (args: string[]): string =>
  args.length === 0 ? '.' : args[0];

export const parsePort = (port: string, defaultPort: number): number =>
  Number.isNaN((port as unknown) as number)
    ? defaultPort
    : parseInt(port as string, 10);
