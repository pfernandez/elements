/**
 * Environment-derived flag for application diagnostics.
 *
 * Set `process.env.ELEMENTSJS_DEBUG=true` (or `NODE_ENV=development`) to enable
 * this flag. Passive event returns are valid and do not produce warnings.
 */
export { DEBUG } from './core/elements.js'

/**
 * Create a state observer with a stable identity using `observe(describe)`.
 *
 * The observer describes a state and its event handlers as a vnode. Calls
 * construct observations; returning one from an event selects the next state
 * and updates that component wherever it is rendered. Use separate component
 * definitions for independent state. Source arrays remain unchanged.
 *
 * @example
 * const counter = observe((n = 0) =>
 *   button({ onclick: () => counter(n + 1) }, n))
 */
export { observe } from './core/elements.js'

/**
 * A map of all HTML/SVG tag helpers (plus `fragment`).
 */
export { elements } from './core/elements.js'

/**
 * Render a vnode into the DOM.
 *
 * This is typically called once on page load. After that, events that return
 * component vnodes update that component automatically; plain vnodes patch
 * the nearest boundary.
 *
 * `html`, `head`, and `body` roots may omit the container. Fragments have no
 * wrapper element. Use `{ replace: true }` to remount an ordinary container.
 *
 * @param {import('./core/types.js').ElementsVNode} vtree
 * @param {Element | null} [container]
 */
export { render } from './core/elements.js'

/**
 * Serialize a vnode tree to an HTML string (SSR/SSG).
 *
 * This is the “stringification” counterpart to `render()`: it walks the same
 * declarative vnode arrays and produces static HTML for build-time prerendering
 * or server-side rendering.
 *
 * @param {*} vnode
 * @returns {string}
 */
export { toHtmlString } from './ssr.js'
