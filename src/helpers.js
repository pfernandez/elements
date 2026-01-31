export {
  DEBUG,
  component,
  elements,
  render
} from './core/elements.js'

export const navigate = (path, { replace = false } = {}) => {
  if (window) {
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

