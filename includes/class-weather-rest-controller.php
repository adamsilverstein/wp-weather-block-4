<?php
/**
 * REST API controller for weather data endpoints.
 *
 * @package WeatherBlock
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Weather Block REST API Controller.
 */
class Weather_Block_REST_Controller extends WP_REST_Controller {

	/**
	 * The namespace for our REST API.
	 */
	protected $namespace = 'weather-block/v1';

	/**
	 * Register the REST API routes.
	 */
	public static function register_routes(): void {
		$controller = new self();
		$controller->register_api_routes();
	}

	/**
	 * Register all API routes.
	 */
	public function register_api_routes(): void {
		// Get weather data endpoint.
		register_rest_route(
			$this->namespace,
			'/weather',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_weather' ),
				'permission_callback' => array( $this, 'get_weather_permissions_check' ),
				'args'                => $this->get_weather_args(),
			)
		);

		// Clear cache endpoint.
		register_rest_route(
			$this->namespace,
			'/cache/clear',
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'clear_cache' ),
				'permission_callback' => array( $this, 'manage_options_permissions_check' ),
			)
		);

		// Get cache stats endpoint.
		register_rest_route(
			$this->namespace,
			'/cache/stats',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_cache_stats' ),
				'permission_callback' => array( $this, 'manage_options_permissions_check' ),
			)
		);

		// Test API key endpoint.
		register_rest_route(
			$this->namespace,
			'/test-api-key',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'test_api_key' ),
				'permission_callback' => array( $this, 'manage_options_permissions_check' ),
			)
		);
	}

	/**
	 * Get weather data endpoint callback.
	 *
	 * @param WP_REST_Request $request The REST request object.
	 * @return WP_REST_Response|WP_Error The response or error.
	 */
	public function get_weather( WP_REST_Request $request ) {
		$location = sanitize_text_field( $request->get_param( 'location' ) );
		$units = Weather_Block_API::validate_units( $request->get_param( 'units' ) );

		// Validate required parameters.
		if ( empty( $location ) ) {
			return new WP_Error(
				'missing_location',
				__( 'Location parameter is required.', 'weather-block' ),
				array( 'status' => 400 )
			);
		}

		// Get weather data.
		$weather_data = Weather_Block_API::get_weather_data( $location, $units );

		if ( is_wp_error( $weather_data ) ) {
			return new WP_Error(
				$weather_data->get_error_code(),
				$weather_data->get_error_message(),
				array( 'status' => 400 )
			);
		}

		// Add icon URL to the response.
		if ( ! empty( $weather_data['weather']['icon'] ) ) {
			$weather_data['weather']['icon_url'] = Weather_Block_API::get_icon_url( $weather_data['weather']['icon'] );
		}

		// Add cache information.
		$cache_key = 'weather_' . md5( $location . $units );
		$cache_info = Weather_Block_Cache::get_cache_info( $cache_key );
		if ( $cache_info ) {
			$weather_data['cache_info'] = array(
				'cached'    => true,
				'cached_at' => $cache_info['cached_at'],
				'time_left' => $cache_info['time_left'],
			);
		} else {
			$weather_data['cache_info'] = array(
				'cached' => false,
			);
		}

		return new WP_REST_Response( $weather_data, 200 );
	}

	/**
	 * Clear cache endpoint callback.
	 *
	 * @param WP_REST_Request $request The REST request object.
	 * @return WP_REST_Response The response.
	 */
	public function clear_cache( WP_REST_Request $request ): WP_REST_Response {
		$cleared_count = Weather_Block_Cache::clear_all_cache();

		return new WP_REST_Response(
			array(
				'success' => true,
				'message' => sprintf(
					/* translators: %d: number of cache entries cleared */
					_n(
						'Cleared %d cache entry.',
						'Cleared %d cache entries.',
						$cleared_count,
						'weather-block'
					),
					$cleared_count
				),
				'cleared_count' => $cleared_count,
			),
			200
		);
	}

	/**
	 * Get cache statistics endpoint callback.
	 *
	 * @param WP_REST_Request $request The REST request object.
	 * @return WP_REST_Response The response.
	 */
	public function get_cache_stats( WP_REST_Request $request ): WP_REST_Response {
		$stats = Weather_Block_Cache::get_cache_stats();

		return new WP_REST_Response(
			array(
				'cache_entries' => $stats['count'],
				'cache_size'    => size_format( $stats['size'] ),
				'cache_size_bytes' => $stats['size'],
			),
			200
		);
	}

	/**
	 * Test API key endpoint callback.
	 *
	 * @param WP_REST_Request $request The REST request object.
	 * @return WP_REST_Response|WP_Error The response or error.
	 */
	public function test_api_key( WP_REST_Request $request ) {
		// Test with a known location.
		$test_location = 'London,UK';
		$weather_data = Weather_Block_API::get_weather_data( $test_location, 'metric' );

		if ( is_wp_error( $weather_data ) ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'message' => $weather_data->get_error_message(),
					'error_code' => $weather_data->get_error_code(),
				),
				400
			);
		}

		return new WP_REST_Response(
			array(
				'success' => true,
				'message' => __( 'API key is working correctly.', 'weather-block' ),
				'test_data' => array(
					'location' => $weather_data['location']['name'],
					'temperature' => $weather_data['temperature']['current'],
				),
			),
			200
		);
	}

	/**
	 * Check permissions for getting weather data.
	 *
	 * @param WP_REST_Request $request The REST request object.
	 * @return bool|WP_Error True if user can access, error otherwise.
	 */
	public function get_weather_permissions_check( WP_REST_Request $request ) {
		// Allow anyone to get weather data if API key is configured.
		$api_key = get_option( 'weather_block_api_key', '' );
		if ( empty( $api_key ) ) {
			return new WP_Error(
				'no_api_key',
				__( 'Weather service is not configured.', 'weather-block' ),
				array( 'status' => 503 )
			);
		}

		return true;
	}

	/**
	 * Check permissions for admin-only endpoints.
	 *
	 * @param WP_REST_Request $request The REST request object.
	 * @return bool|WP_Error True if user can manage options, error otherwise.
	 */
	public function manage_options_permissions_check( WP_REST_Request $request ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new WP_Error(
				'insufficient_permissions',
				__( 'You do not have permissions to perform this action.', 'weather-block' ),
				array( 'status' => 403 )
			);
		}

		return true;
	}

	/**
	 * Get the arguments for the weather endpoint.
	 *
	 * @return array The endpoint arguments.
	 */
	private function get_weather_args(): array {
		return array(
			'location' => array(
				'required'          => true,
				'type'              => 'string',
				'description'       => __( 'The location to get weather for (city name, coordinates, etc.)', 'weather-block' ),
				'sanitize_callback' => 'sanitize_text_field',
				'validate_callback' => function( $param ) {
					return ! empty( $param ) && is_string( $param );
				},
			),
			'units' => array(
				'required'          => false,
				'type'              => 'string',
				'description'       => __( 'The units system to use (metric, imperial, kelvin)', 'weather-block' ),
				'default'           => 'metric',
				'enum'              => array( 'metric', 'imperial', 'kelvin' ),
				'sanitize_callback' => 'sanitize_text_field',
				'validate_callback' => function( $param ) {
					return in_array( $param, array( 'metric', 'imperial', 'kelvin' ), true );
				},
			),
		);
	}

	/**
	 * Prepare weather data for the API response.
	 *
	 * @param array           $weather_data The weather data.
	 * @param WP_REST_Request $request      The REST request object.
	 * @return array The prepared data.
	 */
	public function prepare_item_for_response( $weather_data, $request ): array {
		// This method would be used if we were extending WP_REST_Posts_Controller
		// or similar, but for our simple use case, we handle preparation in the callback.
		return $weather_data;
	}

	/**
	 * Get the schema for the weather data.
	 *
	 * @return array The schema definition.
	 */
	public function get_item_schema(): array {
		if ( $this->schema ) {
			return $this->add_additional_fields_schema( $this->schema );
		}

		$this->schema = array(
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => 'weather',
			'type'       => 'object',
			'properties' => array(
				'location' => array(
					'description' => __( 'Location information', 'weather-block' ),
					'type'        => 'object',
					'properties'  => array(
						'name'    => array(
							'description' => __( 'City name', 'weather-block' ),
							'type'        => 'string',
						),
						'country' => array(
							'description' => __( 'Country code', 'weather-block' ),
							'type'        => 'string',
						),
					),
				),
				'temperature' => array(
					'description' => __( 'Temperature information', 'weather-block' ),
					'type'        => 'object',
					'properties'  => array(
						'current'    => array(
							'description' => __( 'Current temperature', 'weather-block' ),
							'type'        => 'number',
						),
						'feels_like' => array(
							'description' => __( 'Feels like temperature', 'weather-block' ),
							'type'        => 'number',
						),
						'min'        => array(
							'description' => __( 'Minimum temperature', 'weather-block' ),
							'type'        => 'number',
						),
						'max'        => array(
							'description' => __( 'Maximum temperature', 'weather-block' ),
							'type'        => 'number',
						),
					),
				),
				'weather' => array(
					'description' => __( 'Weather conditions', 'weather-block' ),
					'type'        => 'object',
					'properties'  => array(
						'main'        => array(
							'description' => __( 'Main weather condition', 'weather-block' ),
							'type'        => 'string',
						),
						'description' => array(
							'description' => __( 'Weather description', 'weather-block' ),
							'type'        => 'string',
						),
						'icon'        => array(
							'description' => __( 'Weather icon code', 'weather-block' ),
							'type'        => 'string',
						),
						'icon_url'    => array(
							'description' => __( 'Weather icon URL', 'weather-block' ),
							'type'        => 'string',
						),
					),
				),
				'humidity' => array(
					'description' => __( 'Humidity percentage', 'weather-block' ),
					'type'        => 'integer',
				),
				'pressure' => array(
					'description' => __( 'Atmospheric pressure', 'weather-block' ),
					'type'        => 'integer',
				),
				'wind' => array(
					'description' => __( 'Wind information', 'weather-block' ),
					'type'        => 'object',
					'properties'  => array(
						'speed' => array(
							'description' => __( 'Wind speed', 'weather-block' ),
							'type'        => 'number',
						),
						'deg'   => array(
							'description' => __( 'Wind direction in degrees', 'weather-block' ),
							'type'        => 'integer',
						),
					),
				),
				'visibility' => array(
					'description' => __( 'Visibility in meters', 'weather-block' ),
					'type'        => 'integer',
				),
				'updated_at' => array(
					'description' => __( 'Last update timestamp', 'weather-block' ),
					'type'        => 'integer',
				),
				'cache_info' => array(
					'description' => __( 'Cache information', 'weather-block' ),
					'type'        => 'object',
					'properties'  => array(
						'cached'    => array(
							'description' => __( 'Whether data is from cache', 'weather-block' ),
							'type'        => 'boolean',
						),
						'cached_at' => array(
							'description' => __( 'Cache timestamp', 'weather-block' ),
							'type'        => 'integer',
						),
						'time_left' => array(
							'description' => __( 'Time left until cache expires', 'weather-block' ),
							'type'        => 'integer',
						),
					),
				),
			),
		);

		return $this->add_additional_fields_schema( $this->schema );
	}
}