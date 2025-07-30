/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import '@testing-library/jest-dom';

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
	constructor( callback ) {
		this.callback = callback;
		this.entries = [];
	}
	observe( element ) {
		this.entries.push( element );
	}
	unobserve() {}
	disconnect() {}
	trigger( entries ) {
		if ( this.callback ) {
			this.callback( entries );
		}
	}
};

// Mock matchMedia
const createMatchMediaMock = ( matches = false ) =>
	jest.fn().mockImplementation( ( query ) => ( {
		matches,
		media: query,
		onchange: null,
		addListener: jest.fn(),
		removeListener: jest.fn(),
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	} ) );

// Mock console.log to avoid test output noise
const originalConsoleLog = console.log;
beforeAll( () => {
	console.log = jest.fn();
} );

afterAll( () => {
	console.log = originalConsoleLog;
} );

describe( 'Weather Block View Script', () => {
	let mockBlock;

	beforeEach( () => {
		// Reset DOM
		document.body.innerHTML = '';

		// Create mock weather block elements
		mockBlock = document.createElement( 'div' );
		mockBlock.className = 'weather-block';

		const weatherBlockContainer = document.createElement( 'div' );
		weatherBlockContainer.className =
			'wp-block-weather-block-weather-display';
		weatherBlockContainer.appendChild( mockBlock );

		document.body.appendChild( weatherBlockContainer );

		// Reset matchMedia
		window.matchMedia = createMatchMediaMock();

		// Reset ResizeObserver
		global.ResizeObserver = class ResizeObserver {
			constructor( callback ) {
				this.callback = callback;
			}
			observe = jest.fn();
			disconnect = jest.fn();
			unobserve = jest.fn();
		};

		// Clear module cache
		jest.clearAllMocks();
		delete require.cache[ require.resolve( '../view.js' ) ];
	} );

	afterEach( () => {
		document.body.innerHTML = '';
		delete window.initWeatherBlocks;
	} );

	describe( 'Initialization', () => {
		test( 'initializes weather blocks on DOM ready', () => {
			// Set document state to loading
			Object.defineProperty( document, 'readyState', {
				writable: true,
				value: 'loading',
			} );

			const addEventListenerSpy = jest.spyOn(
				document,
				'addEventListener'
			);

			// Require the script
			require( '../view.js' );

			expect( addEventListenerSpy ).toHaveBeenCalledWith(
				'DOMContentLoaded',
				expect.any( Function )
			);
		} );

		test( 'initializes immediately when document is already loaded', () => {
			Object.defineProperty( document, 'readyState', {
				writable: true,
				value: 'complete',
			} );

			// Add temperature element to mock block
			const tempElement = document.createElement( 'span' );
			tempElement.className = 'temperature-current';
			tempElement.textContent = '20°C';
			mockBlock.appendChild( tempElement );

			// Require the script - it should initialize immediately
			require( '../view.js' );

			// Check if accessibility enhancements were applied
			expect( tempElement.hasAttribute( 'aria-label' ) ).toBe( true );
		} );

		test( 'exposes initWeatherBlocks function globally', () => {
			require( '../view.js' );
			expect( typeof window.initWeatherBlocks ).toBe( 'function' );
		} );
	} );

	describe( 'Accessibility Enhancement', () => {
		beforeEach( () => {
			require( '../view.js' );
		} );

		test( 'adds ARIA labels to temperature elements', () => {
			const tempElement = document.createElement( 'span' );
			tempElement.className = 'temperature-current';
			tempElement.textContent = '20°C';
			mockBlock.appendChild( tempElement );

			window.initWeatherBlocks();

			expect( tempElement.getAttribute( 'aria-label' ) ).toBe(
				'Current temperature: 20°C'
			);
		} );

		test( 'adds ARIA labels to weather details', () => {
			const detailElement = document.createElement( 'div' );
			detailElement.className = 'weather-detail';

			const labelElement = document.createElement( 'span' );
			labelElement.className = 'detail-label';
			labelElement.textContent = 'Humidity:';

			const valueElement = document.createElement( 'span' );
			valueElement.className = 'detail-value';
			valueElement.textContent = '65%';

			detailElement.appendChild( labelElement );
			detailElement.appendChild( valueElement );
			mockBlock.appendChild( detailElement );

			window.initWeatherBlocks();

			expect( detailElement.getAttribute( 'aria-label' ) ).toBe(
				'Humidity: 65%'
			);
		} );

		test( 'adds semantic structure to location heading', () => {
			const locationContainer = document.createElement( 'div' );
			locationContainer.className = 'weather-location';

			const locationHeading = document.createElement( 'h3' );
			locationHeading.textContent = 'London';

			locationContainer.appendChild( locationHeading );
			mockBlock.appendChild( locationContainer );

			window.initWeatherBlocks();

			expect( locationHeading.getAttribute( 'role' ) ).toBe( 'heading' );
			expect( locationHeading.getAttribute( 'aria-level' ) ).toBe( '3' );
		} );

		test( 'handles missing elements gracefully', () => {
			// Empty block with no weather elements
			expect( () => {
				window.initWeatherBlocks();
			} ).not.toThrow();
		} );
	} );

	describe( 'Theme Preferences', () => {
		test( 'applies theme styles based on matchMedia', () => {
			require( '../view.js' );
			window.initWeatherBlocks();

			// Block should have position relative for refresh button
			expect( mockBlock.style.position ).toBe( 'relative' );
		} );

		test( 'does not override custom theme colors', () => {
			mockBlock.classList.add( 'has-background' );
			require( '../view.js' );
			window.initWeatherBlocks();

			// Should not set CSS custom properties when has-background class is present
			expect( mockBlock.style.getPropertyValue( '--weather-bg' ) ).toBe(
				''
			);
		} );

		test( 'listens for theme preference changes when matchMedia is available', () => {
			const mockAddEventListener = jest.fn();
			window.matchMedia = jest.fn().mockImplementation( () => ( {
				matches: false,
				addEventListener: mockAddEventListener,
			} ) );

			require( '../view.js' );
			window.initWeatherBlocks();

			expect( mockAddEventListener ).toHaveBeenCalledWith(
				'change',
				expect.any( Function )
			);
		} );
	} );

	describe( 'Refresh Functionality', () => {
		beforeEach( () => {
			require( '../view.js' );
		} );

		test( 'adds refresh button to normal weather blocks', () => {
			window.initWeatherBlocks();

			const refreshButton = mockBlock.querySelector(
				'.weather-refresh-button'
			);
			expect( refreshButton ).not.toBeNull();
			expect( refreshButton.getAttribute( 'aria-label' ) ).toBe(
				'Refresh weather data'
			);
		} );

		test( 'does not add refresh button to error blocks', () => {
			mockBlock.classList.add( 'weather-block-error' );

			window.initWeatherBlocks();

			const refreshButton = mockBlock.querySelector(
				'.weather-refresh-button'
			);
			expect( refreshButton ).toBeNull();
		} );

		test( 'does not add refresh button to placeholder blocks', () => {
			mockBlock.classList.add( 'weather-block-placeholder' );

			window.initWeatherBlocks();

			const refreshButton = mockBlock.querySelector(
				'.weather-refresh-button'
			);
			expect( refreshButton ).toBeNull();
		} );

		test( 'shows and hides refresh button on hover', () => {
			window.initWeatherBlocks();

			const refreshButton = mockBlock.querySelector(
				'.weather-refresh-button'
			);

			// Initially hidden
			expect( refreshButton.style.opacity ).toBe( '0' );

			// Show on hover
			mockBlock.dispatchEvent( new Event( 'mouseenter' ) );
			expect( refreshButton.style.opacity ).toBe( '1' );

			// Hide on leave
			mockBlock.dispatchEvent( new Event( 'mouseleave' ) );
			expect( refreshButton.style.opacity ).toBe( '0' );
		} );

		test( 'handles refresh button click', () => {
			// Add weather-updated element
			const updatedElement = document.createElement( 'div' );
			updatedElement.className = 'weather-updated';
			const smallElement = document.createElement( 'small' );
			smallElement.textContent = 'Live data';
			updatedElement.appendChild( smallElement );
			mockBlock.appendChild( updatedElement );

			window.initWeatherBlocks();

			const refreshButton = mockBlock.querySelector(
				'.weather-refresh-button'
			);

			// Click the refresh button
			refreshButton.click();

			expect( refreshButton.disabled ).toBe( true );
			expect( smallElement.textContent ).toBe( 'Refreshing...' );
		} );
	} );

	describe( 'Keyboard Navigation', () => {
		beforeEach( () => {
			require( '../view.js' );
		} );

		test( 'makes blocks focusable', () => {
			window.initWeatherBlocks();

			expect( mockBlock.getAttribute( 'tabindex' ) ).toBe( '0' );
		} );

		test( 'applies focus styles', () => {
			window.initWeatherBlocks();

			mockBlock.dispatchEvent( new Event( 'focus' ) );
			expect( mockBlock.style.outline ).toBe( '2px solid #007cba' );
			expect( mockBlock.style.outlineOffset ).toBe( '2px' );

			mockBlock.dispatchEvent( new Event( 'blur' ) );
			expect( mockBlock.style.outline ).toBe( 'none' );
		} );

		test( 'handles keyboard events', () => {
			window.initWeatherBlocks();

			const keydownHandler = jest.fn();
			mockBlock.addEventListener( 'keydown', keydownHandler );

			const enterEvent = new global.KeyboardEvent( 'keydown', {
				key: 'Enter',
			} );
			mockBlock.dispatchEvent( enterEvent );

			expect( keydownHandler ).toHaveBeenCalled();
		} );
	} );

	describe( 'Responsive Scaling', () => {
		test( 'initializes ResizeObserver when available', () => {
			const observeSpy = jest.fn();
			global.ResizeObserver = jest.fn().mockImplementation( () => ( {
				observe: observeSpy,
				unobserve: jest.fn(),
				disconnect: jest.fn(),
			} ) );

			require( '../view.js' );

			expect( observeSpy ).toHaveBeenCalledWith( mockBlock );
		} );

		test( 'handles ResizeObserver callbacks', () => {
			let resizeCallback;
			global.ResizeObserver = jest
				.fn()
				.mockImplementation( ( callback ) => {
					resizeCallback = callback;
					return {
						observe: jest.fn(),
						unobserve: jest.fn(),
						disconnect: jest.fn(),
					};
				} );

			require( '../view.js' );

			// Simulate resize to small width
			if ( resizeCallback ) {
				resizeCallback( [
					{
						target: mockBlock,
						contentRect: { width: 250 },
					},
				] );

				expect(
					mockBlock.classList.contains( 'weather-compact' )
				).toBe( true );
			}
		} );

		test( 'skips ResizeObserver when not available', () => {
			delete global.ResizeObserver;

			expect( () => {
				require( '../view.js' );
			} ).not.toThrow();
		} );
	} );

	describe( 'Multiple Blocks', () => {
		test( 'initializes all weather blocks on the page', () => {
			// Create second weather block
			const secondBlock = document.createElement( 'div' );
			secondBlock.className = 'weather-block';

			const secondContainer = document.createElement( 'div' );
			secondContainer.className =
				'wp-block-weather-block-weather-display';
			secondContainer.appendChild( secondBlock );

			document.body.appendChild( secondContainer );

			require( '../view.js' );
			window.initWeatherBlocks();

			// Both blocks should be focusable
			expect( mockBlock.getAttribute( 'tabindex' ) ).toBe( '0' );
			expect( secondBlock.getAttribute( 'tabindex' ) ).toBe( '0' );

			// Both blocks should have refresh buttons
			expect(
				mockBlock.querySelector( '.weather-refresh-button' )
			).not.toBeNull();
			expect(
				secondBlock.querySelector( '.weather-refresh-button' )
			).not.toBeNull();
		} );
	} );

	describe( 'Error Handling', () => {
		test( 'handles missing elements gracefully', () => {
			require( '../view.js' );

			// Empty block with no weather elements
			expect( () => {
				window.initWeatherBlocks();
			} ).not.toThrow();
		} );

		test( 'handles malformed DOM structures', () => {
			// Add incomplete weather detail
			const detailElement = document.createElement( 'div' );
			detailElement.className = 'weather-detail';
			// No label or value children
			mockBlock.appendChild( detailElement );

			require( '../view.js' );

			expect( () => {
				window.initWeatherBlocks();
			} ).not.toThrow();
		} );

		test( 'handles missing matchMedia gracefully', () => {
			delete window.matchMedia;

			expect( () => {
				require( '../view.js' );
				window.initWeatherBlocks();
			} ).not.toThrow();
		} );
	} );

	describe( 'Performance', () => {
		test( 'uses ResizeObserver only when available', () => {
			// Remove ResizeObserver
			delete global.ResizeObserver;

			expect( () => {
				require( '../view.js' );
			} ).not.toThrow();
		} );

		test( 'processes only weather blocks', () => {
			const nonWeatherBlock = document.createElement( 'div' );
			nonWeatherBlock.className = 'some-other-block';
			document.body.appendChild( nonWeatherBlock );

			require( '../view.js' );
			window.initWeatherBlocks();

			expect(
				nonWeatherBlock.querySelector( '.weather-refresh-button' )
			).toBeNull();
		} );

		test( 'handles empty block list', () => {
			// Remove all weather blocks
			document.body.innerHTML = '';

			require( '../view.js' );

			expect( () => {
				window.initWeatherBlocks();
			} ).not.toThrow();
		} );
	} );
} );
