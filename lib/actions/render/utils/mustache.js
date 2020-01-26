import S from 'string';

export default {
  camelize: () => (text, render) => S(render(text)).camelize().s,
  capitalize: () => (text, render) => S(render(text)).capitalize().s,
  dasherize: () => (text, render) => S(render(text)).dasherize().s,
  humanize: () => (text, render) => S(render(text)).humanize().s,
  latinise: () => (text, render) => S(render(text)).latinise().s,
  slugify: () => (text, render) => S(render(text)).slugify().s,
  titleCase: () => (text, render) => S(render(text)).titleCase().s,
  underscore: () => (text, render) => S(render(text)).underscore().s,
};
