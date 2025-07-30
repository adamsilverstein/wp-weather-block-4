const defaultConfig = require( '@wordpress/scripts/config/jest-unit.config.js' );

module.exports = {
	...defaultConfig,
	// Test environment
	testEnvironment: 'jsdom',

	// Setup files
	setupFilesAfterEnv: [
		'@testing-library/jest-dom',
		'<rootDir>/jest.setup.js',
	],

	// Coverage configuration
	collectCoverage: true,
	collectCoverageFrom: [
		'src/**/*.{js,jsx}',
		'!src/**/*.test.{js,jsx}',
		'!src/**/__tests__/**',
		'!src/**/node_modules/**',
		'!src/**/vendor/**',
		'!**/build/**',
	],
	coverageReporters: [ 'text', 'lcov', 'html', 'json-summary' ],
	coverageDirectory: 'coverage',
	coverageThreshold: {
		global: {
			branches: 50,
			functions: 50,
			lines: 50,
			statements: 50,
		},
	},

	// Module name mapping for CSS and assets
	moduleNameMapper: {
		...defaultConfig.moduleNameMapper,
		'\\.(css|less|scss|sass)$': 'identity-obj-proxy',
		'\\.(jpg|jpeg|png|gif|webp|svg)$':
			'<rootDir>/src/__mocks__/fileMock.js',
		'^@wordpress/blocks$': '<rootDir>/src/__mocks__/wordpress-blocks.js',
		'^@wordpress/api-fetch$':
			'<rootDir>/src/__mocks__/wordpress-api-fetch.js',
	},

	// Transform configuration
	transform: {
		'^.+\\.[jt]sx?$': [
			'babel-jest',
			{
				presets: [ '@wordpress/babel-preset-default' ],
			},
		],
	},

	// Test file patterns
	testMatch: [
		'<rootDir>/src/**/__tests__/**/*.{js,jsx}',
		'<rootDir>/src/**/?(*.)+(spec|test).{js,jsx}',
	],

	// Test timeout
	testTimeout: 10000,

	// Verbose output
	verbose: true,

	// Clear mocks between tests
	clearMocks: true,

	// Restore mocks after each test
	restoreMocks: true,
};
