// DMC: CPR-00-00-00-022A | Título: BREX computável — regras ESLint (Power of 10 adaptado)
export const brexRules = {
  'no-restricted-syntax': ['error', 'LabeledStatement', 'WithStatement', 'SequenceExpression'], // P10-01
  'no-fallthrough': 'error',
  'no-constant-condition': ['error', { checkLoops: 'all' }], // P10-02
  'max-lines-per-function': ['error', { max: 60, skipBlankLines: true, skipComments: true }], // P10-04
  complexity: ['error', 10],
  'max-depth': ['error', 3],
  'max-params': ['error', 4],
  'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
  'prefer-const': 'error', // P10-06
  'no-var': 'error',
  '@typescript-eslint/no-floating-promises': 'error', // P10-07
  '@typescript-eslint/switch-exhaustiveness-check': 'error',
  'no-eval': 'error', // P10-08
  'no-implied-eval': 'error',
  'no-new-func': 'error',
  'no-param-reassign': ['error', { props: false }], // P10-09 (ver exceção em brex/BREX.md)
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
};
