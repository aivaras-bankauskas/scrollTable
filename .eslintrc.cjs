module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true
	},
	extends: [
		'eslint:recommended',
		'plugin:vue/vue3-recommended',
		'@vue/eslint-config-typescript',
		'eslint-config-prettier'
	],
	parserOptions: {
		ecmaVersion: 2021,
		sourceType: 'module',
		parser: '@typescript-eslint/parser'
	},
	rules: {
		'curly': 'error',
		'no-console': 'off',
		'space-infix-ops': 'error',
		'no-multi-spaces': 'error',
		'indent': ['error', 'tab'],
		'semi': ['error', 'always'],
		'quotes': ['error', 'single'],
		'eqeqeq': ['error', 'always'],
		'no-trailing-spaces': 'error',
		'space-before-blocks': 'error',
		'eol-last': ['error', 'always'],
		'vue/html-indent': ['error', 4],
		'brace-style': ['error', '1tbs'],
		'vue/no-multiple-template-root': 0,
		'comma-dangle': ['error', 'never'],
		'linebreak-style': ['error', 'unix'],
		'block-spacing': ['error', 'always'],
		'space-in-parens': ['error', 'never'],
		'func-call-spacing': ['error', 'never'],
		'array-bracket-spacing': ['error', 'never'],
		'object-curly-spacing': ['error', 'always'],
		'no-multiple-empty-lines': ['error', { 'max': 1 }],
		'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
		'spaced-comment': ['error', 'always', { 'exceptions': ['-'] }],
		'no-plusplus': ['error', { 'allowForLoopAfterthoughts': true }],
		'switch-colon-spacing': ['error', { 'after': true, 'before': false }],
		'key-spacing': ['error', { 'beforeColon': false, 'afterColon': true }],
		'vue/script-indent': ['error', 4, { 'baseIndent': 1, 'switchCase': 1 }],
		'padding-line-between-statements': ['error', { 'blankLine': 'always', 'prev': '*', 'next': 'return' }]
	},
	'overrides': [
		{
			'files': ['*.vue'],
			'rules': { 'indent': 'off' }
		},
		{
			'files': ['*.ts', '*.tsx', '*.vue'],
			'rules': {
				'@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
				'@typescript-eslint/explicit-function-return-type': 'error',
				'@typescript-eslint/no-explicit-any': 'error',
				'no-unused-vars': 'off'
			}
		}
	]
};
