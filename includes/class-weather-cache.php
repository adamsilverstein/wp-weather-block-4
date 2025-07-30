<?php
/**
 * Weather caching system using WordPress Transients.
 *
 * @package WeatherBlock
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Weather cache handler using WordPress Transients API.
 */
class Weather_Block_Cache {

	/**
	 * Cache key prefix to avoid conflicts.
	 */
	private const CACHE_PREFIX = 'weather_block_';

	/**
	 * Maximum cache duration (24 hours).
	 */
	private const MAX_CACHE_DURATION = 24 * HOUR_IN_SECONDS;

	/**
	 * Default cache duration (15 minutes).
	 */
	private const DEFAULT_CACHE_DURATION = 15 * MINUTE_IN_SECONDS;

	/**
	 * Store data in cache.
	 *
	 * @param string $key        The cache key.
	 * @param mixed  $data       The data to cache.
	 * @param int    $expiration Cache expiration in seconds.
	 * @return bool True if cached successfully, false otherwise.
	 */
	public static function set( string $key, $data, int $expiration = self::DEFAULT_CACHE_DURATION ): bool {
		// Validate input.
		if ( empty( $key ) ) {
			return false;
		}

		// Limit maximum cache duration.
		$expiration = min( $expiration, self::MAX_CACHE_DURATION );

		// Add metadata.
		$cache_data = array(
			'data'       => $data,
			'cached_at'  => current_time( 'timestamp' ),
			'expires_at' => current_time( 'timestamp' ) + $expiration,
		);

		$cache_key = self::get_cache_key( $key );
		
		return set_transient( $cache_key, $cache_data, $expiration );
	}

	/**
	 * Get data from cache.
	 *
	 * @param string $key The cache key.
	 * @return mixed|false The cached data or false if not found/expired.
	 */
	public static function get( string $key ) {
		if ( empty( $key ) ) {
			return false;
		}

		$cache_key = self::get_cache_key( $key );
		$cache_data = get_transient( $cache_key );

		// Check if cache exists and is valid.
		if ( false === $cache_data || ! is_array( $cache_data ) ) {
			return false;
		}

		// Validate cache structure.
		if ( ! isset( $cache_data['data'], $cache_data['cached_at'], $cache_data['expires_at'] ) ) {
			// Invalid cache structure, delete it.
			self::delete( $key );
			return false;
		}

		// Double-check expiration (failsafe).
		if ( current_time( 'timestamp' ) > $cache_data['expires_at'] ) {
			self::delete( $key );
			return false;
		}

		return $cache_data['data'];
	}

	/**
	 * Delete data from cache.
	 *
	 * @param string $key The cache key.
	 * @return bool True if deleted successfully, false otherwise.
	 */
	public static function delete( string $key ): bool {
		if ( empty( $key ) ) {
			return false;
		}

		$cache_key = self::get_cache_key( $key );
		
		return delete_transient( $cache_key );
	}

	/**
	 * Clear all weather-related cache entries.
	 *
	 * @return int Number of cache entries cleared.
	 */
	public static function clear_all_cache(): int {
		global $wpdb;

		// Get all weather block transients.
		$transient_keys = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT option_name FROM {$wpdb->options} 
				WHERE option_name LIKE %s 
				OR option_name LIKE %s",
				'_transient_' . self::CACHE_PREFIX . '%',
				'_transient_timeout_' . self::CACHE_PREFIX . '%'
			)
		);

		$cleared_count = 0;

		foreach ( $transient_keys as $transient_key ) {
			// Remove the _transient_ or _transient_timeout_ prefix.
			$clean_key = str_replace( array( '_transient_timeout_', '_transient_' ), '', $transient_key );
			
			if ( delete_transient( $clean_key ) ) {
				$cleared_count++;
			}
		}

		return $cleared_count;
	}

	/**
	 * Get cache statistics.
	 *
	 * @return array Cache statistics.
	 */
	public static function get_cache_stats(): array {
		global $wpdb;

		// Count weather block transients.
		$cache_count = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$wpdb->options} 
				WHERE option_name LIKE %s 
				AND option_name NOT LIKE %s",
				'_transient_' . self::CACHE_PREFIX . '%',
				'_transient_timeout_%'
			)
		);

		// Get cache size (approximate).
		$cache_size = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT SUM(LENGTH(option_value)) FROM {$wpdb->options} 
				WHERE option_name LIKE %s 
				AND option_name NOT LIKE %s",
				'_transient_' . self::CACHE_PREFIX . '%',
				'_transient_timeout_%'
			)
		);

		return array(
			'count' => (int) $cache_count,
			'size'  => (int) $cache_size,
		);
	}

	/**
	 * Check if a cache key exists and is valid.
	 *
	 * @param string $key The cache key.
	 * @return bool True if cache exists and is valid, false otherwise.
	 */
	public static function exists( string $key ): bool {
		return false !== self::get( $key );
	}

	/**
	 * Get cache information for a specific key.
	 *
	 * @param string $key The cache key.
	 * @return array|false Cache info or false if not found.
	 */
	public static function get_cache_info( string $key ) {
		if ( empty( $key ) ) {
			return false;
		}

		$cache_key = self::get_cache_key( $key );
		$cache_data = get_transient( $cache_key );

		if ( false === $cache_data || ! is_array( $cache_data ) ) {
			return false;
		}

		// Validate cache structure.
		if ( ! isset( $cache_data['cached_at'], $cache_data['expires_at'] ) ) {
			return false;
		}

		$current_time = current_time( 'timestamp' );
		$time_left = max( 0, $cache_data['expires_at'] - $current_time );

		return array(
			'cached_at'  => $cache_data['cached_at'],
			'expires_at' => $cache_data['expires_at'],
			'time_left'  => $time_left,
			'is_expired' => $current_time > $cache_data['expires_at'],
			'data_size'  => strlen( maybe_serialize( $cache_data['data'] ) ),
		);
	}

	/**
	 * Cleanup expired cache entries.
	 * This is automatically handled by WordPress, but can be called manually.
	 *
	 * @return int Number of expired entries cleaned up.
	 */
	public static function cleanup_expired_cache(): int {
		global $wpdb;

		// WordPress automatically cleans up expired transients,
		// but we can help by cleaning up orphaned timeout entries.
		$expired_timeouts = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT option_name FROM {$wpdb->options} 
				WHERE option_name LIKE %s 
				AND option_value < %d",
				'_transient_timeout_' . self::CACHE_PREFIX . '%',
				current_time( 'timestamp' )
			)
		);

		$cleaned_count = 0;

		foreach ( $expired_timeouts as $timeout_key ) {
			// Get the transient key from the timeout key.
			$transient_key = str_replace( '_transient_timeout_', '_transient_', $timeout_key );
			
			// Delete both timeout and transient.
			if ( $wpdb->delete( $wpdb->options, array( 'option_name' => $timeout_key ) ) ) {
				$wpdb->delete( $wpdb->options, array( 'option_name' => $transient_key ) );
				$cleaned_count++;
			}
		}

		return $cleaned_count;
	}

	/**
	 * Generate a prefixed cache key.
	 *
	 * @param string $key The original cache key.
	 * @return string The prefixed cache key.
	 */
	private static function get_cache_key( string $key ): string {
		// Sanitize the key and add prefix.
		$sanitized_key = preg_replace( '/[^a-zA-Z0-9_]/', '_', $key );
		return self::CACHE_PREFIX . $sanitized_key;
	}

	/**
	 * Refresh cache for a specific key by deleting it.
	 * The next request will generate fresh data.
	 *
	 * @param string $key The cache key to refresh.
	 * @return bool True if cache was refreshed (deleted), false otherwise.
	 */
	public static function refresh( string $key ): bool {
		return self::delete( $key );
	}

	/**
	 * Set cache with custom expiration based on data freshness requirements.
	 *
	 * @param string $key  The cache key.
	 * @param mixed  $data The data to cache.
	 * @param string $type The type of data (weather, forecast, etc.).
	 * @return bool True if cached successfully, false otherwise.
	 */
	public static function set_with_smart_expiration( string $key, $data, string $type = 'weather' ): bool {
		$expiration = self::get_smart_expiration( $type );
		return self::set( $key, $data, $expiration );
	}

	/**
	 * Get smart expiration time based on data type.
	 *
	 * @param string $type The type of data.
	 * @return int Expiration time in seconds.
	 */
	private static function get_smart_expiration( string $type ): int {
		switch ( $type ) {
			case 'current_weather':
				return 15 * MINUTE_IN_SECONDS; // Current weather changes frequently.
			case 'forecast':
				return 3 * HOUR_IN_SECONDS; // Forecasts are more stable.
			case 'location_search':
				return 24 * HOUR_IN_SECONDS; // Location data rarely changes.
			default:
				return self::DEFAULT_CACHE_DURATION;
		}
	}
}