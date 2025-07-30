/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * WordPress block editor components.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/
 */
import {
	useBlockProps,
	InspectorControls,
	BlockControls,
} from '@wordpress/block-editor';

/**
 * WordPress UI components.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-components/
 */
import {
	PanelBody,
	TextControl,
	SelectControl,
	ToggleControl,
	RadioControl,
	Notice,
	Spinner,
	Button,
	ButtonGroup,
	ColorPicker,
	RangeControl,
} from '@wordpress/components';

/**
 * WordPress data and API utilities.
 */
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

/**
 * Import editor styles.
 */
import './editor.scss';

/**
 * Weather Preview Component.
 *
 * @param {Object}      props             Component props.
 * @param {Object}      props.weatherData Weather data from API.
 * @param {Object}      props.attributes  Block attributes.
 * @param {boolean}     props.isLoading   Loading state.
 * @param {string|null} props.error       Error message.
 * @return {JSX.Element} Weather preview component.
 */
function WeatherPreview( { weatherData, attributes, isLoading, error } ) {
	const {
		units,
		displayMode,
		showHumidity,
		showPressure,
		showWind,
		showIcon,
		backgroundColor,
		textColor,
		borderRadius,
	} = attributes;

	// Temperature unit symbol
	let tempSymbol = '°C';
	if ( units === 'imperial' ) {
		tempSymbol = '°F';
	} else if ( units === 'kelvin' ) {
		tempSymbol = 'K';
	}
	const windUnit = units === 'imperial' ? 'mph' : 'm/s';

	if ( isLoading ) {
		return (
			<div className="weather-block-preview weather-block-loading">
				<Spinner />
				<p>{ __( 'Loading weather data…', 'weather-block' ) }</p>
			</div>
		);
	}

	if ( error ) {
		return (
			<div className="weather-block-preview weather-block-error">
				<Notice status="error" isDismissible={ false }>
					<strong>{ __( 'Weather Error:', 'weather-block' ) }</strong>{ ' ' }
					{ error }
				</Notice>
			</div>
		);
	}

	if ( ! weatherData ) {
		return (
			<div className="weather-block-preview weather-block-placeholder">
				<p>
					{ __(
						'Enter a location to preview weather data',
						'weather-block'
					) }
				</p>
			</div>
		);
	}

	const previewStyle = {
		backgroundColor,
		color: textColor,
		borderRadius: borderRadius + 'px',
	};

	return (
		<div
			className={ `weather-block-preview weather-block-${ displayMode }` }
			style={ previewStyle }
			role="region"
			aria-label={ __( 'Weather preview', 'weather-block' ) }
		>
			<div className="weather-block-content">
				{ showIcon && weatherData.weather?.icon_url && (
					<div className="weather-icon">
						<img
							src={ weatherData.weather.icon_url }
							alt={
								weatherData.weather?.description ||
								__( 'Weather icon', 'weather-block' )
							}
							width="50"
							height="50"
							loading="lazy"
						/>
					</div>
				) }

				<div className="weather-main">
					<div className="weather-location">
						<h3>
							{ weatherData.location?.name ||
								__( 'Unknown Location', 'weather-block' ) }
						</h3>
						{ weatherData.location?.country && (
							<span className="weather-country">
								{ weatherData.location.country }
							</span>
						) }
					</div>

					<div className="weather-temperature">
						<span
							className="temperature-current"
							aria-label={ `${ __(
								'Current temperature',
								'weather-block'
							) }: ${ Math.round(
								weatherData.temperature?.current || 0
							) }${ tempSymbol }` }
						>
							{ Math.round(
								weatherData.temperature?.current || 0
							) }
							{ tempSymbol }
						</span>

						{ displayMode === 'extended' && (
							<>
								<div className="temperature-range">
									<span className="temperature-min">
										{ __( 'Low:', 'weather-block' ) }{ ' ' }
										{ Math.round(
											weatherData.temperature?.min || 0
										) }
										{ tempSymbol }
									</span>
									<span className="temperature-max">
										{ __( 'High:', 'weather-block' ) }{ ' ' }
										{ Math.round(
											weatherData.temperature?.max || 0
										) }
										{ tempSymbol }
									</span>
								</div>

								<div className="temperature-feels-like">
									{ __( 'Feels like', 'weather-block' ) }{ ' ' }
									{ Math.round(
										weatherData.temperature?.feels_like || 0
									) }
									{ tempSymbol }
								</div>
							</>
						) }
					</div>

					<div className="weather-description">
						{ weatherData.weather?.description
							? weatherData.weather.description
									.charAt( 0 )
									.toUpperCase() +
							  weatherData.weather.description.slice( 1 )
							: __(
									'No description available',
									'weather-block'
							  ) }
					</div>
				</div>
			</div>

			{ displayMode === 'extended' &&
				( showHumidity || showPressure || showWind ) && (
					<div className="weather-details">
						{ showHumidity && (
							<div className="weather-detail">
								<span className="detail-label">
									{ __( 'Humidity:', 'weather-block' ) }
								</span>
								<span className="detail-value">
									{ weatherData.humidity || 0 }%
								</span>
							</div>
						) }

						{ showPressure && (
							<div className="weather-detail">
								<span className="detail-label">
									{ __( 'Pressure:', 'weather-block' ) }
								</span>
								<span className="detail-value">
									{ weatherData.pressure || 0 } hPa
								</span>
							</div>
						) }

						{ showWind && weatherData.wind?.speed && (
							<div className="weather-detail">
								<span className="detail-label">
									{ __( 'Wind:', 'weather-block' ) }
								</span>
								<span className="detail-value">
									{ Math.round(
										( weatherData.wind.speed || 0 ) * 10
									) / 10 }{ ' ' }
									{ windUnit }
								</span>
							</div>
						) }
					</div>
				) }

			{ displayMode === 'current' && showHumidity && (
				<div className="weather-humidity">
					{ __( 'Humidity:', 'weather-block' ) }{ ' ' }
					{ weatherData.humidity || 0 }%
				</div>
			) }

			<div className="weather-updated">
				<small>
					{ weatherData.cache_info?.cached
						? __( 'Cached data', 'weather-block' )
						: __( 'Live data', 'weather-block' ) }
				</small>
			</div>
		</div>
	);
}

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @param {Object}   props               Block properties.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Function to update attributes.
 * @return {Element} Element to render.
 */
export default function Edit( { attributes, setAttributes } ) {
	const [ weatherData, setWeatherData ] = useState( null );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ error, setError ] = useState( null );
	const [ fetchTimeout, setFetchTimeout ] = useState( null );

	const {
		location,
		units,
		displayMode,
		showHumidity,
		showPressure,
		showWind,
		showIcon,
		backgroundColor,
		textColor,
		borderRadius,
	} = attributes;

	// Debounced weather data fetching
	const fetchWeatherData = async ( locationValue, unitsValue ) => {
		if ( ! locationValue.trim() ) {
			setWeatherData( null );
			setError( null );
			return;
		}

		setIsLoading( true );
		setError( null );

		try {
			const data = await apiFetch( {
				path: `/weather-block/v1/weather?location=${ encodeURIComponent(
					locationValue
				) }&units=${ unitsValue }`,
				method: 'GET',
			} );

			setWeatherData( data );
			setError( null );
		} catch ( err ) {
			// eslint-disable-next-line no-console
			console.error( 'Weather API Error:', err );
			setError(
				err.message ||
					__( 'Failed to fetch weather data', 'weather-block' )
			);
			setWeatherData( null );
		} finally {
			setIsLoading( false );
		}
	};

	// Effect to fetch weather data when location or units change
	useEffect( () => {
		// Clear existing timeout
		if ( fetchTimeout ) {
			clearTimeout( fetchTimeout );
		}

		// Set new timeout for debounced API call
		const newTimeout = setTimeout( () => {
			if ( location && location.trim() ) {
				fetchWeatherData( location, units );
			}
		}, 1000 ); // 1 second debounce

		setFetchTimeout( newTimeout );

		// Cleanup timeout on unmount
		return () => {
			if ( newTimeout ) {
				clearTimeout( newTimeout );
			}
		};
	}, [ location, units, fetchTimeout ] );

	// Handle attribute changes
	const updateAttribute = ( attribute, value ) => {
		setAttributes( { [ attribute ]: value } );
	};

	const blockProps = useBlockProps( {
		className: 'weather-block-editor',
	} );

	return (
		<>
			<BlockControls>
				<ButtonGroup>
					<Button
						isPressed={ displayMode === 'current' }
						onClick={ () =>
							updateAttribute( 'displayMode', 'current' )
						}
					>
						{ __( 'Current', 'weather-block' ) }
					</Button>
					<Button
						isPressed={ displayMode === 'extended' }
						onClick={ () =>
							updateAttribute( 'displayMode', 'extended' )
						}
					>
						{ __( 'Extended', 'weather-block' ) }
					</Button>
				</ButtonGroup>
			</BlockControls>

			<InspectorControls>
				<PanelBody
					title={ __( 'Weather Settings', 'weather-block' ) }
					initialOpen={ true }
				>
					<TextControl
						label={ __( 'Location', 'weather-block' ) }
						value={ location }
						onChange={ ( value ) =>
							updateAttribute( 'location', value )
						}
						placeholder={ __(
							'Enter city name, coordinates, etc.',
							'weather-block'
						) }
						help={ __(
							'Examples: "London, UK", "New York, NY", "40.7128,-74.0060"',
							'weather-block'
						) }
						aria-describedby="weather-location-help"
						autoComplete="off"
						spellCheck="false"
					/>

					<SelectControl
						label={ __( 'Temperature Units', 'weather-block' ) }
						value={ units }
						options={ [
							{
								label: __( 'Celsius (°C)', 'weather-block' ),
								value: 'metric',
							},
							{
								label: __( 'Fahrenheit (°F)', 'weather-block' ),
								value: 'imperial',
							},
							{
								label: __( 'Kelvin (K)', 'weather-block' ),
								value: 'kelvin',
							},
						] }
						onChange={ ( value ) =>
							updateAttribute( 'units', value )
						}
						aria-describedby="weather-units-help"
					/>

					<RadioControl
						label={ __( 'Display Mode', 'weather-block' ) }
						selected={ displayMode }
						options={ [
							{
								label: __(
									'Current weather only',
									'weather-block'
								),
								value: 'current',
							},
							{
								label: __(
									'Extended information',
									'weather-block'
								),
								value: 'extended',
							},
						] }
						onChange={ ( value ) =>
							updateAttribute( 'displayMode', value )
						}
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Display Options', 'weather-block' ) }
					initialOpen={ false }
				>
					<ToggleControl
						label={ __( 'Show weather icon', 'weather-block' ) }
						checked={ showIcon }
						onChange={ ( value ) =>
							updateAttribute( 'showIcon', value )
						}
					/>

					<ToggleControl
						label={ __( 'Show humidity', 'weather-block' ) }
						checked={ showHumidity }
						onChange={ ( value ) =>
							updateAttribute( 'showHumidity', value )
						}
					/>

					{ displayMode === 'extended' && (
						<>
							<ToggleControl
								label={ __( 'Show pressure', 'weather-block' ) }
								checked={ showPressure }
								onChange={ ( value ) =>
									updateAttribute( 'showPressure', value )
								}
							/>

							<ToggleControl
								label={ __(
									'Show wind information',
									'weather-block'
								) }
								checked={ showWind }
								onChange={ ( value ) =>
									updateAttribute( 'showWind', value )
								}
							/>
						</>
					) }
				</PanelBody>

				<PanelBody
					title={ __( 'Appearance', 'weather-block' ) }
					initialOpen={ false }
				>
					<div style={ { marginBottom: '16px' } }>
						<div
							style={ {
								display: 'block',
								marginBottom: '8px',
								fontWeight: '500',
							} }
						>
							{ __( 'Background Color', 'weather-block' ) }
						</div>
						<ColorPicker
							color={ backgroundColor }
							onChange={ ( value ) =>
								updateAttribute( 'backgroundColor', value )
							}
							enableAlpha
							defaultValue="#f8f9fa"
						/>
					</div>

					<div style={ { marginBottom: '16px' } }>
						<div
							style={ {
								display: 'block',
								marginBottom: '8px',
								fontWeight: '500',
							} }
						>
							{ __( 'Text Color', 'weather-block' ) }
						</div>
						<ColorPicker
							color={ textColor }
							onChange={ ( value ) =>
								updateAttribute( 'textColor', value )
							}
							enableAlpha
							defaultValue="#212529"
						/>
					</div>

					<RangeControl
						label={ __( 'Border Radius (px)', 'weather-block' ) }
						value={ borderRadius }
						onChange={ ( value ) =>
							updateAttribute( 'borderRadius', value )
						}
						min={ 0 }
						max={ 50 }
						step={ 1 }
						allowReset
						resetFallbackValue={ 8 }
					/>

					<Button
						variant="secondary"
						size="small"
						onClick={ () => {
							setAttributes( {
								backgroundColor: '#f8f9fa',
								textColor: '#212529',
								borderRadius: 8,
							} );
						} }
						style={ { marginTop: '16px' } }
					>
						{ __( 'Reset Appearance', 'weather-block' ) }
					</Button>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<WeatherPreview
					weatherData={ weatherData }
					attributes={ attributes }
					isLoading={ isLoading }
					error={ error }
				/>
			</div>
		</>
	);
}
