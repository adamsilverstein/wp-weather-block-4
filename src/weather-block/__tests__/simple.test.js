/**
 * @jest-environment jsdom
 */

/**
 * Simple tests to ensure basic functionality works
 */

describe( 'Weather Block Basic Tests', () => {
	describe( 'Save Function', () => {
		test( 'save function returns null for server-side rendering', () => {
			const save = require( '../save' ).default;
			expect( save() ).toBeNull();
		} );
	} );

	describe( 'Block Registration', () => {
		test( 'index.js can be required without errors', () => {
			expect( () => {
				jest.mock( '@wordpress/blocks', () => ( {
					registerBlockType: jest.fn(),
				} ) );
				jest.mock( '../style.scss', () => ( {} ) );
				require( '../index.js' );
			} ).not.toThrow();
		} );
	} );

	describe( 'View Script', () => {
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

			// Mock console.log
			console.log = jest.fn();

			// Mock ResizeObserver
			global.ResizeObserver = class ResizeObserver {
				constructor( callback ) {
					this.callback = callback;
				}
				observe() {}
				unobserve() {}
				disconnect() {}
			};

			// Mock matchMedia
			Object.defineProperty( window, 'matchMedia', {
				writable: true,
				value: jest.fn().mockImplementation( ( query ) => ( {
					matches: false,
					media: query,
					addEventListener: jest.fn(),
					removeEventListener: jest.fn(),
				} ) ),
			} );

			// Clear require cache
			delete require.cache[ require.resolve( '../view.js' ) ];
		} );

		afterEach( () => {
			delete window.initWeatherBlocks;
		} );

		test( 'view script loads without errors', () => {
			expect( () => {
				require( '../view.js' );
			} ).not.toThrow();
		} );

		test( 'view script exposes initWeatherBlocks function', () => {
			require( '../view.js' );
			expect( typeof window.initWeatherBlocks ).toBe( 'function' );
		} );

		test( 'initWeatherBlocks runs without errors', () => {
			require( '../view.js' );
			expect( () => {
				window.initWeatherBlocks();
			} ).not.toThrow();
		} );

		test( 'adds refresh button to weather blocks', () => {
			require( '../view.js' );
			window.initWeatherBlocks();

			const refreshButton = mockBlock.querySelector(
				'.weather-refresh-button'
			);
			expect( refreshButton ).toBeTruthy();
			expect( refreshButton.getAttribute( 'aria-label' ) ).toBe(
				'Refresh weather data'
			);
		} );

		test( 'makes weather blocks focusable', () => {
			require( '../view.js' );
			window.initWeatherBlocks();

			expect( mockBlock.getAttribute( 'tabindex' ) ).toBe( '0' );
		} );

		test( 'adds accessibility enhancements', () => {
			const tempElement = document.createElement( 'span' );
			tempElement.className = 'temperature-current';
			tempElement.textContent = '20°C';
			mockBlock.appendChild( tempElement );

			require( '../view.js' );
			window.initWeatherBlocks();

			expect( tempElement.hasAttribute( 'aria-label' ) ).toBe( true );
			expect( tempElement.getAttribute( 'aria-label' ) ).toContain(
				'Current temperature'
			);
		} );

		test( 'handles blocks without errors or placeholders', () => {
			require( '../view.js' );
			window.initWeatherBlocks();

			// Should add refresh button to normal blocks
			const refreshButton = mockBlock.querySelector(
				'.weather-refresh-button'
			);
			expect( refreshButton ).toBeTruthy();
		} );

		test( 'skips refresh button for error blocks', () => {
			mockBlock.classList.add( 'weather-block-error' );

			require( '../view.js' );
			window.initWeatherBlocks();

			const refreshButton = mockBlock.querySelector(
				'.weather-refresh-button'
			);
			expect( refreshButton ).toBeNull();
		} );

		test( 'skips refresh button for placeholder blocks', () => {
			mockBlock.classList.add( 'weather-block-placeholder' );

			require( '../view.js' );
			window.initWeatherBlocks();

			const refreshButton = mockBlock.querySelector(
				'.weather-refresh-button'
			);
			expect( refreshButton ).toBeNull();
		} );

		test( 'handles refresh button interaction', () => {
			const updatedElement = document.createElement( 'div' );
			updatedElement.className = 'weather-updated';
			const smallElement = document.createElement( 'small' );
			smallElement.textContent = 'Live data';
			updatedElement.appendChild( smallElement );
			mockBlock.appendChild( updatedElement );

			require( '../view.js' );
			window.initWeatherBlocks();

			const refreshButton = mockBlock.querySelector(
				'.weather-refresh-button'
			);
			refreshButton.click();

			expect( refreshButton.disabled ).toBe( true );
			expect( smallElement.textContent ).toBe( 'Refreshing...' );
		} );

		test( 'handles hover events on refresh button', () => {
			require( '../view.js' );
			window.initWeatherBlocks();

			const refreshButton = mockBlock.querySelector(
				'.weather-refresh-button'
			);

			// Initially hidden
			expect( refreshButton.style.opacity ).toBe( '0' );

			// Show on mouseenter
			mockBlock.dispatchEvent( new Event( 'mouseenter' ) );
			expect( refreshButton.style.opacity ).toBe( '1' );

			// Hide on mouseleave
			mockBlock.dispatchEvent( new Event( 'mouseleave' ) );
			expect( refreshButton.style.opacity ).toBe( '0' );
		} );

		test( 'processes multiple weather blocks', () => {
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

			// Both blocks should be enhanced
			expect( mockBlock.getAttribute( 'tabindex' ) ).toBe( '0' );
			expect( secondBlock.getAttribute( 'tabindex' ) ).toBe( '0' );

			expect(
				mockBlock.querySelector( '.weather-refresh-button' )
			).toBeTruthy();
			expect(
				secondBlock.querySelector( '.weather-refresh-button' )
			).toBeTruthy();
		} );
	} );

	describe( 'Edit Component Placeholder', () => {
		test( 'edit component is a function', () => {
			// Mock the dependencies
			jest.mock( '@wordpress/i18n', () => ( {
				__: ( text ) => text,
			} ) );

			jest.mock( '@wordpress/block-editor', () => ( {
				useBlockProps: () => ( { className: 'weather-block-editor' } ),
				InspectorControls: ( { children } ) => children,
				BlockControls: ( { children } ) => children,
			} ) );

			jest.mock( '@wordpress/components', () => ( {
				PanelBody: ( { children } ) => children,
				TextControl: () => null,
				SelectControl: () => null,
				RadioControl: () => null,
				ToggleControl: () => null,
				Notice: () => null,
				Spinner: () => null,
				Button: () => null,
				ButtonGroup: ( { children } ) => children,
				ColorPicker: () => null,
				RangeControl: () => null,
			} ) );

			const Edit = require( '../edit' ).default;
			expect( typeof Edit ).toBe( 'function' );
		} );
	} );
} );
