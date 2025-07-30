<?php
/**
 * PHPUnit bootstrap file for Weather Block plugin tests.
 *
 * @package WeatherBlock
 */

// Define test environment constants.
define( 'WP_TESTS_PHPUNIT_POLYFILLS_PATH', __DIR__ . '/../vendor/yoast/phpunit-polyfills/phpunitpolyfills-autoload.php' );

// Set up WordPress test environment.
$_tests_dir = getenv( 'WP_TESTS_DIR' );

if ( ! $_tests_dir ) {
	$_tests_dir = rtrim( sys_get_temp_dir(), '/\\' ) . '/wordpress-tests-lib';
}

// Forward compatibility for PHPUnit versions.
if ( ! class_exists( 'PHPUnit\Framework\TestCase' ) && class_exists( 'PHPUnit_Framework_TestCase' ) ) {
	class_alias( 'PHPUnit_Framework_TestCase', 'PHPUnit\Framework\TestCase' );
}

// Give access to tests_add_filter() function.
require_once $_tests_dir . '/includes/functions.php';

/**
 * Manually load the plugin being tested.
 */
function _manually_load_plugin() {
	require dirname( dirname( __FILE__ ) ) . '/weather-block.php';
}

tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

// Start up the WP testing environment.
require $_tests_dir . '/includes/bootstrap.php';