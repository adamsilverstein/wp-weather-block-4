<?php
/**
 * Plugin Name:       Weather Block
 * Description:       A comprehensive WordPress block for displaying weather information from OpenWeatherMap API.
 * Version:           0.1.0
 * Requires at least: 6.7
 * Requires PHP:      7.4
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       weather-block
 * Domain Path:       /languages
 *
 * @package WeatherBlock
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define plugin constants.
define( 'WEATHER_BLOCK_VERSION', '0.1.0' );
define( 'WEATHER_BLOCK_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'WEATHER_BLOCK_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'WEATHER_BLOCK_PLUGIN_FILE', __FILE__ );

/**
 * Main Weather Block Plugin Class
 */
final class Weather_Block_Plugin {

	/**
	 * Plugin instance.
	 *
	 * @var Weather_Block_Plugin|null
	 */
	private static $instance = null;

	/**
	 * Get the plugin instance.
	 *
	 * @return Weather_Block_Plugin
	 */
	public static function get_instance(): Weather_Block_Plugin {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	private function __construct() {
		$this->init_hooks();
	}

	/**
	 * Initialize plugin hooks.
	 */
	private function init_hooks(): void {
		add_action( 'init', array( $this, 'init' ) );
		add_action( 'plugins_loaded', array( $this, 'load_textdomain' ) );

		// Admin hooks.
		if ( is_admin() ) {
			add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
			add_action( 'admin_init', array( $this, 'register_settings' ) );
		}

		// Register activation and deactivation hooks.
		register_activation_hook( WEATHER_BLOCK_PLUGIN_FILE, array( $this, 'activate' ) );
		register_deactivation_hook( WEATHER_BLOCK_PLUGIN_FILE, array( $this, 'deactivate' ) );
	}

	/**
	 * Initialize the plugin.
	 */
	public function init(): void {
		$this->load_dependencies();
		$this->register_blocks();
		$this->register_rest_routes();
	}

	/**
	 * Load plugin dependencies.
	 */
	private function load_dependencies(): void {
		// Load core classes.
		require_once WEATHER_BLOCK_PLUGIN_DIR . 'includes/class-weather-api.php';
		require_once WEATHER_BLOCK_PLUGIN_DIR . 'includes/class-weather-cache.php';
		require_once WEATHER_BLOCK_PLUGIN_DIR . 'includes/class-weather-rest-controller.php';

		// Load admin classes if in admin.
		if ( is_admin() ) {
			require_once WEATHER_BLOCK_PLUGIN_DIR . 'admin/class-weather-block-admin.php';
		}
	}

	/**
	 * Register blocks using the modern blocks manifest approach.
	 */
	private function register_blocks(): void {
		/**
		 * Registers the block(s) metadata from the `blocks-manifest.php` and registers the block type(s)
		 * based on the registered block metadata.
		 * Added in WordPress 6.8 to simplify the block metadata registration process added in WordPress 6.7.
		 *
		 * @see https://make.wordpress.org/core/2025/03/13/more-efficient-block-type-registration-in-6-8/
		 */
		if ( function_exists( 'wp_register_block_types_from_metadata_collection' ) ) {
			wp_register_block_types_from_metadata_collection( WEATHER_BLOCK_PLUGIN_DIR . 'build', WEATHER_BLOCK_PLUGIN_DIR . 'build/blocks-manifest.php' );
			return;
		}

		/**
		 * Registers the block(s) metadata from the `blocks-manifest.php` file.
		 * Added to WordPress 6.7 to improve the performance of block type registration.
		 *
		 * @see https://make.wordpress.org/core/2024/10/17/new-block-type-registration-apis-to-improve-performance-in-wordpress-6-7/
		 */
		if ( function_exists( 'wp_register_block_metadata_collection' ) ) {
			wp_register_block_metadata_collection( WEATHER_BLOCK_PLUGIN_DIR . 'build', WEATHER_BLOCK_PLUGIN_DIR . 'build/blocks-manifest.php' );
		}

		/**
		 * Registers the block type(s) in the `blocks-manifest.php` file.
		 *
		 * @see https://developer.wordpress.org/reference/functions/register_block_type/
		 */
		$manifest_file = WEATHER_BLOCK_PLUGIN_DIR . 'build/blocks-manifest.php';
		if ( file_exists( $manifest_file ) ) {
			$manifest_data = require $manifest_file;
			foreach ( array_keys( $manifest_data ) as $block_type ) {
				register_block_type( WEATHER_BLOCK_PLUGIN_DIR . "build/{$block_type}" );
			}
		}
	}

	/**
	 * Register REST API routes.
	 */
	private function register_rest_routes(): void {
		add_action( 'rest_api_init', array( 'Weather_Block_REST_Controller', 'register_routes' ) );
	}

	/**
	 * Load plugin textdomain for internationalization.
	 */
	public function load_textdomain(): void {
		load_plugin_textdomain(
			'weather-block',
			false,
			dirname( plugin_basename( WEATHER_BLOCK_PLUGIN_FILE ) ) . '/languages/'
		);
	}

	/**
	 * Add admin menu page.
	 */
	public function add_admin_menu(): void {
		add_options_page(
			__( 'Weather Block Settings', 'weather-block' ),
			__( 'Weather Block', 'weather-block' ),
			'manage_options',
			'weather-block-settings',
			array( $this, 'admin_page' )
		);
	}

	/**
	 * Register plugin settings.
	 */
	public function register_settings(): void {
		register_setting(
			'weather_block_settings',
			'weather_block_api_key',
			array(
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '',
			)
		);

		add_settings_section(
			'weather_block_api_section',
			__( 'API Configuration', 'weather-block' ),
			array( $this, 'api_section_callback' ),
			'weather-block-settings'
		);

		add_settings_field(
			'weather_block_api_key',
			__( 'OpenWeatherMap API Key', 'weather-block' ),
			array( $this, 'api_key_field_callback' ),
			'weather-block-settings',
			'weather_block_api_section'
		);
	}

	/**
	 * Admin page callback.
	 */
	public function admin_page(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( __( 'You do not have sufficient permissions to access this page.', 'weather-block' ) );
		}

		require_once WEATHER_BLOCK_PLUGIN_DIR . 'admin/views/settings-page.php';
	}

	/**
	 * API section callback.
	 */
	public function api_section_callback(): void {
		echo '<p>' . esc_html__( 'Configure your OpenWeatherMap API settings below. You can get a free API key from', 'weather-block' ) . ' <a href="https://openweathermap.org/api" target="_blank">OpenWeatherMap</a>.</p>';
	}

	/**
	 * API key field callback.
	 */
	public function api_key_field_callback(): void {
		$api_key = get_option( 'weather_block_api_key', '' );
		echo '<input type="password" id="weather_block_api_key" name="weather_block_api_key" value="' . esc_attr( $api_key ) . '" class="regular-text" />';
		echo '<p class="description">' . esc_html__( 'Enter your OpenWeatherMap API key. This key will be used to fetch weather data.', 'weather-block' ) . '</p>';
	}

	/**
	 * Plugin activation callback.
	 */
	public function activate(): void {
		// Create default options.
		add_option( 'weather_block_api_key', '' );

		// Flush rewrite rules.
		flush_rewrite_rules();
	}

	/**
	 * Plugin deactivation callback.
	 */
	public function deactivate(): void {
		// Clear any cached weather data.
		Weather_Block_Cache::clear_all_cache();

		// Flush rewrite rules.
		flush_rewrite_rules();
	}
}

// Initialize the plugin.
Weather_Block_Plugin::get_instance();
