<?php
/**
 * Weather API handler for OpenWeatherMap integration.
 *
 * @package WeatherBlock
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Weather API class for handling OpenWeatherMap API requests.
 */
class Weather_Block_API {

	/**
	 * OpenWeatherMap API base URL.
	 */
	private const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/';

	/**
	 * OpenWeatherMap icon base URL.
	 */
	private const ICON_BASE_URL = 'https://openweathermap.org/img/wn/';

	/**
	 * API timeout in seconds.
	 */
	private const API_TIMEOUT = 10;

	/**
	 * Get weather data for a specific location.
	 *
	 * @param string $location The location to get weather for.
	 * @param string $units    The units to use (metric, imperial, kelvin).
	 * @return array|WP_Error Weather data or error.
	 */
	public static function get_weather_data( string $location, string $units = 'metric' ) {
		// Validate input.
		if ( empty( $location ) ) {
			return new WP_Error(
				'invalid_location',
				__( 'Location cannot be empty.', 'weather-block' )
			);
		}

		// Get API key.
		$api_key = get_option( 'weather_block_api_key', '' );
		if ( empty( $api_key ) ) {
			return new WP_Error(
				'missing_api_key',
				__( 'OpenWeatherMap API key is not configured.', 'weather-block' )
			);
		}

		// Check cache first.
		$cache_key = self::get_cache_key( $location, $units );
		$cached_data = Weather_Block_Cache::get( $cache_key );
		if ( false !== $cached_data ) {
			return $cached_data;
		}

		// Build API URL.
		$api_url = self::build_api_url( $location, $api_key, $units );

		// Make API request.
		$response = self::make_api_request( $api_url );
		if ( is_wp_error( $response ) ) {
			return $response;
		}

		// Parse and validate response.
		$weather_data = self::parse_weather_response( $response );
		if ( is_wp_error( $weather_data ) ) {
			return $weather_data;
		}

		// Cache the result for 15 minutes.
		Weather_Block_Cache::set( $cache_key, $weather_data, 15 * MINUTE_IN_SECONDS );

		return $weather_data;
	}

	/**
	 * Build the API URL for the weather request.
	 *
	 * @param string $location The location query.
	 * @param string $api_key  The API key.
	 * @param string $units    The units system.
	 * @return string The complete API URL.
	 */
	private static function build_api_url( string $location, string $api_key, string $units ): string {
		$params = array(
			'q'     => $location,
			'appid' => $api_key,
			'units' => $units,
		);

		return self::API_BASE_URL . 'weather?' . http_build_query( $params );
	}

	/**
	 * Make the actual API request to OpenWeatherMap.
	 *
	 * @param string $api_url The complete API URL.
	 * @return array|WP_Error The response body or error.
	 */
	private static function make_api_request( string $api_url ) {
		$response = wp_remote_get(
			$api_url,
			array(
				'timeout'    => self::API_TIMEOUT,
				'user-agent' => 'WeatherBlock/' . WEATHER_BLOCK_VERSION . ' WordPress Plugin',
				'headers'    => array(
					'Accept' => 'application/json',
				),
			)
		);

		// Check for network errors.
		if ( is_wp_error( $response ) ) {
			error_log( 'Weather Block API Error: ' . $response->get_error_message() );
			return new WP_Error(
				'api_request_failed',
				__( 'Failed to connect to weather service.', 'weather-block' )
			);
		}

		// Check HTTP status code.
		$status_code = wp_remote_retrieve_response_code( $response );
		if ( 200 !== $status_code ) {
			$error_message = self::get_api_error_message( $status_code );
			error_log( "Weather Block API Error: HTTP {$status_code} - {$error_message}" );
			return new WP_Error(
				'api_error',
				$error_message
			);
		}

		// Get response body.
		$body = wp_remote_retrieve_body( $response );
		if ( empty( $body ) ) {
			return new WP_Error(
				'empty_response',
				__( 'Empty response from weather service.', 'weather-block' )
			);
		}

		// Decode JSON.
		$data = json_decode( $body, true );
		if ( null === $data ) {
			error_log( 'Weather Block API Error: Invalid JSON response' );
			return new WP_Error(
				'invalid_json',
				__( 'Invalid response from weather service.', 'weather-block' )
			);
		}

		return $data;
	}

	/**
	 * Parse the weather API response into a standardized format.
	 *
	 * @param array $response The API response data.
	 * @return array|WP_Error Parsed weather data or error.
	 */
	private static function parse_weather_response( array $response ) {
		// Validate required fields.
		if ( ! isset( $response['main'], $response['weather'], $response['name'] ) ) {
			return new WP_Error(
				'invalid_response',
				__( 'Invalid weather data received.', 'weather-block' )
			);
		}

		$main_weather = $response['weather'][0] ?? array();

		return array(
			'location'    => array(
				'name'    => sanitize_text_field( $response['name'] ),
				'country' => sanitize_text_field( $response['sys']['country'] ?? '' ),
			),
			'temperature' => array(
				'current'   => (float) $response['main']['temp'],
				'feels_like' => (float) $response['main']['feels_like'],
				'min'       => (float) $response['main']['temp_min'],
				'max'       => (float) $response['main']['temp_max'],
			),
			'weather'     => array(
				'main'        => sanitize_text_field( $main_weather['main'] ?? '' ),
				'description' => sanitize_text_field( $main_weather['description'] ?? '' ),
				'icon'        => sanitize_text_field( $main_weather['icon'] ?? '' ),
			),
			'humidity'    => (int) $response['main']['humidity'],
			'pressure'    => (int) $response['main']['pressure'],
			'wind'        => array(
				'speed' => (float) ( $response['wind']['speed'] ?? 0 ),
				'deg'   => (int) ( $response['wind']['deg'] ?? 0 ),
			),
			'visibility'  => (int) ( $response['visibility'] ?? 0 ),
			'updated_at'  => current_time( 'timestamp' ),
		);
	}

	/**
	 * Get human-readable error message for API status codes.
	 *
	 * @param int $status_code The HTTP status code.
	 * @return string The error message.
	 */
	private static function get_api_error_message( int $status_code ): string {
		switch ( $status_code ) {
			case 401:
				return __( 'Invalid API key. Please check your OpenWeatherMap API key.', 'weather-block' );
			case 404:
				return __( 'Location not found. Please check the location name.', 'weather-block' );
			case 429:
				return __( 'API rate limit exceeded. Please try again later.', 'weather-block' );
			case 500:
			case 502:
			case 503:
				return __( 'Weather service is temporarily unavailable.', 'weather-block' );
			default:
				return sprintf(
					/* translators: %d: HTTP status code */
					__( 'Weather service error (HTTP %d).', 'weather-block' ),
					$status_code
				);
		}
	}

	/**
	 * Generate a cache key for the weather data.
	 *
	 * @param string $location The location query.
	 * @param string $units    The units system.
	 * @return string The cache key.
	 */
	private static function get_cache_key( string $location, string $units ): string {
		return 'weather_' . md5( $location . $units );
	}

	/**
	 * Get the full URL for a weather icon.
	 *
	 * @param string $icon_code The icon code from OpenWeatherMap.
	 * @param string $size      The icon size (2x for high resolution).
	 * @return string The complete icon URL.
	 */
	public static function get_icon_url( string $icon_code, string $size = '2x' ): string {
		if ( empty( $icon_code ) ) {
			return '';
		}

		return self::ICON_BASE_URL . $icon_code . '@' . $size . '.png';
	}

	/**
	 * Validate units parameter.
	 *
	 * @param string $units The units to validate.
	 * @return string Valid units or default.
	 */
	public static function validate_units( string $units ): string {
		$valid_units = array( 'metric', 'imperial', 'kelvin' );
		return in_array( $units, $valid_units, true ) ? $units : 'metric';
	}
}