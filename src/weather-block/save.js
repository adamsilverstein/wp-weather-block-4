/**
 * The save function is not used for this block as it uses server-side rendering.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */

/**
 * The save function defines the way in which the different attributes should
 * be combined into the final markup, which is then serialized by the block
 * editor into `post_content`.
 *
 * Since this block uses server-side rendering (render.php), we return null
 * to indicate that the block should be rendered on the server side rather
 * than saving static content to the database.
 *
 * This approach provides several benefits:
 * - Weather data is always fresh (not cached in post content)
 * - Block attributes control the server-side rendering
 * - API calls happen on page load, not when content is saved
 * - Better performance and caching strategies
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#save
 *
 * @return {null} Return null to use server-side rendering.
 */
export default function save() {
	// Return null to use server-side rendering via render.php
	// The block attributes are automatically passed to the render callback
	return null;
}
