import childProcess from 'child_process';

export default (action) => {
  const { cmds, silent } = action;

  cmds.forEach((cmd) => {
    const args = cmd[1] || [];

    childProcess.spawnSync(cmd[0], args, {
      cwd: process.cwd(),
      shell: true,
      stdio: silent ? 'pipe' : 'inherit',
      encoding: 'utf8',
    });
  });
};
