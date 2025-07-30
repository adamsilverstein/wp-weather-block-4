<?php
/**
 * Tests for Weather_Block_Cache class.
 *
 * @package WeatherBlock
 */

/**
 * Weather Cache test class.
 */
class Test_Weather_Block_Cache extends WP_UnitTestCase {

	/**
	 * Test that the cache class exists.
	 */
	public function test_cache_class_exists() {
		$this->assertTrue( class_exists( 'Weather_Block_Cache' ) );
	}

	/**
	 * Test basic cache set and get operations.
	 */
	public function test_cache_set_and_get() {
		$key = 'test_weather_data';
		$data = array(
			'temperature' => 20,
			'humidity'    => 65,
			'description' => 'Sunny',
		);
		
		// Set cache.
		$set_result = Weather_Block_Cache::set( $key, $data, 3600 );
		$this->assertTrue( $set_result );
		
		// Get cache.
		$cached_data = Weather_Block_Cache::get( $key );
		$this->assertEquals( $data, $cached_data );
	}

	/**
	 * Test cache with empty key.
	 */
	public function test_cache_empty_key() {
		$data = array( 'test' => 'data' );
		
		// Set with empty key should return false.
		$set_result = Weather_Block_Cache::set( '', $data );
		$this->assertFalse( $set_result );
		
		// Get with empty key should return false.
		$get_result = Weather_Block_Cache::get( '' );
		$this->assertFalse( $get_result );
	}

	/**
	 * Test cache deletion.
	 */
	public function test_cache_delete() {
		$key = 'test_delete_key';
		$data = array( 'test' => 'data' );
		
		// Set cache.
		Weather_Block_Cache::set( $key, $data );
		
		// Verify it exists.
		$this->assertNotFalse( Weather_Block_Cache::get( $key ) );
		
		// Delete cache.
		$delete_result = Weather_Block_Cache::delete( $key );
		$this->assertTrue( $delete_result );
		
		// Verify it's gone.
		$this->assertFalse( Weather_Block_Cache::get( $key ) );
	}

	/**
	 * Test cache exists method.
	 */
	public function test_cache_exists() {
		$key = 'test_exists_key';
		$data = array( 'test' => 'data' );
		
		// Should not exist initially.
		$this->assertFalse( Weather_Block_Cache::exists( $key ) );
		
		// Set cache.
		Weather_Block_Cache::set( $key, $data );
		
		// Should exist now.
		$this->assertTrue( Weather_Block_Cache::exists( $key ) );
		
		// Clean up.
		Weather_Block_Cache::delete( $key );
	}

	/**
	 * Test cache info method.
	 */
	public function test_cache_info() {
		$key = 'test_info_key';
		$data = array( 'test' => 'data' );
		
		// No info for non-existent cache.
		$this->assertFalse( Weather_Block_Cache::get_cache_info( $key ) );
		
		// Set cache.
		Weather_Block_Cache::set( $key, $data, 3600 );
		
		// Get cache info.
		$info = Weather_Block_Cache::get_cache_info( $key );
		$this->assertIsArray( $info );
		$this->assertArrayHasKey( 'cached_at', $info );
		$this->assertArrayHasKey( 'expires_at', $info );
		$this->assertArrayHasKey( 'time_left', $info );
		$this->assertArrayHasKey( 'is_expired', $info );
		$this->assertArrayHasKey( 'data_size', $info );
		
		// Clean up.
		Weather_Block_Cache::delete( $key );
	}

	/**
	 * Test cache refresh method.
	 */
	public function test_cache_refresh() {
		$key = 'test_refresh_key';
		$data = array( 'test' => 'data' );
		
		// Set cache.
		Weather_Block_Cache::set( $key, $data );
		
		// Verify it exists.
		$this->assertTrue( Weather_Block_Cache::exists( $key ) );
		
		// Refresh (delete) cache.
		$refresh_result = Weather_Block_Cache::refresh( $key );
		$this->assertTrue( $refresh_result );
		
		// Verify it's gone.
		$this->assertFalse( Weather_Block_Cache::exists( $key ) );
	}

	/**
	 * Test smart expiration setting.
	 */
	public function test_smart_expiration() {
		$key = 'test_smart_key';
		$data = array( 'test' => 'data' );
		
		// Set with smart expiration.
		$result = Weather_Block_Cache::set_with_smart_expiration( $key, $data, 'current_weather' );
		$this->assertTrue( $result );
		
		// Verify data is cached.
		$cached_data = Weather_Block_Cache::get( $key );
		$this->assertEquals( $data, $cached_data );
		
		// Clean up.
		Weather_Block_Cache::delete( $key );
	}

	/**
	 * Clean up after each test.
	 */
	public function tearDown(): void {
		// Clear all weather block cache after each test.
		Weather_Block_Cache::clear_all_cache();
		parent::tearDown();
	}
}