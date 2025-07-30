<?php
/**
 * Admin functionality for Weather Block plugin.
 *
 * @package WeatherBlock
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Weather Block Admin class.
 */
class Weather_Block_Admin {

	/**
	 * Initialize admin functionality.
	 */
	public function __construct() {
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );
		add_action( 'admin_notices', array( $this, 'display_admin_notices' ) );
		add_action( 'wp_ajax_weather_block_test_api', array( $this, 'ajax_test_api_key' ) );
	}

	/**
	 * Enqueue admin scripts and styles.
	 *
	 * @param string $hook_suffix The current admin page hook suffix.
	 */
	public function enqueue_admin_scripts( string $hook_suffix ): void {
		// Only load on our settings page.
		if ( 'settings_page_weather-block-settings' !== $hook_suffix ) {
			return;
		}

		wp_enqueue_script(
			'weather-block-admin',
			WEATHER_BLOCK_PLUGIN_URL . 'admin/js/admin.js',
			array( 'jquery' ),
			WEATHER_BLOCK_VERSION,
			true
		);

		wp_enqueue_style(
			'weather-block-admin',
			WEATHER_BLOCK_PLUGIN_URL . 'admin/css/admin.css',
			array(),
			WEATHER_BLOCK_VERSION
		);

		// Localize script with data.
		wp_localize_script(
			'weather-block-admin',
			'weatherBlockAdmin',
			array(
				'nonce'    => wp_create_nonce( 'weather_block_admin_nonce' ),
				'rest_url' => rest_url( 'weather-block/v1/' ),
				'strings'  => array(
					'testing'         => __( 'Testing API key...', 'weather-block' ),
					'test_success'    => __( 'API key is working correctly!', 'weather-block' ),
					'test_failed'     => __( 'API key test failed:', 'weather-block' ),
					'clearing_cache'  => __( 'Clearing cache...', 'weather-block' ),
					'cache_cleared'   => __( 'Cache cleared successfully!', 'weather-block' ),
					'cache_error'     => __( 'Failed to clear cache:', 'weather-block' ),
					'confirm_clear'   => __( 'Are you sure you want to clear all cached weather data?', 'weather-block' ),
				),
			)
		);
	}

	/**
	 * Display admin notices.
	 */
	public function display_admin_notices(): void {
		// Check if API key is configured.
		$api_key = get_option( 'weather_block_api_key', '' );
		if ( empty( $api_key ) ) {
			$this->show_api_key_notice();
		}

		// Show cache statistics if on our settings page.
		$screen = get_current_screen();
		if ( 'settings_page_weather-block-settings' === $screen->id ) {
			$this->show_cache_stats_notice();
		}
	}

	/**
	 * Show notice about missing API key.
	 */
	private function show_api_key_notice(): void {
		$screen = get_current_screen();
		
		// Don't show on our own settings page.
		if ( 'settings_page_weather-block-settings' === $screen->id ) {
			return;
		}

		$settings_url = admin_url( 'options-general.php?page=weather-block-settings' );
		
		printf(
			'<div class="notice notice-warning is-dismissible"><p>%s <a href="%s">%s</a></p></div>',
			esc_html__( 'Weather Block: Please configure your OpenWeatherMap API key to start displaying weather data.', 'weather-block' ),
			esc_url( $settings_url ),
			esc_html__( 'Configure now', 'weather-block' )
		);
	}

	/**
	 * Show cache statistics notice on settings page.
	 */
	private function show_cache_stats_notice(): void {
		$stats = Weather_Block_Cache::get_cache_stats();
		
		if ( $stats['count'] > 0 ) {
			printf(
				'<div class="notice notice-info"><p>%s</p></div>',
				sprintf(
					/* translators: %1$d: number of cache entries, %2$s: cache size */
					esc_html__( 'Weather Block cache: %1$d entries using %2$s of storage.', 'weather-block' ),
					$stats['count'],
					size_format( $stats['size'] )
				)
			);
		}
	}

	/**
	 * AJAX handler for testing API key.
	 */
	public function ajax_test_api_key(): void {
		// Verify nonce.
		if ( ! wp_verify_nonce( $_POST['nonce'] ?? '', 'weather_block_admin_nonce' ) ) {
			wp_die( __( 'Security check failed.', 'weather-block' ) );
		}

		// Check permissions.
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( __( 'Insufficient permissions.', 'weather-block' ) );
		}

		// Test API key.
		$weather_data = Weather_Block_API::get_weather_data( 'London,UK', 'metric' );

		if ( is_wp_error( $weather_data ) ) {
			wp_send_json_error(
				array(
					'message' => $weather_data->get_error_message(),
					'code'    => $weather_data->get_error_code(),
				)
			);
		}

		wp_send_json_success(
			array(
				'message'   => __( 'API key is working correctly!', 'weather-block' ),
				'test_data' => array(
					'location'    => $weather_data['location']['name'],
					'temperature' => $weather_data['temperature']['current'],
					'description' => $weather_data['weather']['description'],
				),
			)
		);
	}

	/**
	 * Get admin dashboard widget data.
	 *
	 * @return array Dashboard widget data.
	 */
	public static function get_dashboard_data(): array {
		$api_key = get_option( 'weather_block_api_key', '' );
		$cache_stats = Weather_Block_Cache::get_cache_stats();

		return array(
			'api_configured' => ! empty( $api_key ),
			'cache_entries'  => $cache_stats['count'],
			'cache_size'     => size_format( $cache_stats['size'] ),
		);
	}

	/**
	 * Render admin dashboard widget.
	 */
	public static function render_dashboard_widget(): void {
		$data = self::get_dashboard_data();
		$settings_url = admin_url( 'options-general.php?page=weather-block-settings' );

		echo '<div class="weather-block-dashboard-widget">';
		
		if ( $data['api_configured'] ) {
			echo '<p class="weather-status-ok">';
			echo '<span class="dashicons dashicons-yes-alt"></span> ';
			esc_html_e( 'Weather Block is configured and ready to use.', 'weather-block' );
			echo '</p>';
			
			if ( $data['cache_entries'] > 0 ) {
				printf(
					'<p class="weather-cache-info">%s</p>',
					sprintf(
						/* translators: %1$d: number of cache entries, %2$s: cache size */
						esc_html__( 'Cache: %1$d entries (%2$s)', 'weather-block' ),
						$data['cache_entries'],
						$data['cache_size']
					)
				);
			}
		} else {
			echo '<p class="weather-status-error">';
			echo '<span class="dashicons dashicons-warning"></span> ';
			esc_html_e( 'Weather Block needs configuration.', 'weather-block' );
			echo '</p>';
		}

		printf(
			'<p><a href="%s" class="button">%s</a></p>',
			esc_url( $settings_url ),
			esc_html__( 'Settings', 'weather-block' )
		);

		echo '</div>';
	}

	/**
	 * Register dashboard widget.
	 */
	public static function register_dashboard_widget(): void {
		wp_add_dashboard_widget(
			'weather_block_dashboard_widget',
			__( 'Weather Block Status', 'weather-block' ),
			array( __CLASS__, 'render_dashboard_widget' )
		);
	}
}