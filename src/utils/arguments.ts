export const parseDir = (args: string[]): string =>
  args.length === 0 ? '.' : args[0];

export const parsePort = (
  portRaw: string | undefined,
  defaultPort: number,
): number => {
  const port: number = parseInt(portRaw as string, 10);

  return Number.isNaN(port) ? defaultPort : port;
};
