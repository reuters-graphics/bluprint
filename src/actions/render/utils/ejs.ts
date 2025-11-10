import S from 'string';

export default {
  camelize: (text: string): string => S(text).camelize().s,
  capitalize: (text: string): string => S(text).capitalize().s,
  dasherize: (text: string): string => S(text).dasherize().s,
  humanize: (text: string): string => S(text).humanize().s,
  latinise: (text: string): string => S(text).latinise().s,
  slugify: (text: string): string => S(text).slugify().s,
  titleCase: (text: string): string => S(text).titleCase().s,
  underscore: (text: string): string => S(text).underscore().s,
};
