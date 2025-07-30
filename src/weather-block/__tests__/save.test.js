/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import save from '../save';

describe( 'Save Component', () => {
	test( 'returns null for server-side rendering', () => {
		const result = save();
		expect( result ).toBeNull();
	} );

	test( 'is a function', () => {
		expect( typeof save ).toBe( 'function' );
	} );

	test( 'does not throw when called', () => {
		expect( () => save() ).not.toThrow();
	} );

	test( 'returns null consistently', () => {
		const result1 = save();
		const result2 = save();
		expect( result1 ).toBe( result2 );
		expect( result1 ).toBeNull();
	} );
} );
