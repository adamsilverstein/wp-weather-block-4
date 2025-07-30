<?php
/**
 * Tests for Weather_Block_API class.
 *
 * @package WeatherBlock
 */

/**
 * Weather API test class.
 */
class Test_Weather_Block_API extends WP_UnitTestCase {

	/**
	 * Test that the API class exists.
	 */
	public function test_api_class_exists() {
		$this->assertTrue( class_exists( 'Weather_Block_API' ) );
	}

	/**
	 * Test icon URL generation.
	 */
	public function test_get_icon_url() {
		$icon_code = '01d';
		$expected_url = 'https://openweathermap.org/img/wn/01d@2x.png';
		$actual_url = Weather_Block_API::get_icon_url( $icon_code );
		
		$this->assertEquals( $expected_url, $actual_url );
	}

	/**
	 * Test icon URL generation with custom size.
	 */
	public function test_get_icon_url_with_size() {
		$icon_code = '01d';
		$size = '4x';
		$expected_url = 'https://openweathermap.org/img/wn/01d@4x.png';
		$actual_url = Weather_Block_API::get_icon_url( $icon_code, $size );
		
		$this->assertEquals( $expected_url, $actual_url );
	}

	/**
	 * Test icon URL with empty icon code.
	 */
	public function test_get_icon_url_empty() {
		$actual_url = Weather_Block_API::get_icon_url( '' );
		$this->assertEquals( '', $actual_url );
	}

	/**
	 * Test units validation.
	 */
	public function test_validate_units() {
		// Valid units.
		$this->assertEquals( 'metric', Weather_Block_API::validate_units( 'metric' ) );
		$this->assertEquals( 'imperial', Weather_Block_API::validate_units( 'imperial' ) );
		$this->assertEquals( 'kelvin', Weather_Block_API::validate_units( 'kelvin' ) );
		
		// Invalid units should default to metric.
		$this->assertEquals( 'metric', Weather_Block_API::validate_units( 'invalid' ) );
		$this->assertEquals( 'metric', Weather_Block_API::validate_units( '' ) );
	}

	/**
	 * Test weather data retrieval without API key.
	 */
	public function test_get_weather_data_no_api_key() {
		// Ensure no API key is set.
		delete_option( 'weather_block_api_key' );
		
		$result = Weather_Block_API::get_weather_data( 'London,UK', 'metric' );
		
		$this->assertInstanceOf( 'WP_Error', $result );
		$this->assertEquals( 'missing_api_key', $result->get_error_code() );
	}

	/**
	 * Test weather data retrieval with empty location.
	 */
	public function test_get_weather_data_empty_location() {
		$result = Weather_Block_API::get_weather_data( '', 'metric' );
		
		$this->assertInstanceOf( 'WP_Error', $result );
		$this->assertEquals( 'invalid_location', $result->get_error_code() );
	}
}