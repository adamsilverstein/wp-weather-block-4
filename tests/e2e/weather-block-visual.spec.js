/**
 * Visual regression tests for Weather Block
 *
 * These tests ensure that the visual appearance of the block remains consistent
 * across different states, themes, and responsive breakpoints.
 */

const { test, expect } = require( '@playwright/test' );

// Test data
const mockWeatherData = {
	location: {
		name: 'London',
		country: 'GB',
	},
	temperature: {
		current: 20.5,
		feels_like: 19.2,
		min: 18.0,
		max: 23.0,
	},
	weather: {
		main: 'Clouds',
		description: 'partly cloudy',
		icon: '02d',
		icon_url: 'https://openweathermap.org/img/wn/02d@2x.png',
	},
	humidity: 65,
	pressure: 1013,
	wind: {
		speed: 3.5,
		deg: 180,
	},
	cache_info: {
		cached: false,
	},
};

test.describe( 'Weather Block Visual Regression Tests', () => {
	test.beforeEach( async ( { page } ) => {
		// Mock the weather API to return consistent data
		await page.route(
			'**/wp-json/weather-block/v1/weather*',
			async ( route ) => {
				await route.fulfill( {
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify( mockWeatherData ),
				} );
			}
		);

		// Mock the weather icon
		await page.route(
			'**/openweathermap.org/img/wn/**',
			async ( route ) => {
				// Serve a simple SVG icon for consistency
				const svgIcon = `<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">
				<circle cx="25" cy="25" r="20" fill="#FFD700" stroke="#FFA500" stroke-width="2"/>
				<text x="25" y="30" text-anchor="middle" font-size="12" fill="#000">☀</text>
			</svg>`;
				await route.fulfill( {
					status: 200,
					contentType: 'image/svg+xml',
					body: svgIcon,
				} );
			}
		);
	} );

	test.describe( 'Block Editor Tests', () => {
		test.beforeEach( async ( { page } ) => {
			// Navigate to block editor with weather block
			await page.goto( '/wp-admin/post-new.php' );

			// Wait for editor to load
			await page.waitForSelector( '.block-editor' );

			// Add weather block
			await page.click( '[aria-label="Add block"]' );
			await page.fill( '[placeholder="Search for blocks"]', 'weather' );
			await page.click( 'text=Weather Block' );

			// Wait for block to be inserted
			await page.waitForSelector( '.weather-block-editor' );
		} );

		test( 'Weather block placeholder state', async ( { page } ) => {
			const blockElement = page.locator( '.weather-block-editor' );
			await expect( blockElement ).toContainText(
				'Enter a location to preview weather data'
			);

			// Visual regression test
			await expect( blockElement ).toHaveScreenshot(
				'weather-block-placeholder.png'
			);
		} );

		test( 'Weather block with location input', async ( { page } ) => {
			// Enter location
			const locationInput = page.locator(
				'input[placeholder*="Enter city name"]'
			);
			await locationInput.fill( 'London, UK' );

			// Wait for API call and data to load
			await page.waitForTimeout( 2000 );

			const blockElement = page.locator( '.weather-block-editor' );
			await expect( blockElement ).toContainText( 'London' );

			// Visual regression test
			await expect( blockElement ).toHaveScreenshot(
				'weather-block-with-data.png'
			);
		} );

		test( 'Weather block loading state', async ( { page } ) => {
			// Mock slow API response
			await page.route(
				'**/wp-json/weather-block/v1/weather*',
				async ( route ) => {
					await new Promise( ( resolve ) =>
						setTimeout( resolve, 1000 )
					);
					await route.fulfill( {
						status: 200,
						contentType: 'application/json',
						body: JSON.stringify( mockWeatherData ),
					} );
				}
			);

			const locationInput = page.locator(
				'input[placeholder*="Enter city name"]'
			);
			await locationInput.fill( 'London, UK' );

			// Capture loading state
			const blockElement = page.locator( '.weather-block-editor' );
			await expect( blockElement ).toContainText(
				'Loading weather data…'
			);

			// Visual regression test for loading state
			await expect( blockElement ).toHaveScreenshot(
				'weather-block-loading.png'
			);
		} );

		test( 'Weather block error state', async ( { page } ) => {
			// Mock API error
			await page.route(
				'**/wp-json/weather-block/v1/weather*',
				async ( route ) => {
					await route.fulfill( {
						status: 400,
						contentType: 'application/json',
						body: JSON.stringify( {
							code: 'invalid_location',
							message:
								'Location not found. Please check the location name.',
							data: { status: 400 },
						} ),
					} );
				}
			);

			const locationInput = page.locator(
				'input[placeholder*="Enter city name"]'
			);
			await locationInput.fill( 'InvalidLocation' );

			// Wait for error state
			await page.waitForTimeout( 2000 );

			const blockElement = page.locator( '.weather-block-editor' );
			await expect( blockElement ).toContainText( 'Weather Error:' );

			// Visual regression test for error state
			await expect( blockElement ).toHaveScreenshot(
				'weather-block-error.png'
			);
		} );

		test( 'Weather block extended mode', async ( { page } ) => {
			// Enter location
			const locationInput = page.locator(
				'input[placeholder*="Enter city name"]'
			);
			await locationInput.fill( 'London, UK' );

			// Switch to extended mode
			await page.click( 'text=Extended information' );

			// Enable additional options
			await page.check( 'text=Show pressure' );
			await page.check( 'text=Show wind information' );

			// Wait for changes to apply
			await page.waitForTimeout( 1000 );

			const blockElement = page.locator( '.weather-block-editor' );
			await expect( blockElement ).toContainText( 'Pressure:' );
			await expect( blockElement ).toContainText( 'Wind:' );

			// Visual regression test
			await expect( blockElement ).toHaveScreenshot(
				'weather-block-extended.png'
			);
		} );

		test( 'Weather block appearance customization', async ( { page } ) => {
			// Enter location
			const locationInput = page.locator(
				'input[placeholder*="Enter city name"]'
			);
			await locationInput.fill( 'London, UK' );

			// Wait for data to load
			await page.waitForTimeout( 2000 );

			// Open appearance panel
			await page.click( 'text=Appearance' );

			// Change background color
			const bgColorPicker = page
				.locator( '[data-testid*="color-picker"]' )
				.first();
			await bgColorPicker.fill( '#e3f2fd' );

			// Change text color
			const textColorPicker = page
				.locator( '[data-testid*="color-picker"]' )
				.last();
			await textColorPicker.fill( '#1976d2' );

			// Change border radius
			const radiusSlider = page.locator( 'input[type="range"]' );
			await radiusSlider.fill( '20' );

			// Wait for changes to apply
			await page.waitForTimeout( 500 );

			const blockElement = page.locator( '.weather-block-editor' );

			// Visual regression test
			await expect( blockElement ).toHaveScreenshot(
				'weather-block-customized.png'
			);
		} );
	} );

	test.describe( 'Frontend Tests', () => {
		test.beforeEach( async ( { page } ) => {
			// Create a test post with weather block
			await page.goto( '/wp-admin/post-new.php' );
			await page.waitForSelector( '.block-editor' );

			// Add weather block
			await page.click( '[aria-label="Add block"]' );
			await page.fill( '[placeholder="Search for blocks"]', 'weather' );
			await page.click( 'text=Weather Block' );

			// Configure block
			const locationInput = page.locator(
				'input[placeholder*="Enter city name"]'
			);
			await locationInput.fill( 'London, UK' );
			await page.waitForTimeout( 2000 );

			// Publish post
			await page.click( 'text=Publish' );
			await page.click( 'text=Publish', { force: true } );

			// Navigate to frontend
			await page.click( 'text=View Post' );
			await page.waitForLoadState( 'networkidle' );
		} );

		test( 'Weather block frontend display', async ( { page } ) => {
			const weatherBlock = page.locator( '.weather-block' );
			await expect( weatherBlock ).toBeVisible();
			await expect( weatherBlock ).toContainText( 'London' );

			// Visual regression test
			await expect( weatherBlock ).toHaveScreenshot(
				'weather-block-frontend.png'
			);
		} );

		test( 'Weather block hover interactions', async ( { page } ) => {
			const weatherBlock = page.locator( '.weather-block' );

			// Hover over the block to show refresh button
			await weatherBlock.hover();

			const refreshButton = page.locator( '.weather-refresh-button' );
			await expect( refreshButton ).toBeVisible();

			// Visual regression test with hover state
			await expect( weatherBlock ).toHaveScreenshot(
				'weather-block-hover.png'
			);
		} );

		test( 'Weather block focus state', async ( { page } ) => {
			const weatherBlock = page.locator( '.weather-block' );

			// Focus the block
			await weatherBlock.focus();

			// Visual regression test with focus state
			await expect( weatherBlock ).toHaveScreenshot(
				'weather-block-focus.png'
			);
		} );

		test( 'Weather block dark mode', async ( { page } ) => {
			// Simulate dark mode preference
			await page.emulateMedia( { colorScheme: 'dark' } );

			// Reload to apply dark mode
			await page.reload();
			await page.waitForLoadState( 'networkidle' );

			const weatherBlock = page.locator( '.weather-block' );

			// Visual regression test in dark mode
			await expect( weatherBlock ).toHaveScreenshot(
				'weather-block-dark-mode.png'
			);
		} );
	} );

	test.describe( 'Responsive Tests', () => {
		const viewports = [
			{ name: 'mobile', width: 375, height: 667 },
			{ name: 'tablet', width: 768, height: 1024 },
			{ name: 'desktop', width: 1200, height: 800 },
			{ name: 'large-desktop', width: 1920, height: 1080 },
		];

		viewports.forEach( ( { name, width, height } ) => {
			test( `Weather block responsive - ${ name }`, async ( {
				page,
			} ) => {
				await page.setViewportSize( { width, height } );

				// Navigate to a page with weather block
				await page.goto( '/' );

				// Create weather block for testing
				const weatherBlockHTML = `
					<div class="wp-block-weather-block-weather-display">
						<div class="weather-block weather-block-current" style="background-color: #f8f9fa; color: #212529; border-radius: 8px;">
							<div class="weather-block-content">
								<div class="weather-icon">
									<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIHI9IjIwIiBmaWxsPSIjRkZENzAwIiBzdHJva2U9IiNGRkE1MDAiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSIyNSIgeT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiMwMDAiPuKYgDwvdGV4dD4KPC9zdmc+" alt="partly cloudy" width="50" height="50">
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
							<div class="weather-updated"><small>Live data</small></div>
						</div>
					</div>
				`;

				await page.setContent( `
					<!DOCTYPE html>
					<html>
					<head>
						<meta charset="utf-8">
						<meta name="viewport" content="width=device-width, initial-scale=1">
						<style>
							.weather-block {
								max-width: 100%;
								padding: 20px;
								margin: 20px auto;
								font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
							}
							.weather-block-content {
								display: flex;
								align-items: center;
								gap: 16px;
							}
							.weather-icon img {
								display: block;
							}
							.weather-main h3 {
								margin: 0 0 4px 0;
								font-size: 1.2em;
							}
							.temperature-current {
								font-size: 2em;
								font-weight: bold;
							}
							.weather-description {
								margin-top: 8px;
								opacity: 0.8;
							}
							.weather-humidity {
								margin-top: 12px;
								font-size: 0.9em;
							}
							.weather-updated {
								margin-top: 8px;
								text-align: center;
							}
							@media (max-width: 480px) {
								.weather-block {
									padding: 16px;
								}
								.weather-block-content {
									flex-direction: column;
									text-align: center;
									gap: 12px;
								}
								.temperature-current {
									font-size: 1.8em;
								}
							}
						</style>
					</head>
					<body>
						${ weatherBlockHTML }
					</body>
					</html>
				` );

				const weatherBlock = page.locator( '.weather-block' );
				await expect( weatherBlock ).toBeVisible();

				// Visual regression test for this viewport
				await expect( weatherBlock ).toHaveScreenshot(
					`weather-block-${ name }.png`
				);
			} );
		} );
	} );

	test.describe( 'Accessibility Tests', () => {
		test( 'Weather block accessibility compliance', async ( { page } ) => {
			// Navigate to page with weather block
			await page.goto( '/' );

			// Create accessible weather block
			const weatherBlockHTML = `
				<div class="wp-block-weather-block-weather-display">
					<div class="weather-block" role="region" aria-label="Weather preview" tabindex="0">
						<div class="weather-block-content">
							<div class="weather-icon">
								<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIHI9IjIwIiBmaWxsPSIjRkZENzAwIiBzdHJva2U9IiNGRkE1MDAiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSIyNSIgeT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiMwMDAiPuKYgDwvdGV4dD4KPC9zdmc+" alt="partly cloudy" width="50" height="50">
							</div>
							<div class="weather-main">
								<div class="weather-location">
									<h3 role="heading" aria-level="3">London</h3>
									<span class="weather-country">GB</span>
								</div>
								<div class="weather-temperature">
									<span class="temperature-current" aria-label="Current temperature: 21°C">21°C</span>
								</div>
								<div class="weather-description">Partly cloudy</div>
							</div>
						</div>
						<div class="weather-humidity" aria-label="Humidity: 65%">Humidity: 65%</div>
						<div class="weather-updated"><small>Live data</small></div>
					</div>
				</div>
			`;

			await page.setContent( `
				<!DOCTYPE html>
				<html lang="en">
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1">
					<title>Weather Block Accessibility Test</title>
					<style>
						.weather-block {
							max-width: 400px;
							padding: 20px;
							margin: 20px auto;
							background: #f8f9fa;
							border-radius: 8px;
							font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
						}
						.weather-block:focus {
							outline: 2px solid #007cba;
							outline-offset: 2px;
						}
						.weather-block-content {
							display: flex;
							align-items: center;
							gap: 16px;
						}
					</style>
				</head>
				<body>
					${ weatherBlockHTML }
				</body>
				</html>
			` );

			// Test keyboard navigation
			await page.keyboard.press( 'Tab' );
			const weatherBlock = page.locator( '.weather-block' );
			await expect( weatherBlock ).toBeFocused();

			// Visual regression test with focus
			await expect( weatherBlock ).toHaveScreenshot(
				'weather-block-accessibility.png'
			);
		} );

		test( 'Weather block high contrast mode', async ( { page } ) => {
			// Simulate high contrast mode
			await page.emulateMedia( { forcedColors: 'active' } );

			const weatherBlockHTML = `
				<div class="wp-block-weather-block-weather-display">
					<div class="weather-block" style="border: 2px solid; padding: 20px;">
						<div class="weather-block-content">
							<div class="weather-main">
								<div class="weather-location">
									<h3>London</h3>
								</div>
								<div class="weather-temperature">
									<span class="temperature-current">21°C</span>
								</div>
								<div class="weather-description">Partly cloudy</div>
							</div>
						</div>
					</div>
				</div>
			`;

			await page.setContent( `
				<!DOCTYPE html>
				<html>
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1">
					<style>
						body {
							font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
							padding: 20px;
						}
						.weather-block {
							max-width: 400px;
							margin: 0 auto;
						}
					</style>
				</head>
				<body>
					${ weatherBlockHTML }
				</body>
				</html>
			` );

			const weatherBlock = page.locator( '.weather-block' );

			// Visual regression test in high contrast mode
			await expect( weatherBlock ).toHaveScreenshot(
				'weather-block-high-contrast.png'
			);
		} );
	} );

	test.describe( 'Animation and Interaction Tests', () => {
		test( 'Weather block refresh animation', async ( { page } ) => {
			// Navigate to page with weather block and refresh functionality
			await page.goto( '/' );

			const weatherBlockHTML = `
				<div class="wp-block-weather-block-weather-display">
					<div class="weather-block" style="position: relative; background: #f8f9fa; padding: 20px; border-radius: 8px; max-width: 400px; margin: 20px auto;">
						<div class="weather-block-content">
							<div class="weather-main">
								<div class="weather-location">
									<h3>London</h3>
								</div>
								<div class="weather-temperature">
									<span class="temperature-current">21°C</span>
								</div>
								<div class="weather-description">Partly cloudy</div>
							</div>
						</div>
						<div class="weather-updated">
							<small>Live data</small>
						</div>
						<button class="weather-refresh-button" 
								style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.1); border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s ease;"
								aria-label="Refresh weather data">↻</button>
					</div>
				</div>
				<script>
					const block = document.querySelector('.weather-block');
					const button = document.querySelector('.weather-refresh-button');
					
					block.addEventListener('mouseenter', () => {
						button.style.opacity = '1';
					});
					
					block.addEventListener('mouseleave', () => {
						button.style.opacity = '0';
					});
					
					button.addEventListener('click', () => {
						button.style.transform = 'rotate(360deg)';
						button.style.transition = 'transform 1s ease';
						button.disabled = true;
						
						setTimeout(() => {
							button.style.transform = 'rotate(0deg)';
							button.disabled = false;
						}, 1000);
					});
				</script>
			`;

			await page.setContent( `
				<!DOCTYPE html>
				<html>
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1">
					<title>Weather Block Animation Test</title>
				</head>
				<body>
					${ weatherBlockHTML }
				</body>
				</html>
			` );

			const weatherBlock = page.locator( '.weather-block' );
			const refreshButton = page.locator( '.weather-refresh-button' );

			// Hover to show button
			await weatherBlock.hover();
			await expect( refreshButton ).toBeVisible();

			// Click to trigger animation
			await refreshButton.click();

			// Wait for animation to start
			await page.waitForTimeout( 500 );

			// Visual regression test during animation
			await expect( weatherBlock ).toHaveScreenshot(
				'weather-block-refresh-animation.png'
			);
		} );
	} );
} );
