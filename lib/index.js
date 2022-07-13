export { default as add } from './commands/add';
export { default as newBluprint } from './commands/new';
export { default as remove } from './commands/remove';
export { default as start } from './commands/start';
export { default as clone } from './commands/clone';
export { default as token } from './commands/token';
export { default as test } from './commands/test';

export { default as handleActions } from './actions';

// Need to capture process exit explicitly, as prompts
// handles this differently to escape each question...
process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') process.exit(0);
});
process.on('SIGINT', () => { process.exit(0); });
process.on('SIGTERM', () => { process.exit(0); });
