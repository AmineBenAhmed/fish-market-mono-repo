module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      ['api', 'admin', 'seller', 'website', 'mobile', 'shared', 'ui', 'config', 'root', 'deps', 'docs'],
    ],
    'scope-empty': [2, 'never'],
  },
};
