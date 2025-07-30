<?php
/**
 * PHPStan bootstrap file for Weather Block plugin.
 */

// Define WordPress constants that might not be available during static analysis
if (!defined('ABSPATH')) {
	define('ABSPATH', '/tmp/wordpress/');
}

if (!defined('WP_DEBUG')) {
	define('WP_DEBUG', true);
}

if (!defined('WP_DEBUG_LOG')) {
	define('WP_DEBUG_LOG', true);
}

if (!defined('WEATHER_BLOCK_VERSION')) {
	define('WEATHER_BLOCK_VERSION', '0.1.0');
}

if (!defined('WEATHER_BLOCK_PLUGIN_DIR')) {
	define('WEATHER_BLOCK_PLUGIN_DIR', __DIR__ . '/');
}

if (!defined('WEATHER_BLOCK_PLUGIN_URL')) {
	define('WEATHER_BLOCK_PLUGIN_URL', 'https://example.com/wp-content/plugins/weather-block/');
}

// Stub WordPress functions that might not be available
if (!function_exists('add_action')) {
	function add_action($hook, $callback, $priority = 10, $accepted_args = 1) {}
}

if (!function_exists('add_filter')) {
	function add_filter($hook, $callback, $priority = 10, $accepted_args = 1) {}
}

if (!function_exists('__')) {
	function __($text, $domain = 'default') {
		return $text;
	}
}

if (!function_exists('esc_html')) {
	function esc_html($text) {
		return htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
	}
}

if (!function_exists('wp_enqueue_script')) {
	function wp_enqueue_script($handle, $src = '', $deps = array(), $ver = false, $in_footer = false) {}
}

if (!function_exists('wp_enqueue_style')) {
	function wp_enqueue_style($handle, $src = '', $deps = array(), $ver = false, $media = 'all') {}
}