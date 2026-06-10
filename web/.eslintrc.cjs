/** Minimal ESLint setup — tsc (`npm run typecheck`) is the strict gate in CI;
 *  ESLint catches React-specific footguns (hooks rules, fast-refresh). */
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'node_modules', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    // tsc's noUnusedLocals already enforces this — avoid double-reporting.
    '@typescript-eslint/no-unused-vars': 'off',
    'react-refresh/only-export-components': 'off',
    // Best-effort `catch {}` around localStorage/clipboard is intentional.
    'no-empty': ['error', { allowEmptyCatch: true }],
  },
};
