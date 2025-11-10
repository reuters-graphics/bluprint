import childProcess from 'child_process';
import type { ExecuteAction } from './schema.js';

export default (action: ExecuteAction): void => {
  const { cmds, silent } = action;

  cmds.forEach((cmd) => {
    const args = (cmd[1] as string[]) || [];

    childProcess.spawnSync(cmd[0] as string, args, {
      cwd: process.cwd(),
      shell: true,
      stdio: silent ? 'pipe' : 'inherit',
      encoding: 'utf8',
    });
  });
};
