const defaultConfig = require( '@wordpress/scripts/config/.eslintrc.js' );

module.exports = {
	...defaultConfig,
	extends: [ ...defaultConfig.extends ],
	env: {
		...defaultConfig.env,
		jest: true, // Enable Jest globals
		'jest/globals': true,
	},
	globals: {
		...defaultConfig.globals,
		// Add any additional globals if needed
	},
	overrides: [
		...( defaultConfig.overrides || [] ),
		{
			files: [
				'**/*.test.js',
				'**/__tests__/**/*.js',
				'jest.setup.js',
				'jest.config.js',
				'src/__mocks__/**/*.js',
				'tests/**/*.js',
			],
			env: {
				jest: true,
				node: true,
			},
			globals: {
				jest: 'readonly',
				beforeEach: 'readonly',
				afterEach: 'readonly',
				beforeAll: 'readonly',
				afterAll: 'readonly',
				describe: 'readonly',
				it: 'readonly',
				test: 'readonly',
				expect: 'readonly',
				KeyboardEvent: 'readonly',
				localStorage: 'readonly',
				sessionStorage: 'readonly',
			},
			rules: {
				'no-console': 'off', // Allow console in test files
				'jsdoc/check-tag-names': 'off', // Allow @jest-environment
				'jsx-a11y/label-has-associated-control': 'off', // Relaxed for test mocks
				'no-unused-vars': 'warn', // Warn instead of error for test files
				'jest/no-conditional-expect': 'off', // Allow conditional expects in tests
				'import/no-extraneous-dependencies': [
					'error',
					{
						devDependencies: true, // Allow dev dependencies in test files
					},
				],
			},
		},
		{
			files: [ 'playwright.config.js', 'tests/e2e/**/*.js' ],
			env: {
				node: true,
			},
			globals: {
				require: 'readonly',
				module: 'readonly',
				process: 'readonly',
			},
		},
	],
};
