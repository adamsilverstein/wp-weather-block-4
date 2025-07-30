<?php
/**
 * Server-side rendering for the Weather Block.
 *
 * @package WeatherBlock
 * 
 * @var array    $attributes Block attributes.
 * @var string   $content    Block default content.
 * @var WP_Block $block      Block instance.
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Get block attributes with defaults.
$location = $attributes['location'] ?? '';
$units = $attributes['units'] ?? 'metric';
$display_mode = $attributes['displayMode'] ?? 'current';
$show_humidity = $attributes['showHumidity'] ?? true;
$show_pressure = $attributes['showPressure'] ?? false;
$show_wind = $attributes['showWind'] ?? false;
$show_icon = $attributes['showIcon'] ?? true;
$background_color = $attributes['backgroundColor'] ?? '#f8f9fa';
$text_color = $attributes['textColor'] ?? '#212529';
$border_radius = $attributes['borderRadius'] ?? 8;

// If no location is set, show placeholder.
if ( empty( $location ) ) {
	$wrapper_attributes = get_block_wrapper_attributes( array(
		'class' => 'weather-block-placeholder',
		'style' => sprintf(
			'background-color: %s; color: %s; border-radius: %dpx; padding: 20px; text-align: center;',
			esc_attr( $background_color ),
			esc_attr( $text_color ),
			esc_attr( $border_radius )
		),
	) );
	
	return sprintf(
		'<div %s><p>%s</p></div>',
		$wrapper_attributes,
		esc_html__( 'Please enter a location to display weather information.', 'weather-block' )
	);
}

// Get weather data.
$weather_data = Weather_Block_API::get_weather_data( $location, $units );

// Handle API errors.
if ( is_wp_error( $weather_data ) ) {
	$wrapper_attributes = get_block_wrapper_attributes( array(
		'class' => 'weather-block-error',
		'style' => sprintf(
			'background-color: %s; color: %s; border-radius: %dpx; padding: 20px; border-left: 4px solid #dc3545;',
			esc_attr( $background_color ),
			esc_attr( $text_color ),
			esc_attr( $border_radius )
		),
	) );
	
	return sprintf(
		'<div %s><p><strong>%s</strong> %s</p></div>',
		$wrapper_attributes,
		esc_html__( 'Weather Error:', 'weather-block' ),
		esc_html( $weather_data->get_error_message() )
	);
}

// Prepare temperature unit symbol.
$temp_symbol = match ( $units ) {
	'imperial' => '°F',
	'kelvin' => 'K',
	default => '°C',
};

// Prepare wind speed unit.
$wind_unit = $units === 'imperial' ? 'mph' : 'm/s';

// Build CSS classes.
$css_classes = array(
	'weather-block',
	'weather-block-' . esc_attr( $display_mode ),
);

if ( $show_icon && ! empty( $weather_data['weather']['icon'] ) ) {
	$css_classes[] = 'has-weather-icon';
}

// Build inline styles.
$inline_styles = sprintf(
	'background-color: %s; color: %s; border-radius: %dpx;',
	esc_attr( $background_color ),
	esc_attr( $text_color ),
	esc_attr( $border_radius )
);

$wrapper_attributes = get_block_wrapper_attributes( array(
	'class' => implode( ' ', $css_classes ),
	'style' => $inline_styles,
) );

// Start building the output.
ob_start();
?>

<div <?php echo $wrapper_attributes; ?>>
	<div class="weather-block-content">
		<?php if ( $show_icon && ! empty( $weather_data['weather']['icon'] ) ) : ?>
			<div class="weather-icon">
				<img 
					src="<?php echo esc_url( Weather_Block_API::get_icon_url( $weather_data['weather']['icon'] ) ); ?>" 
					alt="<?php echo esc_attr( $weather_data['weather']['description'] ); ?>"
					width="50" 
					height="50"
				/>
			</div>
		<?php endif; ?>
		
		<div class="weather-main">
			<div class="weather-location">
				<h3><?php echo esc_html( $weather_data['location']['name'] ); ?></h3>
				<?php if ( ! empty( $weather_data['location']['country'] ) ) : ?>
					<span class="weather-country"><?php echo esc_html( $weather_data['location']['country'] ); ?></span>
				<?php endif; ?>
			</div>
			
			<div class="weather-temperature">
				<span class="temperature-current">
					<?php echo esc_html( round( $weather_data['temperature']['current'] ) . $temp_symbol ); ?>
				</span>
				
				<?php if ( $display_mode === 'extended' ) : ?>
					<div class="temperature-range">
						<span class="temperature-min">
							<?php 
							printf(
								/* translators: %s: minimum temperature */
								esc_html__( 'Low: %s', 'weather-block' ),
								esc_html( round( $weather_data['temperature']['min'] ) . $temp_symbol )
							);
							?>
						</span>
						<span class="temperature-max">
							<?php 
							printf(
								/* translators: %s: maximum temperature */
								esc_html__( 'High: %s', 'weather-block' ),
								esc_html( round( $weather_data['temperature']['max'] ) . $temp_symbol )
							);
							?>
						</span>
					</div>
					
					<div class="temperature-feels-like">
						<?php 
						printf(
							/* translators: %s: feels like temperature */
							esc_html__( 'Feels like %s', 'weather-block' ),
							esc_html( round( $weather_data['temperature']['feels_like'] ) . $temp_symbol )
						);
						?>
					</div>
				<?php endif; ?>
			</div>
			
			<div class="weather-description">
				<?php echo esc_html( ucfirst( $weather_data['weather']['description'] ) ); ?>
			</div>
		</div>
	</div>
	
	<?php if ( $display_mode === 'extended' && ( $show_humidity || $show_pressure || $show_wind ) ) : ?>
		<div class="weather-details">
			<?php if ( $show_humidity ) : ?>
				<div class="weather-detail">
					<span class="detail-label"><?php esc_html_e( 'Humidity:', 'weather-block' ); ?></span>
					<span class="detail-value"><?php echo esc_html( $weather_data['humidity'] . '%' ); ?></span>
				</div>
			<?php endif; ?>
			
			<?php if ( $show_pressure ) : ?>
				<div class="weather-detail">
					<span class="detail-label"><?php esc_html_e( 'Pressure:', 'weather-block' ); ?></span>
					<span class="detail-value"><?php echo esc_html( $weather_data['pressure'] . ' hPa' ); ?></span>
				</div>
			<?php endif; ?>
			
			<?php if ( $show_wind && ! empty( $weather_data['wind']['speed'] ) ) : ?>
				<div class="weather-detail">
					<span class="detail-label"><?php esc_html_e( 'Wind:', 'weather-block' ); ?></span>
					<span class="detail-value">
						<?php echo esc_html( round( $weather_data['wind']['speed'], 1 ) . ' ' . $wind_unit ); ?>
						<?php if ( ! empty( $weather_data['wind']['deg'] ) ) : ?>
							<?php 
							$wind_direction = weather_block_get_wind_direction( $weather_data['wind']['deg'] );
							echo esc_html( ' ' . $wind_direction );
							?>
						<?php endif; ?>
					</span>
				</div>
			<?php endif; ?>
		</div>
	<?php elseif ( $show_humidity && $display_mode === 'current' ) : ?>
		<div class="weather-humidity">
			<?php 
			printf(
				/* translators: %s: humidity percentage */
				esc_html__( 'Humidity: %s', 'weather-block' ),
				esc_html( $weather_data['humidity'] . '%' )
			);
			?>
		</div>
	<?php endif; ?>
	
	<div class="weather-updated">
		<small>
			<?php 
			printf(
				/* translators: %s: last updated time */
				esc_html__( 'Updated: %s', 'weather-block' ),
				esc_html( human_time_diff( $weather_data['updated_at'] ) . ' ' . __( 'ago', 'weather-block' ) )
			);
			?>
		</small>
	</div>
</div>

<?php

/**
 * Helper function to convert wind degree to direction.
 *
 * @param int $degree Wind direction in degrees.
 * @return string Wind direction abbreviation.
 */
function weather_block_get_wind_direction( int $degree ): string {
	$directions = array(
		'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
		'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
	);
	
	$index = round( $degree / 22.5 ) % 16;
	return $directions[ $index ];
}

return ob_get_clean();