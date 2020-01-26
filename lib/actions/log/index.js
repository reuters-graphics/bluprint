import chalk from 'chalk';
import chalkTemplate from 'chalk/templates';
import mustache from 'mustache';

export default (action, context) => {
  const { msg } = action;

  const renderedMsg = mustache.render(msg, context);
  const chalkedMsg = chalkTemplate(chalk, renderedMsg);
  console.log(chalkedMsg);
};
