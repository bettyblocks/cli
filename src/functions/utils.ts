import path from 'path';
import fs from 'fs-extra';
import https, { AgentOptions } from 'https';

export function setHttpsAgent(
  agentOptions?: AgentOptions,
): https.Agent | undefined {
  let options: AgentOptions | undefined;

  if (agentOptions) {
    options = (['ca', 'cert', 'key'] as const).reduce<AgentOptions>(
      (acc, key) => {
        if (typeof agentOptions[key] === 'string') {
          return {
            ...acc,
            [key]: fs.readFileSync(path.resolve(agentOptions[key] as string)),
          };
        }

        return acc;
      },
      agentOptions,
    );
  }

  const agent = agentOptions && options ? new https.Agent(options) : undefined;

  return agent;
}
