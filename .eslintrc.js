module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'airbnb/base',
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': ['error', { singleQuote: true }],
  },
  parser: '@typescript-eslint/parser',
};
