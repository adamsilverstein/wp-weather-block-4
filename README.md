# Weather Block

A comprehensive WordPress block for displaying weather information from OpenWeatherMap API with customizable location, units, and display options.

## Features

- 🌤️ **Real-time Weather Data**: Display current weather conditions from OpenWeatherMap API
- 🎨 **Customizable Display**: Choose between current weather and extended information modes
- 🌍 **Global Support**: Support for any location worldwide (city names, coordinates, etc.)
- 📏 **Multiple Units**: Temperature in Celsius, Fahrenheit, or Kelvin
- 🎯 **Smart Caching**: 15-minute caching to optimize API calls and performance
- ♿ **Accessibility**: Full ARIA support and keyboard navigation
- 🌓 **Theme Integration**: Automatic dark/light theme detection
- 📱 **Responsive Design**: Optimized for all screen sizes
- 🔧 **Developer Friendly**: RESTful API, hooks, and extensible architecture
- 🌐 **Translation Ready**: Full internationalization support

## Requirements

- WordPress 6.7 or higher
- PHP 7.4 or higher
- OpenWeatherMap API key (free tier available)

## Installation

### From WordPress Plugin Directory (Recommended)
1. Go to **Plugins > Add New** in your WordPress admin
2. Search for "Weather Block"
3. Click **Install Now** and then **Activate**

### Manual Installation
1. Download the latest release from the [GitHub releases page](https://github.com/yourusername/weather-block/releases)
2. Upload the plugin ZIP file through **Plugins > Add New > Upload Plugin**
3. Activate the plugin

### Development Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/weather-block.git
cd weather-block

# Install dependencies
npm install
composer install

# Build the plugin
npm run build:production
```

## Setup

### 1. Get an API Key
1. Sign up for a free account at [OpenWeatherMap](https://openweathermap.org/api)
2. Generate an API key (free tier includes 1,000 calls/day)

### 2. Configure the Plugin
1. Go to **Settings > Weather Block** in your WordPress admin
2. Enter your OpenWeatherMap API key
3. Click **Save Changes**
4. Use the **Test API Key** button to verify it's working

## Usage

### Adding a Weather Block

1. **In the Block Editor:**
   - Click the **+** button to add a new block
   - Search for "Weather" or "Weather Display"
   - Click on the Weather Block to add it

2. **Configure the Block:**
   - Enter a location (e.g., "London, UK" or "40.7128,-74.0060")
   - Choose temperature units (Celsius, Fahrenheit, or Kelvin)
   - Select display mode (Current or Extended)
   - Customize appearance options

### Display Modes

#### Current Mode
- Temperature and weather icon
- Location name and country
- Weather description
- Optional humidity display

#### Extended Mode
- Everything from Current mode plus:
- High/low temperatures
- "Feels like" temperature
- Atmospheric pressure
- Wind speed and direction
- Enhanced layout with detailed weather information

### Location Formats

The plugin accepts various location formats:

- **City names**: `London`, `New York`, `Tokyo`
- **City with country**: `London, UK`, `New York, NY`, `Paris, France`
- **Coordinates**: `40.7128,-74.0060`, `51.5074,-0.1278`
- **ZIP codes**: `10001, US`, `SW1A 1AA, UK`

## Customization

### Block Settings

- **Location**: Enter any supported location format
- **Temperature Units**: Celsius (°C), Fahrenheit (°F), or Kelvin (K)
- **Display Mode**: Current weather only or Extended information
- **Display Options**: Toggle weather icon, humidity, pressure, and wind
- **Appearance**: Custom background color, text color, and border radius

### WordPress Customizer Support

The block integrates with WordPress theme customization:

- Respects theme color schemes
- Automatic dark/light mode detection
- Typography inheritance from theme
- Responsive design adapts to theme breakpoints

## Developer Guide

### Architecture

The plugin follows WordPress best practices and modern development standards:

- **PHP Backend**: Object-oriented architecture with proper namespacing
- **React Frontend**: Modern JavaScript using WordPress components
- **REST API**: Custom endpoints for weather data
- **Caching System**: Smart caching to optimize API usage
- **Internationalization**: Full i18n support with translation files

### Directory Structure

```
weather-block/
├── admin/                     # Admin interface
│   ├── class-weather-block-admin.php
│   └── views/
│       └── settings-page.php
├── build/                     # Production build files
├── includes/                  # Core PHP classes
│   ├── class-weather-api.php
│   ├── class-weather-cache.php
│   └── class-weather-rest-controller.php
├── languages/                 # Translation files
├── src/                       # Source files
│   └── weather-block/
│       ├── block.json
│       ├── edit.js
│       ├── index.js
│       ├── render.php
│       ├── save.js
│       ├── style.scss
│       ├── editor.scss
│       └── view.js
├── tests/                     # Test files
└── weather-block.php          # Main plugin file
```

### Available Scripts

```bash
# Development
npm run start                  # Start development server
npm run build                  # Build for production
npm run build:production       # Build with translations

# Testing
npm run test:unit              # Run Jest unit tests
npm run test:php               # Run PHPUnit tests
npm run test:e2e:standalone    # Run Playwright visual tests
npm run test:all              # Run all tests

# Code Quality
npm run lint:js               # Lint JavaScript
npm run lint:css              # Lint CSS
npm run lint:php              # Lint PHP
npm run format                # Format code
npm run validate              # Run all linting

# Internationalization
npm run makepot               # Generate translation template
npm run makejson              # Generate JavaScript translations
npm run i18n                  # Complete i18n workflow

# Distribution
npm run build:zip             # Create plugin ZIP file
npm run clean                 # Clean build artifacts
```

### REST API Endpoints

The plugin provides REST API endpoints for programmatic access:

#### Get Weather Data
```http
GET /wp-json/weather-block/v1/weather?location=London&units=metric
```

**Parameters:**
- `location` (required): Location to get weather for
- `units` (optional): Temperature units (metric, imperial, kelvin)

**Response:**
```json
{
  "location": {
    "name": "London",
    "country": "GB"
  },
  "temperature": {
    "current": 20.5,
    "feels_like": 19.2,
    "min": 18.0,
    "max": 23.0
  },
  "weather": {
    "main": "Clouds",
    "description": "partly cloudy",
    "icon": "02d",
    "icon_url": "https://openweathermap.org/img/wn/02d@2x.png"
  },
  "humidity": 65,
  "pressure": 1013,
  "wind": {
    "speed": 3.5,
    "deg": 180
  },
  "cache_info": {
    "cached": false
  }
}
```

#### Cache Management (Admin only)
```http
# Get cache statistics
GET /wp-json/weather-block/v1/cache/stats

# Clear all cached data
DELETE /wp-json/weather-block/v1/cache/clear

# Test API key
GET /wp-json/weather-block/v1/test-api-key
```

### Hooks and Filters

#### Actions
```php
// Fired after weather data is fetched
do_action('weather_block_data_fetched', $weather_data, $location, $units);

// Fired when cache is cleared
do_action('weather_block_cache_cleared', $cleared_count);
```

#### Filters
```php
// Modify weather data before display
$weather_data = apply_filters('weather_block_weather_data', $weather_data, $location, $units);

// Modify cache duration (default: 15 minutes)
$cache_duration = apply_filters('weather_block_cache_duration', 15 * MINUTE_IN_SECONDS);

// Modify API request timeout (default: 10 seconds)
$timeout = apply_filters('weather_block_api_timeout', 10);
```

### Custom Styling

#### CSS Classes
```css
/* Main block container */
.wp-block-weather-block-weather-display {}

/* Weather block content */
.weather-block {}
.weather-block-current {}
.weather-block-extended {}

/* Block states */
.weather-block-loading {}
.weather-block-error {}
.weather-block-placeholder {}

/* Content sections */
.weather-block-content {}
.weather-icon {}
.weather-main {}
.weather-location {}
.weather-temperature {}
.weather-description {}
.weather-details {}
.weather-detail {}

/* Interactive elements */
.weather-refresh-button {}
.weather-block:focus {}
```

#### CSS Variables
```css
.weather-block {
  /* Theme integration */
  --weather-bg: var(--wp--preset--color--background, #ffffff);
  --weather-text: var(--wp--preset--color--foreground, #000000);
  
  /* Responsive breakpoints */
  --weather-mobile-breakpoint: 480px;
  --weather-tablet-breakpoint: 768px;
}
```

## Testing

The plugin includes comprehensive test coverage:

### Unit Tests (Jest)
- React component testing
- JavaScript functionality
- User interaction scenarios
- API integration mocking

### Visual Regression Tests (Playwright)
- Block appearance across different states
- Responsive design verification
- Theme compatibility testing
- Accessibility compliance

### PHP Tests (PHPUnit)
- API integration testing
- Cache functionality
- WordPress integration
- Error handling

### Running Tests

```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test:unit              # JavaScript unit tests
npm run test:php               # PHP unit tests
npm run test:e2e:standalone    # Visual regression tests

# Generate coverage reports
npm run test:unit -- --coverage
npm run test:php-coverage
```

## Performance

### Caching Strategy
- Weather data is cached for 15 minutes
- Separate cache entries for each location/units combination
- Automatic cache cleanup and management
- Cache statistics available in admin

### API Usage Optimization
- Debounced API calls in the editor
- Cached responses reduce API calls
- Error handling prevents unnecessary requests
- Rate limiting protection

### Frontend Performance
- Minified JavaScript and CSS
- Lazy loading for weather icons
- Responsive images with proper sizing
- Optimized DOM structure

## Accessibility

The plugin follows WCAG 2.1 AA guidelines:

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and roles
- **Focus Management**: Visible focus indicators
- **Color Contrast**: Meets contrast requirements
- **Semantic HTML**: Proper heading structure
- **Language Support**: Full internationalization

## Browser Support

- Chrome/Chromium 70+
- Firefox 65+
- Safari 12+
- Edge 79+
- Mobile browsers with ES6 support

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/yourusername/weather-block.git
cd weather-block

# Install dependencies
npm install
composer install

# Start development
npm run start

# Run tests before submitting
npm run validate
npm run test:all
```

### Coding Standards

- **PHP**: WordPress Coding Standards
- **JavaScript**: WordPress JavaScript Coding Standards
- **CSS**: WordPress CSS Coding Standards
- **Accessibility**: WCAG 2.1 AA compliance

## Changelog

### 0.1.0 (2025-07-29)
- Initial release
- Complete weather block functionality
- OpenWeatherMap API integration
- Responsive design and accessibility
- Comprehensive testing suite
- Full internationalization support

## Support

- **Documentation**: [Plugin Documentation](https://github.com/yourusername/weather-block/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/weather-block/issues)
- **WordPress Support**: [WordPress.org Support Forums](https://wordpress.org/support/plugin/weather-block/)
- **Email**: support@yourwebsite.com

## License

This plugin is licensed under the [GPL v2 or later](https://www.gnu.org/licenses/gpl-2.0.html).

## Credits

- **OpenWeatherMap**: Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- **WordPress**: Built for the [WordPress](https://wordpress.org/) platform
- **Contributors**: See [CONTRIBUTORS.md](CONTRIBUTORS.md) for a full list

---

**Made with ❤️ for the WordPress community**