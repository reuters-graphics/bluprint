const childProcess = require('child_process');

module.exports = (action) => {
  const { cmds } = action;

  cmds.forEach((cmd) => {
    const args = cmd[1] || [];

    childProcess.spawnSync(cmd[0], args, {
      cwd: process.cwd(),
      shell: true,
      stdio: 'inherit',
      encoding: 'utf8',
    });
  });
};
