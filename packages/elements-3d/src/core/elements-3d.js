/** X3DOM loading strategy (x3dom-full always)
 *
 * Goals:
 * - Keep the consumer experience simple: users import node helpers from
 *   @pfern/elements-3d only.
 * - Avoid loading heavy 3D code for apps that never use X3D.
 *
 * Implementation:
 * - On first use of any 3D helper, load vendor `x3dom-full.js` + `x3dom.css`
 *   via DOM injection.
 *
 * Rationale:
 * - Loading `x3dom.js` first and then upgrading to `x3dom-full.js` later can
 *   blank the canvas in some environments because `x3dom-full.js` replaces the
 *   global `x3dom` object. This package prefers correctness and stability over
 *   the smallest initial payload.
 */

let x3domPromise = null
let x3domLoadFailed = false

const getHead = () =>
  document?.head || document?.documentElement || null

const loadStyleOnce = href => {
  const head = getHead()
  if (!head
    || document?.querySelector?.(`link[rel="stylesheet"][href="${href}"]`)) {
    return Promise.resolve()
  }
  return new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.onload = () => resolve()
    link.onerror = err => reject(err)
    head.appendChild(link)
  })
}

const loadScriptOnce = src => {
  const head = getHead()
  if (!head || document?.querySelector?.(`script[src="${src}"]`)) {
    return Promise.resolve()
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.defer = true
    script.onload = () => resolve()
    script.onerror = err => reject(err)
    head.appendChild(script)
  })
}

const getX3DOM = () => globalThis?.x3dom || null

const reloadX3DOM = () => {
  try {
    getX3DOM()?.reload?.()
  } catch (err) {
    console.warn('x3dom.reload() failed', err)
  }
}

let reloadScheduled = false
const scheduleReloadX3DOM = () => {
  if (reloadScheduled) return
  reloadScheduled = true
  window?.requestAnimationFrame?.(() => {
    reloadScheduled = false
    reloadX3DOM()
  })
}

const ensureX3DOM = () => {
  if (typeof window === 'undefined' || x3domLoadFailed) return null
  if (getX3DOM()?.reload) return Promise.resolve(getX3DOM())
  if (x3domPromise) return x3domPromise

  x3domPromise = (async () => {
    // Load assets via standard <link> and <script> tags (works across tools).
    //
    // Note: Avoid dynamic-importing CSS, since some dev servers may serve it as
    // `text/css` even when requested as an ESM module, which triggers strict
    // MIME type errors in the browser console.
    const cssUrl = new URL(
      '../../vendor/x3dom.css',
      import.meta.url
    ).toString()
    const fullUrl = new URL(
      '../../vendor/x3dom-full.js',
      import.meta.url
    ).toString()

    await Promise.all([loadStyleOnce(cssUrl), loadScriptOnce(fullUrl)])
    return getX3DOM()
  })()
    .then(() => {
      reloadX3DOM()
      const x3dom = getX3DOM()
      x3dom && (x3dom.__elementsLoadedFull = true)
      globalThis.__elementsX3domLoadedFull = true
      return x3dom
    })
    .catch(err => {
      x3domLoadFailed = true
      console.warn('x3dom failed to load', err)
      return null
    })

  return x3domPromise
}

const ensureX3DOMForTag = async tag => {
  const x3dom = await ensureX3DOM()
  if (x3dom) {
    // Reloads in case an element is removed and re-added to the DOM.
    scheduleReloadX3DOM()
    return x3dom
  }
}

const isPropsObject = x =>
  typeof x === 'object'
  && x !== null
  && !Array.isArray(x)
  && !(typeof Node !== 'undefined' && x instanceof Node)

export const createTagHelper = tag => (...args) => {
  const hasFirstArg = args.length > 0
  const [propsOrChild, ...children] = args
  const props = hasFirstArg && isPropsObject(propsOrChild) ? propsOrChild : {}
  const actualChildren = !hasFirstArg
    ? []
    : props === propsOrChild
      ? children
      : [propsOrChild, ...children]
  return [tag, props, ...actualChildren]
}

export const withX3DOM = (tag, fn) => (...args) => {
  // Fire-and-forget: we want vnode creation to stay synchronous.
  // X3DOM will (re)parse after load via reloadX3DOM().
  ensureX3DOMForTag(tag)
  return fn(...args)
}
