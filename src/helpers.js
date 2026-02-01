export { DEBUG,
  component,
  elements,
  render } from './core/elements.js'

/**
 * Navigate to a URL path and update the window history object.
 * @param {string} [path] - The `pathname` to append to the destination URL.
 * @param {object} [options={}] - Configuration options (optional).
 * @param {boolean} [options.replace] - Replace rather than append to the full
 *                                      path.
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

