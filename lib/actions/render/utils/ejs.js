import S from 'string';

export default {
  camelize: (text) => S(text).camelize().s,
  capitalize: (text) => S(text).capitalize().s,
  dasherize: (text) => S(text).dasherize().s,
  humanize: (text) => S(text).humanize().s,
  latinise: (text) => S(text).latinise().s,
  slugify: (text) => S(text).slugify().s,
  titleCase: (text) => S(text).titleCase().s,
  underscore: (text) => S(text).underscore().s,
};
