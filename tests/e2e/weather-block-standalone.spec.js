/**
 * Standalone Weather Block Visual Tests
 *
 * These tests render the weather block in isolation to verify visual appearance
 * without requiring a full WordPress installation.
 */

const { test, expect } = require( '@playwright/test' );

test.describe( 'Weather Block Standalone Visual Tests', () => {
	test.describe( 'Block States', () => {
		test( 'Weather block with data - current mode', async ( { page } ) => {
			const weatherBlockHTML = `
				<!DOCTYPE html>
				<html lang="en">
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1">
					<title>Weather Block - Current Mode</title>
					<style>
						body {
							font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
							margin: 0;
							padding: 40px;
							background: #f0f0f1;
						}
						.weather-block {
							background: #f8f9fa;
							color: #212529;
							border-radius: 8px;
							padding: 24px;
							max-width: 400px;
							margin: 0 auto;
							box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
							position: relative;
						}
						.weather-block-content {
							display: flex;
							align-items: center;
							gap: 20px;
						}
						.weather-icon img {
							display: block;
							width: 64px;
							height: 64px;
						}
						.weather-main {
							flex: 1;
						}
						.weather-location h3 {
							margin: 0 0 4px 0;
							font-size: 1.3em;
							font-weight: 600;
							color: inherit;
						}
						.weather-country {
							font-size: 0.9em;
							opacity: 0.7;
							background: rgba(0, 0, 0, 0.1);
							padding: 2px 8px;
							border-radius: 12px;
							font-weight: 500;
						}
						.weather-temperature {
							margin: 12px 0 8px 0;
						}
						.temperature-current {
							font-size: 2.5em;
							font-weight: 700;
							line-height: 1;
						}
						.weather-description {
							font-size: 1.1em;
							opacity: 0.8;
							text-transform: capitalize;
						}
						.weather-humidity {
							margin-top: 16px;
							padding-top: 16px;
							border-top: 1px solid rgba(0, 0, 0, 0.1);
							font-size: 0.95em;
						}
						.weather-updated {
							margin-top: 12px;
							text-align: center;
						}
						.weather-updated small {
							font-size: 0.8em;
							opacity: 0.6;
						}
					</style>
				</head>
				<body>
					<div class="wp-block-weather-block-weather-display">
						<div class="weather-block weather-block-current" role="region" aria-label="Weather preview">
							<div class="weather-block-content">
								<div class="weather-icon">
									<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIyNCIgcj0iMTIiIGZpbGw9IiNGRkQ3MDAiIHN0cm9rZT0iI0ZGQTUwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik0zMiA0TDMyIDEyTTQ5LjY1NjkgMTEuMzQzMUw0NC40ODUzIDE2LjUxNDdNNjAgMjhINTJNNDkuNjU2OSA0NC42NTY5TDQ0LjQ4NTMgMzkuNDg1M00zMiA2MEwzMiA1Mk0xNC4zNDMxIDQ0LjY1NjlMMTkuNTE0NyAzOS40ODUzTTQgMjhIMTJNMTQuMzQzMSAxMS4zNDMxTDE5LjUxNDcgMTYuNTE0NyIgc3Ryb2tlPSIjRkZBNTAwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K" alt="partly cloudy" width="64" height="64" loading="lazy">
								</div>
								<div class="weather-main">
									<div class="weather-location">
										<h3>London</h3>
										<span class="weather-country">GB</span>
									</div>
									<div class="weather-temperature">
										<span class="temperature-current" aria-label="Current temperature: 21°C">21°C</span>
									</div>
									<div class="weather-description">Partly cloudy</div>
								</div>
							</div>
							<div class="weather-humidity">Humidity: 65%</div>
							<div class="weather-updated">
								<small>Live data</small>
							</div>
						</div>
					</div>
				</body>
				</html>
			`;

			await page.setContent( weatherBlockHTML );
			const weatherBlock = page.locator( '.weather-block' );

			await expect( weatherBlock ).toBeVisible();
			await expect( weatherBlock ).toHaveScreenshot(
				'weather-block-current-mode.png'
			);
		} );

		test( 'Weather block with data - extended mode', async ( { page } ) => {
			const weatherBlockHTML = `
				<!DOCTYPE html>
				<html lang="en">
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1">
					<title>Weather Block - Extended Mode</title>
					<style>
						body {
							font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
							margin: 0;
							padding: 40px;
							background: #f0f0f1;
						}
						.weather-block {
							background: #f8f9fa;
							color: #212529;
							border-radius: 8px;
							padding: 24px;
							max-width: 480px;
							margin: 0 auto;
							box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
						}
						.weather-block-content {
							display: flex;
							align-items: flex-start;
							gap: 20px;
							margin-bottom: 20px;
						}
						.weather-icon img {
							display: block;
							width: 80px;
							height: 80px;
						}
						.weather-main {
							flex: 1;
						}
						.weather-location h3 {
							margin: 0 0 4px 0;
							font-size: 1.4em;
							font-weight: 600;
						}
						.weather-country {
							font-size: 0.9em;
							opacity: 0.7;
							background: rgba(0, 0, 0, 0.1);
							padding: 2px 8px;
							border-radius: 12px;
							font-weight: 500;
						}
						.weather-temperature {
							margin: 16px 0 12px 0;
						}
						.temperature-current {
							font-size: 3em;
							font-weight: 700;
							line-height: 1;
							display: block;
							margin-bottom: 8px;
						}
						.temperature-range {
							display: flex;
							gap: 16px;
							margin-bottom: 8px;
							font-size: 0.95em;
						}
						.temperature-min, .temperature-max {
							opacity: 0.8;
						}
						.temperature-feels-like {
							font-size: 0.9em;
							opacity: 0.7;
						}
						.weather-description {
							font-size: 1.1em;
							opacity: 0.8;
							text-transform: capitalize;
							margin-top: 8px;
						}
						.weather-details {
							display: grid;
							grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
							gap: 16px;
							padding: 20px;
							background: rgba(0, 0, 0, 0.03);
							border-radius: 8px;
							margin-bottom: 16px;
						}
						.weather-detail {
							display: flex;
							flex-direction: column;
							align-items: center;
							text-align: center;
							padding: 12px;
							background: rgba(255, 255, 255, 0.5);
							border-radius: 6px;
						}
						.detail-label {
							font-size: 0.85em;
							opacity: 0.7;
							margin-bottom: 4px;
							font-weight: 500;
						}
						.detail-value {
							font-size: 1.1em;
							font-weight: 600;
						}
						.weather-updated {
							text-align: center;
						}
						.weather-updated small {
							font-size: 0.8em;
							opacity: 0.6;
						}
					</style>
				</head>
				<body>
					<div class="wp-block-weather-block-weather-display">
						<div class="weather-block weather-block-extended" role="region" aria-label="Weather preview">
							<div class="weather-block-content">
								<div class="weather-icon">
									<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSIzMCIgcj0iMTUiIGZpbGw9IiNGRkQ3MDAiIHN0cm9rZT0iI0ZGQTUwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik00MCA1TDQwIDE1TTYyLjA3MSAxNC4xNzg2TDU1LjYwNjYgMjAuNjQzNE03NSAzNUg2NU02Mi4wNzEgNTUuODIxNEw1NS42MDY2IDQ5LjM1NjZNNDAgNzVMNDAgNjVNMTcuOTI4OSA1NS44MjE0TDI0LjM5MzQgNDkuMzU2Nk01IDM1SDE1TTE3LjkyODkgMTQuMTc4NkwyNC4zOTM0IDIwLjY0MzQiIHN0cm9rZT0iI0ZGQTUwMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+Cg==" alt="partly cloudy" width="80" height="80" loading="lazy">
								</div>
								<div class="weather-main">
									<div class="weather-location">
										<h3>London</h3>
										<span class="weather-country">GB</span>
									</div>
									<div class="weather-temperature">
										<span class="temperature-current" aria-label="Current temperature: 21°C">21°C</span>
										<div class="temperature-range">
											<span class="temperature-min">Low: 18°C</span>
											<span class="temperature-max">High: 23°C</span>
										</div>
										<div class="temperature-feels-like">Feels like 19°C</div>
									</div>
									<div class="weather-description">Partly cloudy</div>
								</div>
							</div>
							<div class="weather-details">
								<div class="weather-detail" aria-label="Humidity: 65%">
									<span class="detail-label">Humidity:</span>
									<span class="detail-value">65%</span>
								</div>
								<div class="weather-detail" aria-label="Pressure: 1013 hPa">
									<span class="detail-label">Pressure:</span>
									<span class="detail-value">1013 hPa</span>
								</div>
								<div class="weather-detail" aria-label="Wind: 3.5 m/s">
									<span class="detail-label">Wind:</span>
									<span class="detail-value">3.5 m/s</span>
								</div>
							</div>
							<div class="weather-updated">
								<small>Live data</small>
							</div>
						</div>
					</div>
				</body>
				</html>
			`;

			await page.setContent( weatherBlockHTML );
			const weatherBlock = page.locator( '.weather-block' );

			await expect( weatherBlock ).toBeVisible();
			await expect( weatherBlock ).toHaveScreenshot(
				'weather-block-extended-mode.png'
			);
		} );

		test( 'Weather block loading state', async ( { page } ) => {
			const loadingHTML = `
				<!DOCTYPE html>
				<html lang="en">
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1">
					<title>Weather Block - Loading State</title>
					<style>
						body {
							font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
							margin: 0;
							padding: 40px;
							background: #f0f0f1;
						}
						.weather-block-preview {
							background: #f8f9fa;
							border-radius: 8px;
							padding: 40px;
							max-width: 400px;
							margin: 0 auto;
							text-align: center;
							box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
						}
						.weather-block-loading {
							display: flex;
							flex-direction: column;
							align-items: center;
							gap: 16px;
						}
						.spinner {
							width: 32px;
							height: 32px;
							border: 3px solid #e3e4e6;
							border-top: 3px solid #1e1e1e;
							border-radius: 50%;
							animation: spin 1s linear infinite;
						}
						@keyframes spin {
							0% { transform: rotate(0deg); }
							100% { transform: rotate(360deg); }
						}
						.weather-block-loading p {
							margin: 0;
							color: #646970;
							font-size: 0.95em;
						}
					</style>
				</head>
				<body>
					<div class="weather-block-preview weather-block-loading">
						<div class="spinner"></div>
						<p>Loading weather data…</p>
					</div>
				</body>
				</html>
			`;

			await page.setContent( loadingHTML );
			const loadingBlock = page.locator( '.weather-block-preview' );

			await expect( loadingBlock ).toBeVisible();
			await expect( loadingBlock ).toHaveScreenshot(
				'weather-block-loading.png'
			);
		} );

		test( 'Weather block error state', async ( { page } ) => {
			const errorHTML = `
				<!DOCTYPE html>
				<html lang="en">
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1">
					<title>Weather Block - Error State</title>
					<style>
						body {
							font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
							margin: 0;
							padding: 40px;
							background: #f0f0f1;
						}
						.weather-block-preview {
							background: #f8f9fa;
							border-radius: 8px;
							padding: 24px;
							max-width: 400px;
							margin: 0 auto;
							box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
						}
						.notice {
							background: #fcf2f2;
							border: 1px solid #e65054;
							border-radius: 4px;
							padding: 16px;
							color: #d63638;
						}
						.notice strong {
							display: block;
							margin-bottom: 4px;
							font-weight: 600;
						}
					</style>
				</head>
				<body>
					<div class="weather-block-preview weather-block-error">
						<div class="notice notice-error">
							<strong>Weather Error:</strong>
							Location not found. Please check the location name.
						</div>
					</div>
				</body>
				</html>
			`;

			await page.setContent( errorHTML );
			const errorBlock = page.locator( '.weather-block-preview' );

			await expect( errorBlock ).toBeVisible();
			await expect( errorBlock ).toHaveScreenshot(
				'weather-block-error.png'
			);
		} );

		test( 'Weather block placeholder state', async ( { page } ) => {
			const placeholderHTML = `
				<!DOCTYPE html>
				<html lang="en">
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1">
					<title>Weather Block - Placeholder</title>
					<style>
						body {
							font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
							margin: 0;
							padding: 40px;
							background: #f0f0f1;
						}
						.weather-block-preview {
							background: #f8f9fa;
							border: 2px dashed #c3c4c7;
							border-radius: 8px;
							padding: 40px;
							max-width: 400px;
							margin: 0 auto;
							text-align: center;
							color: #646970;
						}
						.weather-block-placeholder p {
							margin: 0;
							font-size: 1em;
						}
					</style>
				</head>
				<body>
					<div class="weather-block-preview weather-block-placeholder">
						<p>Enter a location to preview weather data</p>
					</div>
				</body>
				</html>
			`;

			await page.setContent( placeholderHTML );
			const placeholderBlock = page.locator( '.weather-block-preview' );

			await expect( placeholderBlock ).toBeVisible();
			await expect( placeholderBlock ).toHaveScreenshot(
				'weather-block-placeholder.png'
			);
		} );
	} );

	test.describe( 'Responsive Design', () => {
		const viewports = [
			{ name: 'mobile', width: 375, height: 667 },
			{ name: 'tablet', width: 768, height: 1024 },
			{ name: 'desktop', width: 1200, height: 800 },
		];

		viewports.forEach( ( { name, width, height } ) => {
			test( `Weather block responsive - ${ name }`, async ( {
				page,
			} ) => {
				await page.setViewportSize( { width, height } );

				const responsiveHTML = `
					<!DOCTYPE html>
					<html lang="en">
					<head>
						<meta charset="utf-8">
						<meta name="viewport" content="width=device-width, initial-scale=1">
						<title>Weather Block - ${
							name.charAt( 0 ).toUpperCase() + name.slice( 1 )
						}</title>
						<style>
							body {
								font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
								margin: 0;
								padding: 20px;
								background: #f0f0f1;
							}
							.weather-block {
								background: #f8f9fa;
								color: #212529;
								border-radius: 8px;
								padding: 24px;
								max-width: 100%;
								margin: 0 auto;
								box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
							}
							.weather-block-content {
								display: flex;
								align-items: center;
								gap: 20px;
							}
							.weather-icon img {
								width: 64px;
								height: 64px;
								flex-shrink: 0;
							}
							.weather-main {
								flex: 1;
								min-width: 0;
							}
							.weather-location h3 {
								margin: 0 0 4px 0;
								font-size: 1.3em;
								font-weight: 600;
								word-wrap: break-word;
							}
							.weather-country {
								font-size: 0.9em;
								opacity: 0.7;
								background: rgba(0, 0, 0, 0.1);
								padding: 2px 8px;
								border-radius: 12px;
								font-weight: 500;
								display: inline-block;
							}
							.temperature-current {
								font-size: 2.5em;
								font-weight: 700;
								line-height: 1;
								display: block;
								margin: 12px 0 8px 0;
							}
							.weather-description {
								font-size: 1.1em;
								opacity: 0.8;
								text-transform: capitalize;
							}
							.weather-humidity {
								margin-top: 16px;
								padding-top: 16px;
								border-top: 1px solid rgba(0, 0, 0, 0.1);
								font-size: 0.95em;
							}
							.weather-updated {
								margin-top: 12px;
								text-align: center;
							}
							.weather-updated small {
								font-size: 0.8em;
								opacity: 0.6;
							}
							
							/* Mobile optimizations */
							@media (max-width: 480px) {
								body {
									padding: 10px;
								}
								.weather-block {
									padding: 20px;
								}
								.weather-block-content {
									flex-direction: column;
									text-align: center;
									gap: 16px;
								}
								.weather-icon img {
									width: 80px;
									height: 80px;
								}
								.temperature-current {
									font-size: 3em;
								}
								.weather-location h3 {
									font-size: 1.5em;
								}
							}
							
							/* Tablet optimizations */
							@media (min-width: 481px) and (max-width: 768px) {
								.weather-block {
									max-width: 500px;
								}
							}
						</style>
					</head>
					<body>
						<div class="wp-block-weather-block-weather-display">
							<div class="weather-block" role="region" aria-label="Weather preview">
								<div class="weather-block-content">
									<div class="weather-icon">
										<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIyNCIgcj0iMTIiIGZpbGw9IiNGRkQ3MDAiIHN0cm9rZT0iI0ZGQTUwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik0zMiA0TDMyIDEyTTQ5LjY1NjkgMTEuMzQzMUw0NC40ODUzIDE2LjUxNDdNNjAgMjhINTJNNDkuNjU2OSA0NC42NTY5TDQ0LjQ4NTMgMzkuNDg1M00zMiA2MEwzMiA1Mk0xNC4zNDMxIDQ0LjY1NjlMMTkuNTE0NyAzOS40ODUzTTQgMjhIMTJNMTQuMzQzMSAxMS4zNDMxTDE5LjUxNDcgMTYuNTE0NyIgc3Ryb2tlPSIjRkZBNTAwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K" alt="partly cloudy" width="64" height="64" loading="lazy">
									</div>
									<div class="weather-main">
										<div class="weather-location">
											<h3>London</h3>
											<span class="weather-country">GB</span>
										</div>
										<div class="weather-temperature">
											<span class="temperature-current">21°C</span>
										</div>
										<div class="weather-description">Partly cloudy</div>
									</div>
								</div>
								<div class="weather-humidity">Humidity: 65%</div>
								<div class="weather-updated">
									<small>Live data</small>
								</div>
							</div>
						</div>
					</body>
					</html>
				`;

				await page.setContent( responsiveHTML );
				const weatherBlock = page.locator( '.weather-block' );

				await expect( weatherBlock ).toBeVisible();
				await expect( weatherBlock ).toHaveScreenshot(
					`weather-block-responsive-${ name }.png`
				);
			} );
		} );
	} );

	test.describe( 'Theme Variations', () => {
		test( 'Weather block dark theme', async ( { page } ) => {
			const darkThemeHTML = `
				<!DOCTYPE html>
				<html lang="en">
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1">
					<title>Weather Block - Dark Theme</title>
					<style>
						body {
							font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
							margin: 0;
							padding: 40px;
							background: #1e1e1e;
						}
						.weather-block {
							background: #2c2c2c;
							color: #ffffff;
							border-radius: 8px;
							padding: 24px;
							max-width: 400px;
							margin: 0 auto;
							box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
						}
						.weather-block-content {
							display: flex;
							align-items: center;
							gap: 20px;
						}
						.weather-icon img {
							width: 64px;
							height: 64px;
						}
						.weather-main {
							flex: 1;
						}
						.weather-location h3 {
							margin: 0 0 4px 0;
							font-size: 1.3em;
							font-weight: 600;
							color: #ffffff;
						}
						.weather-country {
							font-size: 0.9em;
							opacity: 0.8;
							background: rgba(255, 255, 255, 0.15);
							padding: 2px 8px;
							border-radius: 12px;
							font-weight: 500;
							color: #ffffff;
						}
						.temperature-current {
							font-size: 2.5em;
							font-weight: 700;
							line-height: 1;
							display: block;
							margin: 12px 0 8px 0;
							color: #ffffff;
						}
						.weather-description {
							font-size: 1.1em;
							opacity: 0.8;
							text-transform: capitalize;
							color: #ffffff;
						}
						.weather-humidity {
							margin-top: 16px;
							padding-top: 16px;
							border-top: 1px solid rgba(255, 255, 255, 0.2);
							font-size: 0.95em;
							color: #ffffff;
						}
						.weather-updated {
							margin-top: 12px;
							text-align: center;
						}
						.weather-updated small {
							font-size: 0.8em;
							opacity: 0.6;
							color: #ffffff;
						}
					</style>
				</head>
				<body>
					<div class="wp-block-weather-block-weather-display">
						<div class="weather-block" role="region" aria-label="Weather preview">
							<div class="weather-block-content">
								<div class="weather-icon">
									<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIyNCIgcj0iMTIiIGZpbGw9IiNGRkQ3MDAiIHN0cm9rZT0iI0ZGQTUwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik0zMiA0TDMyIDEyTTQ5LjY1NjkgMTEuMzQzMUw0NC40ODUzIDE2LjUxNDdNNjAgMjhINTJNNDkuNjU2OSA0NC42NTY5TDQ0LjQ4NTMgMzkuNDg1M00zMiA2MEwzMiA1Mk0xNC4zNDMxIDQ0LjY1NjlMMTkuNTE0NyAzOS40ODUzTTQgMjhIMTJNMTQuMzQzMSAxMS4zNDMxTDE5LjUxNDcgMTYuNTE0NyIgc3Ryb2tlPSIjRkZBNTAwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K" alt="partly cloudy" width="64" height="64" loading="lazy">
								</div>
								<div class="weather-main">
									<div class="weather-location">
										<h3>London</h3>
										<span class="weather-country">GB</span>
									</div>
									<div class="weather-temperature">
										<span class="temperature-current">21°C</span>
									</div>
									<div class="weather-description">Partly cloudy</div>
								</div>
							</div>
							<div class="weather-humidity">Humidity: 65%</div>
							<div class="weather-updated">
								<small>Live data</small>
							</div>
						</div>
					</div>
				</body>
				</html>
			`;

			await page.setContent( darkThemeHTML );
			const weatherBlock = page.locator( '.weather-block' );

			await expect( weatherBlock ).toBeVisible();
			await expect( weatherBlock ).toHaveScreenshot(
				'weather-block-dark-theme.png'
			);
		} );

		test( 'Weather block custom colors', async ( { page } ) => {
			const customColorsHTML = `
				<!DOCTYPE html>
				<html lang="en">
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1">
					<title>Weather Block - Custom Colors</title>
					<style>
						body {
							font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
							margin: 0;
							padding: 40px;
							background: #f0f4f8;
						}
						.weather-block {
							background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
							color: #ffffff;
							border-radius: 16px;
							padding: 28px;
							max-width: 400px;
							margin: 0 auto;
							box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
						}
						.weather-block-content {
							display: flex;
							align-items: center;
							gap: 20px;
						}
						.weather-icon img {
							width: 64px;
							height: 64px;
							filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
						}
						.weather-main {
							flex: 1;
						}
						.weather-location h3 {
							margin: 0 0 4px 0;
							font-size: 1.3em;
							font-weight: 600;
							color: #ffffff;
							text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
						}
						.weather-country {
							font-size: 0.9em;
							background: rgba(255, 255, 255, 0.2);
							padding: 3px 10px;
							border-radius: 16px;
							font-weight: 500;
							color: #ffffff;
							backdrop-filter: blur(10px);
						}
						.temperature-current {
							font-size: 2.8em;
							font-weight: 700;
							line-height: 1;
							display: block;
							margin: 12px 0 8px 0;
							color: #ffffff;
							text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
						}
						.weather-description {
							font-size: 1.1em;
							opacity: 0.9;
							text-transform: capitalize;
							color: #ffffff;
						}
						.weather-humidity {
							margin-top: 20px;
							padding-top: 20px;
							border-top: 1px solid rgba(255, 255, 255, 0.2);
							font-size: 0.95em;
							color: #ffffff;
							background: rgba(255, 255, 255, 0.1);
							padding: 12px 16px;
							border-radius: 8px;
							backdrop-filter: blur(10px);
						}
						.weather-updated {
							margin-top: 16px;
							text-align: center;
						}
						.weather-updated small {
							font-size: 0.8em;
							opacity: 0.8;
							color: #ffffff;
						}
					</style>
				</head>
				<body>
					<div class="wp-block-weather-block-weather-display">
						<div class="weather-block" role="region" aria-label="Weather preview">
							<div class="weather-block-content">
								<div class="weather-icon">
									<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIyNCIgcj0iMTIiIGZpbGw9IiNGRkQ3MDAiIHN0cm9rZT0iI0ZGQTUwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik0zMiA0TDMyIDEyTTQ5LjY1NjkgMTEuMzQzMUw0NC40ODUzIDE2LjUxNDdNNjAgMjhINTJNNDkuNjU2OSA0NC42NTY5TDQ0LjQ4NTMgMzkuNDg1M00zMiA2MEwzMiA1Mk0xNC4zNDMxIDQ0LjY1NjlMMTkuNTE0NyAzOS40ODUzTTQgMjhIMTJNMTQuMzQzMSAxMS4zNDMxTDE5LjUxNDcgMTYuNTE0NyIgc3Ryb2tlPSIjRkZBNTAwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K" alt="partly cloudy" width="64" height="64" loading="lazy">
								</div>
								<div class="weather-main">
									<div class="weather-location">
										<h3>London</h3>
										<span class="weather-country">GB</span>
									</div>
									<div class="weather-temperature">
										<span class="temperature-current">21°C</span>
									</div>
									<div class="weather-description">Partly cloudy</div>
								</div>
							</div>
							<div class="weather-humidity">Humidity: 65%</div>
							<div class="weather-updated">
								<small>Live data</small>
							</div>
						</div>
					</div>
				</body>
				</html>
			`;

			await page.setContent( customColorsHTML );
			const weatherBlock = page.locator( '.weather-block' );

			await expect( weatherBlock ).toBeVisible();
			await expect( weatherBlock ).toHaveScreenshot(
				'weather-block-custom-colors.png'
			);
		} );
	} );
} );
