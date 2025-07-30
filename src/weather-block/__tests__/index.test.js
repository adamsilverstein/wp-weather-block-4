/**
 * @jest-environment jsdom
 */

/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';

// Mock WordPress dependencies
jest.mock( '@wordpress/blocks', () => ( {
	registerBlockType: jest.fn(),
} ) );

// Mock CSS imports
jest.mock( '../style.scss', () => ( {} ) );

// Mock the components
jest.mock( '../edit', () => {
	return jest.fn( () => 'MockedEditComponent' );
} );

jest.mock( '../save', () => {
	return jest.fn( () => null );
} );

// Mock block.json
jest.mock( '../block.json', () => ( {
	name: 'weather-block/weather-display',
	title: 'Weather Block',
	category: 'widgets',
	attributes: {
		location: {
			type: 'string',
			default: '',
		},
	},
} ) );

const mockRegisterBlockType = registerBlockType;

describe( 'Block Registration', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'registers the block type', () => {
		// Import the index file to trigger registration
		require( '../index.js' );

		expect( mockRegisterBlockType ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'registers with correct block name from metadata', () => {
		require( '../index.js' );

		const [ blockName ] = mockRegisterBlockType.mock.calls[ 0 ];
		expect( blockName ).toBe( 'weather-block/weather-display' );
	} );

	test( 'registers with edit and save functions', () => {
		require( '../index.js' );

		const [ , blockSettings ] = mockRegisterBlockType.mock.calls[ 0 ];
		expect( blockSettings ).toHaveProperty( 'edit' );
		expect( blockSettings ).toHaveProperty( 'save' );
	} );

	test( 'edit function is the imported Edit component', () => {
		const Edit = require( '../edit' ).default;
		require( '../index.js' );

		const [ , blockSettings ] = mockRegisterBlockType.mock.calls[ 0 ];
		expect( blockSettings.edit ).toBe( Edit );
	} );

	test( 'save function is the imported save function', () => {
		const save = require( '../save' ).default;
		require( '../index.js' );

		const [ , blockSettings ] = mockRegisterBlockType.mock.calls[ 0 ];
		expect( blockSettings.save ).toBe( save );
	} );

	test( 'imports required dependencies', () => {
		// This test ensures that all dependencies are importable without error
		expect( () => {
			require( '../index.js' );
		} ).not.toThrow();
	} );

	test( 'uses block metadata from block.json', () => {
		const metadata = require( '../block.json' );
		require( '../index.js' );

		const [ blockName ] = mockRegisterBlockType.mock.calls[ 0 ];
		expect( blockName ).toBe( metadata.name );
	} );
} );

describe( 'Module Exports', () => {
	test( 'does not export anything by default', () => {
		const indexModule = require( '../index.js' );
		expect( indexModule ).toEqual( {} );
	} );

	test( 'executes block registration on import', () => {
		// Clear require cache to ensure fresh import
		delete require.cache[ require.resolve( '../index.js' ) ];

		require( '../index.js' );

		expect( mockRegisterBlockType ).toHaveBeenCalled();
	} );
} );

describe( 'Side Effects', () => {
	test( 'imports CSS file', () => {
		// This is handled by the jest.mock above
		// The test ensures the CSS import doesn't cause errors
		expect( () => {
			require( '../index.js' );
		} ).not.toThrow();
	} );

	test( 'only registers block once per import', () => {
		// Clear mocks but keep the same module in cache
		mockRegisterBlockType.mockClear();

		// Import again - should not register again due to module caching
		require( '../index.js' );

		expect( mockRegisterBlockType ).not.toHaveBeenCalled();
	} );

	test( 'registers block immediately on module load', () => {
		// Clear require cache for fresh import
		delete require.cache[ require.resolve( '../index.js' ) ];

		// Mock should be called synchronously during import
		require( '../index.js' );

		expect( mockRegisterBlockType ).toHaveBeenCalledTimes( 1 );
	} );
} );
