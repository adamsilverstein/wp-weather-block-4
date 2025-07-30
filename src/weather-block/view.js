/**
 * Frontend interactivity for the Weather Block.
 *
 * This file handles dynamic frontend interactions like theme switching,
 * auto-refresh functionality, and enhanced accessibility features.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/#view-script
 */

/* global ResizeObserver */

( function () {
	'use strict';

	// Initialize when DOM is ready
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', initWeatherBlocks );
	} else {
		initWeatherBlocks();
	}

	/**
	 * Initialize all weather blocks on the page.
	 */
	function initWeatherBlocks() {
		const weatherBlocks = document.querySelectorAll(
			'.wp-block-weather-block-weather-display .weather-block'
		);

		weatherBlocks.forEach( ( block ) => {
			// Add enhanced accessibility
			enhanceAccessibility( block );

			// Add theme preference detection
			handleThemePreferences( block );

			// Add refresh functionality if needed
			addRefreshFunctionality( block );

			// Add keyboard navigation
			addKeyboardNavigation( block );
		} );
	}

	/**
	 * Enhance accessibility features for the weather block.
	 *
	 * @param {Element} block The weather block element.
	 */
	function enhanceAccessibility( block ) {
		// Add ARIA labels for better screen reader support
		const temperature = block.querySelector( '.temperature-current' );
		if ( temperature ) {
			const value = temperature.textContent.trim();
			temperature.setAttribute(
				'aria-label',
				`Current temperature: ${ value }`
			);
		}

		// Add ARIA labels to weather details
		const details = block.querySelectorAll( '.weather-detail' );
		details.forEach( ( detail ) => {
			const label = detail.querySelector( '.detail-label' );
			const value = detail.querySelector( '.detail-value' );

			if ( label && value ) {
				const labelText = label.textContent.trim();
				const valueText = value.textContent.trim();
				detail.setAttribute(
					'aria-label',
					`${ labelText } ${ valueText }`
				);
			}
		} );

		// Add semantic structure for location
		const location = block.querySelector( '.weather-location h3' );
		if ( location ) {
			location.setAttribute( 'role', 'heading' );
			location.setAttribute( 'aria-level', '3' );
		}
	}

	/**
	 * Handle theme preferences and color scheme changes.
	 *
	 * @param {Element} block The weather block element.
	 */
	function handleThemePreferences( block ) {
		// Listen for system theme changes
		if ( window.matchMedia ) {
			const darkModeQuery = window.matchMedia(
				'(prefers-color-scheme: dark)'
			);

			// Apply initial theme
			updateBlockTheme( block, darkModeQuery.matches );

			// Listen for changes
			darkModeQuery.addEventListener( 'change', ( e ) => {
				updateBlockTheme( block, e.matches );
			} );
		}
	}

	/**
	 * Update block theme based on preferences.
	 *
	 * @param {Element} block  The weather block element.
	 * @param {boolean} isDark Whether dark mode is preferred.
	 */
	function updateBlockTheme( block, isDark ) {
		// Only apply if block doesn't have custom colors
		if (
			! block.classList.contains( 'has-background' ) &&
			! block.classList.contains( 'has-text-color' )
		) {
			if ( isDark ) {
				block.style.setProperty( '--weather-bg', '#1a1a1a' );
				block.style.setProperty( '--weather-text', '#ffffff' );
				block.style.setProperty(
					'--weather-text-contrast',
					'rgba(255, 255, 255, 0.1)'
				);
				block.style.setProperty(
					'--weather-border-light',
					'rgba(255, 255, 255, 0.05)'
				);
			} else {
				block.style.setProperty( '--weather-bg', '#ffffff' );
				block.style.setProperty( '--weather-text', '#212529' );
				block.style.setProperty(
					'--weather-text-contrast',
					'rgba(0, 0, 0, 0.1)'
				);
				block.style.setProperty(
					'--weather-border-light',
					'rgba(0, 0, 0, 0.05)'
				);
			}
		}
	}

	/**
	 * Add refresh functionality for weather data.
	 *
	 * @param {Element} block The weather block element.
	 */
	function addRefreshFunctionality( block ) {
		// Create refresh button if not in error state
		if (
			! block.classList.contains( 'weather-block-error' ) &&
			! block.classList.contains( 'weather-block-placeholder' )
		) {
			const refreshButton = document.createElement( 'button' );
			refreshButton.className = 'weather-refresh-button';
			refreshButton.innerHTML = '↻';
			refreshButton.setAttribute( 'aria-label', 'Refresh weather data' );
			refreshButton.setAttribute( 'title', 'Refresh weather data' );

			// Style the refresh button
			Object.assign( refreshButton.style, {
				position: 'absolute',
				top: '10px',
				right: '10px',
				background: 'rgba(0, 0, 0, 0.1)',
				border: 'none',
				borderRadius: '50%',
				width: '30px',
				height: '30px',
				cursor: 'pointer',
				fontSize: '16px',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				opacity: '0',
				transition: 'opacity 0.2s ease',
				zIndex: '10',
			} );

			// Show on block hover
			block.addEventListener( 'mouseenter', () => {
				refreshButton.style.opacity = '1';
			} );

			block.addEventListener( 'mouseleave', () => {
				refreshButton.style.opacity = '0';
			} );

			// Add click handler
			refreshButton.addEventListener( 'click', ( e ) => {
				e.preventDefault();
				refreshWeatherData( block, refreshButton );
			} );

			block.style.position = 'relative';
			block.appendChild( refreshButton );
		}
	}

	/**
	 * Refresh weather data for a block.
	 *
	 * @param {Element} block  The weather block element.
	 * @param {Element} button The refresh button element.
	 */
	function refreshWeatherData( block, button ) {
		// Add loading state
		button.style.transform = 'rotate(360deg)';
		button.style.transition = 'transform 1s ease';
		button.disabled = true;

		// Reset after animation
		setTimeout( () => {
			button.style.transform = 'rotate(0deg)';
			button.disabled = false;
		}, 1000 );

		// Show feedback to user
		const updatedElement = block.querySelector( '.weather-updated small' );
		if ( updatedElement ) {
			const originalText = updatedElement.textContent;
			updatedElement.textContent = 'Refreshing...';

			setTimeout( () => {
				updatedElement.textContent = originalText;
			}, 1000 );
		}

		// In a real implementation, you would make an API call here
		// For now, we just provide visual feedback
		// eslint-disable-next-line no-console
		console.log( 'Weather data refresh requested for block:', block );
	}

	/**
	 * Add keyboard navigation support.
	 *
	 * @param {Element} block The weather block element.
	 */
	function addKeyboardNavigation( block ) {
		// Make the block focusable
		if ( ! block.hasAttribute( 'tabindex' ) ) {
			block.setAttribute( 'tabindex', '0' );
		}

		// Add keyboard event listener
		block.addEventListener( 'keydown', ( e ) => {
			// Handle Enter and Space for refresh functionality
			if (
				( e.key === 'Enter' || e.key === ' ' ) &&
				e.target === block
			) {
				const refreshButton = block.querySelector(
					'.weather-refresh-button'
				);
				if ( refreshButton && ! refreshButton.disabled ) {
					e.preventDefault();
					refreshButton.click();
				}
			}
		} );

		// Add focus styles
		block.addEventListener( 'focus', () => {
			block.style.outline = '2px solid #007cba';
			block.style.outlineOffset = '2px';
		} );

		block.addEventListener( 'blur', () => {
			block.style.outline = 'none';
		} );
	}

	/**
	 * Handle responsive text scaling based on container size.
	 */
	function handleResponsiveScaling() {
		const weatherBlocks = document.querySelectorAll( '.weather-block' );

		const resizeObserver = new ResizeObserver( ( entries ) => {
			entries.forEach( ( entry ) => {
				const block = entry.target;
				const width = entry.contentRect.width;

				// Adjust font sizes based on container width
				if ( width < 300 ) {
					block.classList.add( 'weather-compact' );
				} else {
					block.classList.remove( 'weather-compact' );
				}
			} );
		} );

		weatherBlocks.forEach( ( block ) => {
			resizeObserver.observe( block );
		} );
	}

	// Initialize responsive scaling if ResizeObserver is supported
	if ( window.ResizeObserver ) {
		handleResponsiveScaling();
	}

	// Expose initialization function for dynamic content
	window.initWeatherBlocks = initWeatherBlocks;
} )();
