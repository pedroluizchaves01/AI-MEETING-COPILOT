// DMC: CPR-00-00-00-900A | Título: Configuração do ESLint
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import { brexRules } from './brex/eslint.brex.js';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'brex/**', 'scripts/**', '*.config.js'] },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
    rules: brexRules,
  },
  {
    files: ['src/**/*.test.ts'],
    rules: { 'max-lines-per-function': 'off', '@typescript-eslint/consistent-type-assertions': 'off' },
  },
);
