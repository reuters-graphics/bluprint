import S from 'string';

type MustacheFunction = (
  text: string,
  render: (text: string) => string
) => string;

export default {
  camelize:
    (): MustacheFunction =>
    (text, render) =>
      S(render(text)).camelize().s,
  capitalize:
    (): MustacheFunction =>
    (text, render) =>
      S(render(text)).capitalize().s,
  dasherize:
    (): MustacheFunction =>
    (text, render) =>
      S(render(text)).dasherize().s,
  humanize:
    (): MustacheFunction =>
    (text, render) =>
      S(render(text)).humanize().s,
  latinise:
    (): MustacheFunction =>
    (text, render) =>
      S(render(text)).latinise().s,
  slugify:
    (): MustacheFunction =>
    (text, render) =>
      S(render(text)).slugify().s,
  titleCase:
    (): MustacheFunction =>
    (text, render) =>
      S(render(text)).titleCase().s,
  underscore:
    (): MustacheFunction =>
    (text, render) =>
      S(render(text)).underscore().s,
};
