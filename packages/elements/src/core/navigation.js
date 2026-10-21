/** The native-link boundary shared by declarative events and optional routing. */
export const linkOf = el => el.closest?.('a[href]')
export const windowOf = node =>
  node?.ownerDocument ? node.ownerDocument.defaultView : globalThis.window

export const isPlainClick = event =>
  event?.button === 0 && !event.defaultPrevented && event.cancelable !== false
  && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey

export const navigationURL = (anchor, event) => {
  const document = anchor?.ownerDocument || globalThis.document
  const window = windowOf(anchor)
  const href = anchor?.getAttribute('href')
  const target = anchor?.getAttribute('target')
    ?? document?.querySelector?.('base[target]')?.getAttribute('target')
  const native = !isPlainClick(event) || !href || href.startsWith('#')
    || target && target !== '_self'
    || anchor?.hasAttribute('download')
    || anchor?.hasAttribute('data-elements-native')
  let url = null
  if (!native && window) {
    try {
      const candidate = new URL(href, document?.baseURI
        || window.location.href
        || `${window.location.origin}${window.location.pathname}`)
      if (candidate.origin === window.location.origin
          && /^https?:$/.test(candidate.protocol)) url = candidate
    } catch { /* Invalid URLs remain the browser's responsibility. */ }
  }
  return url
}
