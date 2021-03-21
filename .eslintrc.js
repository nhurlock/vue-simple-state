module.exports = {
	root: true,
	env: {
		node: true,
		es2021: true
	},
	parserOptions: {
		sourceType: 'module'
	},
	extends: ['eslint:recommended', 'plugin:prettier/recommended'],
	rules: {
		'prettier/prettier': [
			'error',
			{
				singleQuote: true,
				semi: false,
				trailingComma: 'none',
				useTabs: true,
				tabWidth: 4,
				endOfLine: 'auto'
			}
		],
		'sort-imports': ['error', { ignoreDeclarationSort: true }]
	},
	overrides: [
		{
			files: ['tests/**/*.spec.{j,t}s', '__mocks__/**/*.{j,t}s'],
			env: {
				jest: true
			}
		}
	]
}
