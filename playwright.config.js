const { defineConfig, devices } = require( '@playwright/test' );

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig( {
	testDir: './tests/e2e',
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !! process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 1 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: [
		[ 'html' ],
		[ 'json', { outputFile: 'test-results/playwright-results.json' } ],
	],
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		// baseURL: 'http://localhost:8889',

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: 'on-first-retry',

		/* Take screenshot on failure */
		screenshot: 'only-on-failure',

		/* Video recording */
		video: 'retain-on-failure',
	},

	/* Configure projects for major browsers */
	projects: [
		{
			name: 'chromium',
			use: { ...devices[ 'Desktop Chrome' ] },
		},
	],

	/* Run your local dev server before starting the tests - disabled for standalone tests */
	// webServer: {
	// 	command: 'npm run start',
	// 	url: 'http://localhost:8889',
	// 	reuseExistingServer: !process.env.CI,
	// 	timeout: 120 * 1000,
	// },

	/* Global test timeout */
	timeout: 30 * 1000,

	/* Expect timeout */
	expect: {
		/* Timeout for expect() calls */
		timeout: 5000,

		/* Visual comparison threshold */
		threshold: 0.2,

		/* Visual comparison mode */
		mode: 'pixel',
	},

	/* Output directory for test artifacts */
	outputDir: 'test-results',
} );
