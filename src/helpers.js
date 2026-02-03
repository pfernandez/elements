/**
 * Enable additional debug warnings.
 *
 * Set `process.env.ELEMENTSJS_DEBUG=true` (or `NODE_ENV=development`) to enable
 * warnings for common mistakes like passive event handler returns.
 */
export { DEBUG } from './core/elements.js'

/**
 * Wrap a recursive pure function so it participates in replacement updates.
 *
 * Call the returned function again with new arguments to compute the next UI.
 *
 * @template {any[]} Args
 * @param {(...args: Args) => any[]} fn
 * @returns {(...args: Args) => any[]}
 */
export { component } from './core/elements.js'

/**
 * A map of all HTML/SVG tag helpers (plus `fragment`).
 */
export { elements } from './core/elements.js'

/**
 * Render a vnode into the DOM.
 *
 * This is typically called once on page load. After that, events that return
 * vnodes perform replacement updates automatically.
 *
 * @param {any[]} vtree
 * @param {HTMLElement | null} [container]
 */
export { render } from './core/elements.js'

/**
 * Navigate to a URL path and update the window history object.
 *
 * This dispatches a `popstate` event after updating history so router-style
 * apps can react without additional plumbing.
 *
 * @param {string} [path]
 * @param {{ replace?: boolean }} [options]
 */
export const navigate = (path, { replace = false } = {}) => {
  if (typeof window !== 'undefined') {
    const url = new URL(path, window.location.origin)
    const isSame =
      url.pathname === window.location.pathname
      && url.search === window.location.search
      && url.hash === window.location.hash

    if (!isSame) {
      const fn = replace ? 'replaceState' : 'pushState'
      window.history[fn]({}, '', url)

      try {
        window.dispatchEvent(new PopStateEvent('popstate'))
      } catch {
        window.dispatchEvent(new Event('popstate'))
      }
    }
  }
}
