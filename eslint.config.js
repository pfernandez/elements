export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'array-bracket-newline': ['warn', 'consistent'],
      'arrow-parens': ['warn', 'as-needed'],
      'arrow-spacing': 'warn',
      'comma-spacing': ['warn', { before: false, after: true }],
      'comma-style': ['warn', 'last'],
      'computed-property-spacing': ['warn', 'never'],
      'eol-last': ['warn', 'always'],
      'indent': ['warn', 2, {
        CallExpression: { arguments: 'first' },
        ImportDeclaration: 'first',
        ObjectExpression: 'first',
        VariableDeclarator: {
          var: 2,
          let: 2,
          const: 3,
        },
      }],
      'key-spacing': ['warn', { mode: 'minimum' }],
      'linebreak-style': ['error', 'unix'],
      'no-extra-parens': 'warn',
      'no-multi-spaces': ['warn', {
        ignoreEOLComments: true,
        exceptions: { Property: false },
      }],
      'no-multiple-empty-lines': ['warn', { max: 2, maxEOF: 1 }],
      'no-trailing-spaces': 'warn',
      'no-undef': 'warn',
      'no-unused-vars': ['warn', {
        args: 'all',
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
      }],
      'object-curly-newline': ['warn', { consistent: true }],
      'object-curly-spacing': ['warn', 'always'],
      'operator-linebreak': ['warn', 'before', { overrides: { '=': 'ignore' } }],
      'prefer-rest-params': 'warn',
      'quotes': ['warn', 'single'],
      'semi': ['warn', 'never'],
      'sort-imports': 'warn',
      'space-before-function-paren': ['warn', {
        anonymous: 'never',
        asyncArrow: 'always',
        named: 'never',
      }],
      'spaced-comment': ['warn', 'always'],
      'space-in-parens': 'warn',
      'space-infix-ops': 'warn',
    },
  },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      globals: {
        console: 'readonly',
        URL: 'readonly',
        Event: 'readonly',
        PopStateEvent: 'readonly',
        document: 'readonly',
        window: 'readonly',
        fetch: 'readonly'
      },
    },
  },
]

