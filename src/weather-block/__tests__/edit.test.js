/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import Edit from '../edit';

// Mock WordPress dependencies
jest.mock( '@wordpress/api-fetch' );
jest.mock( '@wordpress/i18n', () => ( {
	__: ( text ) => text,
} ) );

// Mock WordPress components
jest.mock( '@wordpress/block-editor', () => ( {
	useBlockProps: () => ( { className: 'weather-block-editor' } ),
	InspectorControls: ( { children } ) => (
		<div data-testid="inspector-controls">{ children }</div>
	),
	BlockControls: ( { children } ) => (
		<div data-testid="block-controls">{ children }</div>
	),
} ) );

jest.mock( '@wordpress/components', () => ( {
	PanelBody: ( { children, title } ) => (
		<div data-testid="panel-body" aria-label={ title }>
			{ children }
		</div>
	),
	TextControl: ( { label, value, onChange, placeholder, help } ) => (
		<div>
			<label>{ label }</label>
			<input
				data-testid="text-control"
				value={ value }
				onChange={ ( e ) => onChange( e.target.value ) }
				placeholder={ placeholder }
				aria-describedby={ help }
			/>
			{ help && <small>{ help }</small> }
		</div>
	),
	SelectControl: ( { label, value, options, onChange } ) => (
		<div>
			<label>{ label }</label>
			<select
				data-testid="select-control"
				value={ value }
				onChange={ ( e ) => onChange( e.target.value ) }
			>
				{ options.map( ( option ) => (
					<option key={ option.value } value={ option.value }>
						{ option.label }
					</option>
				) ) }
			</select>
		</div>
	),
	RadioControl: ( { label, selected, options, onChange } ) => (
		<div>
			<fieldset>
				<legend>{ label }</legend>
				{ options.map( ( option ) => (
					<label key={ option.value }>
						<input
							type="radio"
							name="radio-control"
							value={ option.value }
							checked={ selected === option.value }
							onChange={ () => onChange( option.value ) }
						/>
						{ option.label }
					</label>
				) ) }
			</fieldset>
		</div>
	),
	ToggleControl: ( { label, checked, onChange } ) => (
		<label>
			<input
				type="checkbox"
				data-testid="toggle-control"
				checked={ checked }
				onChange={ ( e ) => onChange( e.target.checked ) }
			/>
			{ label }
		</label>
	),
	Notice: ( { status, children, isDismissible } ) => (
		<div
			data-testid="notice"
			className={ `notice-${ status }` }
			data-dismissible={ isDismissible }
		>
			{ children }
		</div>
	),
	Spinner: () => <div data-testid="spinner">Loading...</div>,
	Button: ( { children, onClick, isPressed, variant, size } ) => (
		<button
			onClick={ onClick }
			data-pressed={ isPressed }
			data-variant={ variant }
			data-size={ size }
		>
			{ children }
		</button>
	),
	ButtonGroup: ( { children } ) => (
		<div data-testid="button-group">{ children }</div>
	),
	ColorPicker: ( { color, onChange, enableAlpha, defaultValue } ) => (
		<input
			type="color"
			data-testid="color-picker"
			value={ color }
			onChange={ ( e ) => onChange( e.target.value ) }
			data-alpha={ enableAlpha }
			data-default={ defaultValue }
		/>
	),
	RangeControl: ( {
		label,
		value,
		onChange,
		min,
		max,
		step,
		allowReset,
		resetFallbackValue,
	} ) => (
		<div>
			<label>{ label }</label>
			<input
				type="range"
				data-testid="range-control"
				value={ value }
				onChange={ ( e ) => onChange( parseInt( e.target.value, 10 ) ) }
				min={ min }
				max={ max }
				step={ step }
			/>
			{ allowReset && (
				<button onClick={ () => onChange( resetFallbackValue ) }>
					Reset
				</button>
			) }
		</div>
	),
} ) );

// Mock fetch implementation
const mockApiFetch = apiFetch;

// Default test props
const defaultProps = {
	attributes: {
		location: '',
		units: 'metric',
		displayMode: 'current',
		showHumidity: true,
		showPressure: false,
		showWind: false,
		showIcon: true,
		backgroundColor: '#f8f9fa',
		textColor: '#212529',
		borderRadius: 8,
	},
	setAttributes: jest.fn(),
};

// Mock weather data
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

describe( 'Edit Component', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockApiFetch.mockClear();
	} );

	describe( 'Rendering', () => {
		test( 'renders without crashing', () => {
			render( <Edit { ...defaultProps } /> );
			expect(
				screen.getByText( 'Weather Settings' )
			).toBeInTheDocument();
		} );

		test( 'renders all control panels', () => {
			render( <Edit { ...defaultProps } /> );

			expect(
				screen.getByText( 'Weather Settings' )
			).toBeInTheDocument();
			expect( screen.getByText( 'Display Options' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Appearance' ) ).toBeInTheDocument();
		} );

		test( 'renders block controls with display mode buttons', () => {
			render( <Edit { ...defaultProps } /> );

			expect( screen.getByText( 'Current' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Extended' ) ).toBeInTheDocument();
		} );

		test( 'renders placeholder when no location is provided', () => {
			render( <Edit { ...defaultProps } /> );

			expect(
				screen.getByText( 'Enter a location to preview weather data' )
			).toBeInTheDocument();
		} );
	} );

	describe( 'Location Input', () => {
		test( 'updates location attribute on input change', async () => {
			const user = userEvent.setup();
			const setAttributes = jest.fn();

			render(
				<Edit { ...defaultProps } setAttributes={ setAttributes } />
			);

			const locationInput = screen.getByTestId( 'text-control' );
			await user.type( locationInput, 'New York' );

			await waitFor( () => {
				expect( setAttributes ).toHaveBeenCalledWith( {
					location: 'N',
				} );
			} );
		} );

		test( 'shows loading state when fetching weather data', async () => {
			mockApiFetch.mockImplementation( () => new Promise( () => {} ) ); // Never resolves

			const props = {
				...defaultProps,
				attributes: { ...defaultProps.attributes, location: 'London' },
			};

			render( <Edit { ...props } /> );

			await waitFor( () => {
				expect( screen.getByTestId( 'spinner' ) ).toBeInTheDocument();
				expect(
					screen.getByText( 'Loading weather data…' )
				).toBeInTheDocument();
			} );
		} );
	} );

	describe( 'Units Selection', () => {
		test( 'updates units attribute on selection change', async () => {
			const user = userEvent.setup();
			const setAttributes = jest.fn();

			render(
				<Edit { ...defaultProps } setAttributes={ setAttributes } />
			);

			const unitsSelect = screen.getByTestId( 'select-control' );
			await user.selectOptions( unitsSelect, 'imperial' );

			expect( setAttributes ).toHaveBeenCalledWith( {
				units: 'imperial',
			} );
		} );

		test( 'displays correct temperature units', () => {
			const props = {
				...defaultProps,
				attributes: { ...defaultProps.attributes, units: 'imperial' },
			};

			render( <Edit { ...props } /> );

			expect(
				screen.getByDisplayValue( 'imperial' )
			).toBeInTheDocument();
		} );
	} );

	describe( 'Display Mode', () => {
		test( 'updates display mode on radio button change', async () => {
			const user = userEvent.setup();
			const setAttributes = jest.fn();

			render(
				<Edit { ...defaultProps } setAttributes={ setAttributes } />
			);

			const extendedOption = screen.getByLabelText(
				'Extended information'
			);
			await user.click( extendedOption );

			expect( setAttributes ).toHaveBeenCalledWith( {
				displayMode: 'extended',
			} );
		} );

		test( 'shows additional options in extended mode', () => {
			const props = {
				...defaultProps,
				attributes: {
					...defaultProps.attributes,
					displayMode: 'extended',
				},
			};

			render( <Edit { ...props } /> );

			expect( screen.getByText( 'Show pressure' ) ).toBeInTheDocument();
			expect(
				screen.getByText( 'Show wind information' )
			).toBeInTheDocument();
		} );
	} );

	describe( 'Display Options', () => {
		test( 'updates toggle controls correctly', async () => {
			const user = userEvent.setup();
			const setAttributes = jest.fn();

			render(
				<Edit { ...defaultProps } setAttributes={ setAttributes } />
			);

			const showIconToggle = screen.getByLabelText( 'Show weather icon' );
			await user.click( showIconToggle );

			expect( setAttributes ).toHaveBeenCalledWith( { showIcon: false } );
		} );
	} );

	describe( 'Appearance Controls', () => {
		test( 'updates background color', async () => {
			const user = userEvent.setup();
			const setAttributes = jest.fn();

			render(
				<Edit { ...defaultProps } setAttributes={ setAttributes } />
			);

			const colorPickers = screen.getAllByTestId( 'color-picker' );
			const backgroundColorPicker = colorPickers[ 0 ]; // First color picker is background

			await user.clear( backgroundColorPicker );
			await user.type( backgroundColorPicker, '#ff0000' );

			expect( setAttributes ).toHaveBeenCalledWith( {
				backgroundColor: '#ff0000',
			} );
		} );

		test( 'resets appearance to defaults', async () => {
			const user = userEvent.setup();
			const setAttributes = jest.fn();

			render(
				<Edit { ...defaultProps } setAttributes={ setAttributes } />
			);

			const resetButton = screen.getByText( 'Reset Appearance' );
			await user.click( resetButton );

			expect( setAttributes ).toHaveBeenCalledWith( {
				backgroundColor: '#f8f9fa',
				textColor: '#212529',
				borderRadius: 8,
			} );
		} );
	} );

	describe( 'Weather Data Display', () => {
		test( 'displays weather data when available', async () => {
			mockApiFetch.mockResolvedValue( mockWeatherData );

			const props = {
				...defaultProps,
				attributes: { ...defaultProps.attributes, location: 'London' },
			};

			render( <Edit { ...props } /> );

			await waitFor( () => {
				expect( screen.getByText( 'London' ) ).toBeInTheDocument();
				expect( screen.getByText( '21°C' ) ).toBeInTheDocument();
				expect(
					screen.getByText( 'Partly cloudy' )
				).toBeInTheDocument();
			} );
		} );

		test( 'displays error state when API call fails', async () => {
			const errorMessage = 'API key is invalid';
			mockApiFetch.mockRejectedValue( new Error( errorMessage ) );

			const props = {
				...defaultProps,
				attributes: { ...defaultProps.attributes, location: 'London' },
			};

			render( <Edit { ...props } /> );

			await waitFor( () => {
				expect(
					screen.getByText( 'Weather Error:' )
				).toBeInTheDocument();
				expect( screen.getByText( errorMessage ) ).toBeInTheDocument();
			} );
		} );

		test( 'displays temperature in correct units', async () => {
			mockApiFetch.mockResolvedValue( mockWeatherData );

			const props = {
				...defaultProps,
				attributes: {
					...defaultProps.attributes,
					location: 'London',
					units: 'imperial',
				},
			};

			render( <Edit { ...props } /> );

			await waitFor( () => {
				expect( screen.getByText( '21°F' ) ).toBeInTheDocument();
			} );
		} );

		test( 'shows extended information in extended mode', async () => {
			const extendedWeatherData = {
				...mockWeatherData,
				temperature: {
					...mockWeatherData.temperature,
					min: 15.0,
					max: 25.0,
				},
			};

			mockApiFetch.mockResolvedValue( extendedWeatherData );

			const props = {
				...defaultProps,
				attributes: {
					...defaultProps.attributes,
					location: 'London',
					displayMode: 'extended',
					showPressure: true,
					showWind: true,
				},
			};

			render( <Edit { ...props } /> );

			await waitFor( () => {
				expect( screen.getByText( 'Low: 15°C' ) ).toBeInTheDocument();
				expect( screen.getByText( 'High: 25°C' ) ).toBeInTheDocument();
				expect(
					screen.getByText( 'Feels like 19°C' )
				).toBeInTheDocument();
				expect( screen.getByText( 'Pressure:' ) ).toBeInTheDocument();
				expect( screen.getByText( '1013 hPa' ) ).toBeInTheDocument();
				expect( screen.getByText( 'Wind:' ) ).toBeInTheDocument();
			} );
		} );

		test( 'hides weather icon when showIcon is false', async () => {
			mockApiFetch.mockResolvedValue( mockWeatherData );

			const props = {
				...defaultProps,
				attributes: {
					...defaultProps.attributes,
					location: 'London',
					showIcon: false,
				},
			};

			render( <Edit { ...props } /> );

			await waitFor( () => {
				expect(
					screen.queryByAltText( 'partly cloudy' )
				).not.toBeInTheDocument();
			} );
		} );
	} );

	describe( 'Accessibility', () => {
		test( 'has proper ARIA labels', async () => {
			mockApiFetch.mockResolvedValue( mockWeatherData );

			const props = {
				...defaultProps,
				attributes: { ...defaultProps.attributes, location: 'London' },
			};

			render( <Edit { ...props } /> );

			await waitFor( () => {
				const weatherPreview = screen.getByRole( 'region', {
					name: 'Weather preview',
				} );
				expect( weatherPreview ).toBeInTheDocument();
			} );
		} );

		test( 'has proper form labels', () => {
			render( <Edit { ...defaultProps } /> );

			expect( screen.getByLabelText( 'Location' ) ).toBeInTheDocument();
			expect(
				screen.getByLabelText( 'Temperature Units' )
			).toBeInTheDocument();
			expect(
				screen.getByLabelText( 'Display Mode' )
			).toBeInTheDocument();
		} );
	} );

	describe( 'Debounced API Calls', () => {
		test( 'debounces API calls when location changes rapidly', async () => {
			jest.useFakeTimers();
			const user = userEvent.setup( {
				advanceTimers: jest.advanceTimersByTime,
			} );

			mockApiFetch.mockResolvedValue( mockWeatherData );

			const setAttributes = jest.fn();
			render(
				<Edit { ...defaultProps } setAttributes={ setAttributes } />
			);

			const locationInput = screen.getByTestId( 'text-control' );

			// Type rapidly
			await user.type( locationInput, 'London' );

			// Should not have called API yet
			expect( mockApiFetch ).not.toHaveBeenCalled();

			// Fast forward debounce time
			jest.advanceTimersByTime( 1000 );

			await waitFor( () => {
				expect( mockApiFetch ).toHaveBeenCalledTimes( 1 );
			} );

			jest.useRealTimers();
		} );
	} );

	describe( 'Edge Cases', () => {
		test( 'handles empty weather data gracefully', async () => {
			mockApiFetch.mockResolvedValue( {} );

			const props = {
				...defaultProps,
				attributes: { ...defaultProps.attributes, location: 'London' },
			};

			render( <Edit { ...props } /> );

			await waitFor( () => {
				expect(
					screen.getByText( 'Unknown Location' )
				).toBeInTheDocument();
				expect( screen.getByText( '0°C' ) ).toBeInTheDocument();
			} );
		} );

		test( 'handles network errors gracefully', async () => {
			mockApiFetch.mockRejectedValue( new Error( 'Network error' ) );

			const props = {
				...defaultProps,
				attributes: { ...defaultProps.attributes, location: 'London' },
			};

			render( <Edit { ...props } /> );

			await waitFor( () => {
				expect( screen.getByTestId( 'notice' ) ).toHaveClass(
					'notice-error'
				);
				expect(
					screen.getByText( 'Network error' )
				).toBeInTheDocument();
			} );
		} );

		test( 'handles malformed API responses', async () => {
			mockApiFetch.mockResolvedValue( { invalid: 'data' } );

			const props = {
				...defaultProps,
				attributes: { ...defaultProps.attributes, location: 'London' },
			};

			render( <Edit { ...props } /> );

			await waitFor( () => {
				expect(
					screen.getByText( containsText( 'Unknown Location' ) )
				).toBeInTheDocument();
			} );
		} );
	} );
} );

// Helper function for partial text matching
function containsText( text ) {
	return ( content, element ) => {
		const hasText = ( node ) =>
			node.textContent && node.textContent.includes( text );
		const nodeHasText = hasText( element );
		const childrenDontHaveText = Array.from(
			element?.children || []
		).every( ( child ) => ! hasText( child ) );
		return nodeHasText && childrenDontHaveText;
	};
}
