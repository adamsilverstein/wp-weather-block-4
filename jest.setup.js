/**
 * Jest setup file for global test configuration
 */

// Global test setup
beforeEach( () => {
	// Clear any DOM elements between tests
	document.body.innerHTML = '';

	// Clear localStorage and sessionStorage
	if ( typeof localStorage !== 'undefined' ) {
		localStorage.clear();
	}
	if ( typeof sessionStorage !== 'undefined' ) {
		sessionStorage.clear();
	}

	// Reset any global variables
	delete window.wp;
	delete window.weatherBlockAdmin;
} );

// Mock WordPress global objects
global.wp = {
	data: {
		select: jest.fn(),
		dispatch: jest.fn(),
	},
	blocks: {
		registerBlockType: jest.fn(),
	},
	element: {
		createElement: require( 'react' ).createElement,
		Fragment: require( 'react' ).Fragment,
		useState: require( 'react' ).useState,
		useEffect: require( 'react' ).useEffect,
	},
	components: {},
	blockEditor: {},
	i18n: {
		__: ( text ) => text,
		_e: ( text ) => text,
		_n: ( single, plural, number ) => ( number === 1 ? single : plural ),
		sprintf: ( format, ...args ) => {
			let index = 0;
			return format.replace( /%[sd%]/g, ( match ) => {
				if ( match === '%%' ) {
					return '%';
				}
				return args[ index++ ] || '';
			} );
		},
	},
};

// Mock global fetch
global.fetch = jest.fn();

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
	observe = jest.fn();
	disconnect = jest.fn();
	unobserve = jest.fn();
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
	constructor( callback ) {
		this.callback = callback;
	}
	observe = jest.fn();
	disconnect = jest.fn();
	unobserve = jest.fn();
};

// Mock matchMedia
Object.defineProperty( window, 'matchMedia', {
	writable: true,
	value: jest.fn().mockImplementation( ( query ) => ( {
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(),
		removeListener: jest.fn(),
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	} ) ),
} );

// Mock scrollTo
Object.defineProperty( window, 'scrollTo', {
	writable: true,
	value: jest.fn(),
} );

// Suppress console warnings during tests unless needed
const originalWarn = console.warn;
const originalError = console.error;

beforeAll( () => {
	console.warn = jest.fn();
	console.error = jest.fn();
} );

afterAll( () => {
	console.warn = originalWarn;
	console.error = originalError;
} );

// Handle unhandled promise rejections
process.on( 'unhandledRejection', ( reason, promise ) => {
	console.error( 'Unhandled Rejection at:', promise, 'reason:', reason );
} );
