/** X3DOM loading strategy (Option B: core-first + full fallback)
 *
 * Goals:
 * - Keep the consumer experience simple: users import node helpers from
 *   @pfern/elements only.
 * - Avoid loading heavy 3D code for apps that never use X3D.
 * - Avoid loading the full X3DOM distribution unless it is actually needed.
 *
 * Implementation:
 * - On first use of any 3D helper, load vendor `x3dom.js` + `x3dom.css` via DOM
 *   injection.
 * - When a helper is called for a node that is not registered after loading
 *   core, load vendor `x3dom-full.js` (same pinned version) and then reload the
 *   scene.
 */

let x3domCorePromise = null
let x3domFullPromise = null
let x3domLoadedFull = false
let x3domLoadFailed = false

const getHead = () =>
  document?.head || document?.documentElement || null

const injectStyleTextOnce = (id, cssText) => {
  const head = getHead()
  if (!head) return
  if (!document?.querySelector?.(`style[data-x3dom="${id}"]`)) {
    const style = document.createElement('style')
    style.setAttribute('data-x3dom', id)
    style.textContent = cssText
    head.appendChild(style)
  }
}

const injectScriptTextOnce = (id, jsText) => {
  const head = getHead()
  if (!head) return
  if (!document?.querySelector?.(`script[data-x3dom="${id}"]`)) {
    const script = document.createElement('script')
    script.setAttribute('data-x3dom', id)
    script.text = jsText
    head.appendChild(script)
  }
}

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

const shutdownX3DOMCanvases = x3dom => {
  try {
    const canvases = x3dom?.canvases
    if (!Array.isArray(canvases) || canvases.length === 0) return
    if (!canvases[0]?.doc) return
    for (let i = 0; i < canvases.length; i++) {
      const c = canvases[i]
      c?.doc?.shutdown?.(c?.gl)
    }
    x3dom.canvases = []
  } catch (err) {
    console.warn('x3dom canvas shutdown failed', err)
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

const ensureX3DOMCore = () => {
  if (typeof window === 'undefined' || x3domLoadFailed) return null
  if (getX3DOM()?.reload) return Promise.resolve(getX3DOM())
  if (x3domCorePromise) return x3domCorePromise

  x3domCorePromise = (async () => {
    // Loads assets via standard <link> and <script> tags.
    const loadViaUrl = async () => {
      const cssUrl = new URL(
        '../../vendor/x3dom.css',
        import.meta.url
      ).toString()
      const coreUrl = new URL(
        '../../vendor/x3dom.js',
        import.meta.url
      ).toString()
      await Promise.all([loadStyleOnce(cssUrl), loadScriptOnce(coreUrl)])
      return getX3DOM()
    }

    // If we are not running under a bundler (e.g. Vite), skip attempting
    // `?raw` imports. Node would treat those as normal module imports and load
    // the whole vendored bundle.
    if (!import.meta.env) return loadViaUrl()

    // Skip optimized loading on localhost to avoid browser MIME type error.
    if (import.meta.env.DEV) return loadViaUrl()

    // Attempt to inline assets to reduce the number of network requests
    // (Production only).
    try {
      const [{ default: cssText }, { default: jsText }] = await Promise.all([
        import('../../vendor/x3dom.css?raw'),
        import('../../vendor/x3dom.js?raw')
      ])
      injectStyleTextOnce('css', cssText)
      injectScriptTextOnce('core', jsText)
      return getX3DOM()
    } catch {
      // If inlining fails in production, fallback to the safe URL method
      return loadViaUrl()
    }
  })()
    .then(() => {
      reloadX3DOM()
      const x3dom = getX3DOM()
      x3dom && (x3dom.__elementsLoadedCore = true)
      globalThis.__elementsX3domLoadedCore = true
      return x3dom
    })
    .catch(err => {
      x3domLoadFailed = true
      console.warn('x3dom core failed to load', err)
      return null
    })

  return x3domCorePromise
}

const ensureX3DOMFull = async () => {
  if (typeof window === 'undefined' || x3domLoadFailed) return null
  await ensureX3DOMCore()
  if (x3domFullPromise) return x3domFullPromise
  x3domLoadedFull = true

  // `x3dom-full.js` defines `var x3dom = ...` and replaces the global object.
  // Before loading it, explicitly shut down any existing canvases created by
  // the core build to avoid WebGL context leaks.
  shutdownX3DOMCanvases(getX3DOM())

  const fullUrl =
    new URL('../../vendor/x3dom-full.js', import.meta.url).toString()
  x3domFullPromise = (async () => {
    if (!import.meta.env) {
      await loadScriptOnce(fullUrl)
      return getX3DOM()
    }

    try {
      const { default: jsText } = await import('../../vendor/x3dom-full.js?raw')
      injectScriptTextOnce('full', jsText)
      return getX3DOM()
    } catch {
      await loadScriptOnce(fullUrl)
      return getX3DOM()
    }
  })()
    .then(() => {
      reloadX3DOM()
      const x3dom = getX3DOM()
      // Provide a stable, consumer-visible signal for demos/apps that want to
      // know whether the full bundle has been loaded.
      //
      // Note: `x3dom-full.js` replaces the global `x3dom` object, so we set the
      // flag both on `x3dom` *and* on `globalThis` for stability.
      x3dom && (x3dom.__elementsLoadedFull = true)
      globalThis.__elementsX3domLoadedFull = true
      return x3dom
    })
    .catch(err => {
      console.warn('x3dom full failed to load', err)
      return getX3DOM()
    })

  return x3domFullPromise
}

const ensureX3DOMForTag = async tag => {
  const x3dom = await ensureX3DOMCore()
  if (x3dom) {
    if (tag === 'x3d') return x3dom

    // Reloads in case an element is removed and re-added to the DOM.
    scheduleReloadX3DOM()

    const hasNode = !!x3dom?.nodeTypesLC?.[String(tag).toLowerCase()]
    if (hasNode) return x3dom

    if (!x3domLoadedFull && typeof process !== 'undefined'
      && process?.env?.NODE_ENV !== 'production') {
      console.warn(
        `[elements] Loading x3dom-full.js because <${tag}> is not present `
          + 'in core x3dom.js'
      )
    }
    const full = ensureX3DOMFull()

    // In practice, DOM insertion timing + lazy X3DOM parsing means a single
    // reload can happen “too early”. After x3dom-full loads, schedule another
    // reload on the next frame to ensure newly-supported tags are parsed.
    //
    // This is especially important in dev where components can re-render
    // frequently and full-only nodes (e.g. <disk2d>) should “just appear”.
    full?.then?.(() => scheduleReloadX3DOM())

    return full
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
