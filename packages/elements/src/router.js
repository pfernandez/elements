// Router utilities.
//
// `onNavigate(fn)` registers a callback that should re-render your app when the
// URL changes (via History API navigation or back/forward).
//
// The callback is invoked on a microtask after `popstate` so it can safely run
// outside of any current declarative event update.

import { navigate } from './helpers.js'

let current = null
let installed = false
let scheduled = false
let linkInstalled = false

const defer = fn =>
  typeof window.queueMicrotask === 'function'
    ? window.queueMicrotask(fn)
    : Promise.resolve().then(fn)

const schedule = () => {
  if (typeof current !== 'function') return
  if (scheduled) return
  scheduled = true
  defer(() => {
    scheduled = false
    typeof current === 'function' && current()
  })
}

const onPopState = () => schedule()

export const hasNavigateHandler = () => typeof current === 'function'

const isPlainLeftClick = event =>
  event?.button === 0
  && !event?.defaultPrevented
  && !event?.metaKey
  && !event?.ctrlKey
  && !event?.shiftKey
  && !event?.altKey

const isRoutableHref = href => {
  if (typeof href !== 'string') return false
  if (!href) return false
  if (href.startsWith('#')) return false
  if (typeof window === 'undefined') return false

  let url
  try { url = new URL(href, window.location.origin) }
  catch { return false }

  if (url.origin !== window.location.origin) return false

  // Avoid intercepting obvious non-router navigations.
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false

  return true
}

const shouldInterceptLink = (anchor, event) => {
  if (!hasNavigateHandler()) return false
  if (!isPlainLeftClick(event)) return false
  if (event?.cancelable === false) return false

  if (!anchor) return false
  if (typeof anchor.hasAttribute === 'function'
    && anchor.hasAttribute('data-elements-native'))
    return false

  const href =
    typeof anchor.getAttribute === 'function'
      ? anchor.getAttribute('href')
      : anchor?.href

  if (!isRoutableHref(href)) return false

  const target =
    typeof anchor.getAttribute === 'function'
      ? anchor.getAttribute('target')
      : anchor?.target

  if (target && target !== '_self') return false

  const download =
    typeof anchor.getAttribute === 'function'
      ? anchor.getAttribute('download')
      : anchor?.download

  if (download != null) return false

  return true
}

const onClick = event => {
  if (!hasNavigateHandler()) return
  const target = event?.target
  const anchor =
    typeof target?.closest === 'function'
      ? target.closest('a[href]')
      : null

  if (!shouldInterceptLink(anchor, event)) return

  const href =
    typeof anchor.getAttribute === 'function'
      ? anchor.getAttribute('href')
      : anchor?.href

  event.preventDefault()
  navigate(href)
}

export const onNavigate = (fn, { immediate = false } = {}) => {
  current = fn

  if (typeof window !== 'undefined' && !installed) {
    window.addEventListener('popstate', onPopState)
    installed = true
  }

  if (typeof window !== 'undefined' && !linkInstalled) {
    window.addEventListener('click', onClick)
    linkInstalled = true
  }

  immediate && schedule()

  return () => {
    if (current !== fn) return
    current = null

    if (typeof window !== 'undefined' && installed) {
      window.removeEventListener('popstate', onPopState)
      installed = false
    }

    if (typeof window !== 'undefined' && linkInstalled) {
      window.removeEventListener('click', onClick)
      linkInstalled = false
    }
  }
}
