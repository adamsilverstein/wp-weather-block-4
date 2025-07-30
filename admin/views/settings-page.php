<?php
/**
 * Admin settings page view for Weather Block.
 *
 * @package WeatherBlock
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Get current settings.
$api_key = get_option( 'weather_block_api_key', '' );
$cache_stats = Weather_Block_Cache::get_cache_stats();
?>

<div class="wrap">
	<h1><?php esc_html_e( 'Weather Block Settings', 'weather-block' ); ?></h1>

	<div class="weather-block-admin-container">
		<div class="weather-block-main-content">
			<form method="post" action="options.php">
				<?php
				settings_fields( 'weather_block_settings' );
				do_settings_sections( 'weather-block-settings' );
				?>

				<table class="form-table" role="presentation">
					<tbody>
						<tr>
							<th scope="row">
								<label for="weather_block_api_key">
									<?php esc_html_e( 'OpenWeatherMap API Key', 'weather-block' ); ?>
								</label>
							</th>
							<td>
								<input 
									type="password" 
									id="weather_block_api_key" 
									name="weather_block_api_key" 
									value="<?php echo esc_attr( $api_key ); ?>" 
									class="regular-text" 
									autocomplete="off"
								/>
								<button type="button" id="toggle-api-key" class="button button-secondary">
									<?php esc_html_e( 'Show', 'weather-block' ); ?>
								</button>
								<button type="button" id="test-api-key" class="button button-secondary" <?php disabled( empty( $api_key ) ); ?>>
									<?php esc_html_e( 'Test API Key', 'weather-block' ); ?>
								</button>
								
								<p class="description">
									<?php 
									printf(
										/* translators: %s: OpenWeatherMap signup URL */
										esc_html__( 'Enter your OpenWeatherMap API key. You can get a free API key from %s.', 'weather-block' ),
										'<a href="https://openweathermap.org/api" target="_blank" rel="noopener">OpenWeatherMap</a>'
									);
									?>
								</p>
								
								<div id="api-test-result" class="notice" style="display: none; margin-top: 10px;">
									<p id="api-test-message"></p>
								</div>
							</td>
						</tr>
					</tbody>
				</table>

				<?php submit_button(); ?>
			</form>
		</div>

		<div class="weather-block-sidebar">
			<!-- Cache Management Card -->
			<div class="weather-block-card">
				<h3><?php esc_html_e( 'Cache Management', 'weather-block' ); ?></h3>
				
				<div class="weather-cache-stats">
					<p>
						<strong><?php esc_html_e( 'Cache Entries:', 'weather-block' ); ?></strong>
						<span id="cache-entries-count"><?php echo esc_html( $cache_stats['count'] ); ?></span>
					</p>
					<p>
						<strong><?php esc_html_e( 'Cache Size:', 'weather-block' ); ?></strong>
						<span id="cache-size"><?php echo esc_html( size_format( $cache_stats['size'] ) ); ?></span>
					</p>
				</div>

				<p class="description">
					<?php esc_html_e( 'Weather data is cached for 15 minutes to improve performance and reduce API calls.', 'weather-block' ); ?>
				</p>

				<button type="button" id="clear-cache" class="button button-secondary" <?php disabled( $cache_stats['count'] === 0 ); ?>>
					<?php esc_html_e( 'Clear Cache', 'weather-block' ); ?>
				</button>

				<div id="cache-result" class="notice" style="display: none; margin-top: 10px;">
					<p id="cache-message"></p>
				</div>
			</div>

			<!-- Usage Instructions Card -->
			<div class="weather-block-card">
				<h3><?php esc_html_e( 'How to Use', 'weather-block' ); ?></h3>
				
				<ol class="weather-usage-steps">
					<li><?php esc_html_e( 'Configure your API key above', 'weather-block' ); ?></li>
					<li><?php esc_html_e( 'Add the Weather Block to any post or page', 'weather-block' ); ?></li>
					<li><?php esc_html_e( 'Enter a location (city name, coordinates, etc.)', 'weather-block' ); ?></li>
					<li><?php esc_html_e( 'Choose temperature units (Celsius, Fahrenheit, Kelvin)', 'weather-block' ); ?></li>
					<li><?php esc_html_e( 'Select display mode (current weather or extended)', 'weather-block' ); ?></li>
				</ol>

				<p class="description">
					<?php esc_html_e( 'The block will automatically display current weather conditions with temperature, description, and weather icon.', 'weather-block' ); ?>
				</p>
			</div>

			<!-- API Information Card -->
			<div class="weather-block-card">
				<h3><?php esc_html_e( 'API Information', 'weather-block' ); ?></h3>
				
				<p>
					<strong><?php esc_html_e( 'Service:', 'weather-block' ); ?></strong>
					<a href="https://openweathermap.org/" target="_blank" rel="noopener">OpenWeatherMap</a>
				</p>
				
				<p>
					<strong><?php esc_html_e( 'Free Plan:', 'weather-block' ); ?></strong>
					<?php esc_html_e( '1,000 calls/day', 'weather-block' ); ?>
				</p>
				
				<p>
					<strong><?php esc_html_e( 'Cache Duration:', 'weather-block' ); ?></strong>
					<?php esc_html_e( '15 minutes', 'weather-block' ); ?>
				</p>

				<p class="description">
					<?php esc_html_e( 'Caching reduces API calls and improves performance. Each unique location/units combination is cached separately.', 'weather-block' ); ?>
				</p>
			</div>

			<!-- Plugin Information Card -->
			<div class="weather-block-card">
				<h3><?php esc_html_e( 'Plugin Information', 'weather-block' ); ?></h3>
				
				<p>
					<strong><?php esc_html_e( 'Version:', 'weather-block' ); ?></strong>
					<?php echo esc_html( WEATHER_BLOCK_VERSION ); ?>
				</p>
				
				<p>
					<strong><?php esc_html_e( 'REST API:', 'weather-block' ); ?></strong>
					<code><?php echo esc_html( rest_url( 'weather-block/v1/' ) ); ?></code>
				</p>

				<p class="description">
					<?php esc_html_e( 'The plugin provides REST API endpoints for programmatic access to weather data.', 'weather-block' ); ?>
				</p>
			</div>
		</div>
	</div>
</div>

<style>
.weather-block-admin-container {
	display: flex;
	gap: 20px;
	margin-top: 20px;
}

.weather-block-main-content {
	flex: 2;
}

.weather-block-sidebar {
	flex: 1;
	min-width: 300px;
}

.weather-block-card {
	background: #fff;
	border: 1px solid #ccd0d4;
	border-radius: 4px;
	padding: 20px;
	margin-bottom: 20px;
	box-shadow: 0 1px 1px rgba(0,0,0,.04);
}

.weather-block-card h3 {
	margin-top: 0;
	margin-bottom: 15px;
	font-size: 14px;
	font-weight: 600;
	text-transform: uppercase;
	color: #23282d;
}

.weather-cache-stats {
	background: #f9f9f9;
	border: 1px solid #e5e5e5;
	padding: 10px;
	border-radius: 3px;
	margin-bottom: 10px;
}

.weather-cache-stats p {
	margin: 5px 0;
}

.weather-usage-steps {
	padding-left: 20px;
}

.weather-usage-steps li {
	margin-bottom: 8px;
}

.notice.inline {
	display: inline-block;
	margin: 5px 0 0 0;
	padding: 5px 10px;
}

#api-test-result.notice-success {
	border-left-color: #46b450;
}

#api-test-result.notice-error {
	border-left-color: #dc3232;
}

#cache-result.notice-success {
	border-left-color: #46b450;
}

#cache-result.notice-error {
	border-left-color: #dc3232;
}

@media (max-width: 782px) {
	.weather-block-admin-container {
		flex-direction: column;
	}
	
	.weather-block-sidebar {
		min-width: auto;
	}
}
</style>

<script>
jQuery(document).ready(function($) {
	// Toggle API key visibility
	$('#toggle-api-key').on('click', function() {
		const $input = $('#weather_block_api_key');
		const $button = $(this);
		
		if ($input.attr('type') === 'password') {
			$input.attr('type', 'text');
			$button.text('<?php esc_html_e( 'Hide', 'weather-block' ); ?>');
		} else {
			$input.attr('type', 'password');
			$button.text('<?php esc_html_e( 'Show', 'weather-block' ); ?>');
		}
	});

	// Enable/disable test button when API key changes
	$('#weather_block_api_key').on('input', function() {
		const hasValue = $(this).val().trim().length > 0;
		$('#test-api-key').prop('disabled', !hasValue);
	});

	// Test API key
	$('#test-api-key').on('click', function() {
		const $button = $(this);
		const $result = $('#api-test-result');
		const $message = $('#api-test-message');
		
		$button.prop('disabled', true).text('<?php esc_html_e( 'Testing...', 'weather-block' ); ?>');
		$result.hide().removeClass('notice-success notice-error');
		
		$.post(ajaxurl, {
			action: 'weather_block_test_api',
			nonce: '<?php echo esc_js( wp_create_nonce( 'weather_block_admin_nonce' ) ); ?>'
		})
		.done(function(response) {
			if (response.success) {
				$result.addClass('notice-success');
				$message.html('<strong><?php esc_html_e( 'Success!', 'weather-block' ); ?></strong> ' + response.data.message);
				if (response.data.test_data) {
					$message.append('<br><small>' + 
						'<?php esc_html_e( 'Test location:', 'weather-block' ); ?> ' + response.data.test_data.location + ', ' +
						response.data.test_data.temperature + '°C, ' + response.data.test_data.description +
					'</small>');
				}
			} else {
				$result.addClass('notice-error');
				$message.html('<strong><?php esc_html_e( 'Error:', 'weather-block' ); ?></strong> ' + response.data.message);
			}
		})
		.fail(function() {
			$result.addClass('notice-error');
			$message.text('<?php esc_html_e( 'Failed to test API key. Please try again.', 'weather-block' ); ?>');
		})
		.always(function() {
			$button.prop('disabled', false).text('<?php esc_html_e( 'Test API Key', 'weather-block' ); ?>');
			$result.show();
		});
	});

	// Clear cache
	$('#clear-cache').on('click', function() {
		if (!confirm('<?php esc_html_e( 'Are you sure you want to clear all cached weather data?', 'weather-block' ); ?>')) {
			return;
		}
		
		const $button = $(this);
		const $result = $('#cache-result');
		const $message = $('#cache-message');
		
		$button.prop('disabled', true).text('<?php esc_html_e( 'Clearing...', 'weather-block' ); ?>');
		$result.hide().removeClass('notice-success notice-error');
		
		$.ajax({
			url: '<?php echo esc_js( rest_url( 'weather-block/v1/cache/clear' ) ); ?>',
			method: 'DELETE',
			beforeSend: function(xhr) {
				xhr.setRequestHeader('X-WP-Nonce', '<?php echo esc_js( wp_create_nonce( 'wp_rest' ) ); ?>');
			}
		})
		.done(function(response) {
			$result.addClass('notice-success');
			$message.text(response.message);
			$('#cache-entries-count').text('0');
			$('#cache-size').text('0 B');
			$button.prop('disabled', true);
		})
		.fail(function() {
			$result.addClass('notice-error');
			$message.text('<?php esc_html_e( 'Failed to clear cache. Please try again.', 'weather-block' ); ?>');
		})
		.always(function() {
			$button.text('<?php esc_html_e( 'Clear Cache', 'weather-block' ); ?>');
			$result.show();
		});
	});
});
</script>