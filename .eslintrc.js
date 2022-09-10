module.exports = {
  root: true,
  extends: ['next', 'turbo', 'prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint/eslint-plugin', 'prettier', 'react-hooks'],
  rules: {
    'prettier/prettier': ['error']
  },
  settings: {
    next: {
      rootDir: ['apps/*/']
    }
  }
}
