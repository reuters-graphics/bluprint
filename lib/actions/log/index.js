const mustache = require('mustache');
const chalk = require('chalk');
const chalkTemplate = require('chalk/templates');

module.exports = (action, context) => {
  const { msg } = action;

  const renderedMsg = mustache.render(msg, context);
  const chalkedMsg = chalkTemplate(chalk, renderedMsg);
  console.log(chalkedMsg);
};
