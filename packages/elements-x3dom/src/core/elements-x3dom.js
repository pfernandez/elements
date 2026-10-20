/** X3DOM loading strategy (x3dom-full always)
 *
 * Goals:
 * - Keep the consumer experience simple: users import node helpers from
 *   @pfern/elements-x3dom only.
 * - Avoid loading heavy 3D code for apps that never use X3D.
 *
 * Implementation:
 * - When an X3D scene connects to this document, load vendor `x3dom-full.js` + `x3dom.css`
 *   via DOM injection.
 *
 * Rationale:
 * - Loading `x3dom.js` first and then upgrading to `x3dom-full.js` later can
 *   blank the canvas in some environments because `x3dom-full.js` replaces the
 *   global `x3dom` object. This package prefers correctness and stability over
 *   the smallest initial payload.
 */

let canvas2dPatched = false

const patchCanvas2DWillReadFrequentlyOnce = window => {
  if (canvas2dPatched) return
  canvas2dPatched = true

  // TODO(upstream): Submit a PR to X3DOM so its Text texture/mipmap pipeline
  // requests `getContext('2d', { willReadFrequently: true })` when it relies on
  // repeated `getImageData()` readbacks (avoids Chrome warning + can improve
  // performance).
  const Canvas = window.HTMLCanvasElement
  const originalGetContext = Canvas?.prototype?.getContext
  if (typeof originalGetContext !== 'function') return

  Canvas.prototype.getContext = function (type, attrs, ...rest) {
    const shouldConsiderPatching =
      type === '2d'
      && (attrs === undefined || (typeof attrs === 'object' && attrs !== null))
      && !(attrs && 'willReadFrequently' in attrs)

    if (shouldConsiderPatching) {
      // Chrome warning:
      //   "Canvas2D: Multiple readback operations using getImageData are faster
      //    with the willReadFrequently attribute set to true"
      //
      // X3DOM’s <Text> implementation uploads mipmaps by repeatedly calling
      // `getImageData()` on a 2D canvas. Hint the browser to optimize for that.
      const stack = (() => {
        try { return new Error().stack || '' }
        catch { return '' }
      })()

      const isLikelyX3DOMTextPath =
        stack.includes('uploadTextMipmap')
        || stack.includes('x3dom-full.js')
        || stack.includes('x3dom.js')

      if (isLikelyX3DOMTextPath) {
        const nextAttrs =
          attrs
            ? { ...attrs, willReadFrequently: true }
            : { willReadFrequently: true }

        try { return originalGetContext.call(this, type, nextAttrs, ...rest) }
        catch { /* fallback below */ }
      }
    }

    return originalGetContext.call(this, type, attrs, ...rest)
  }
}

// Observe the document, not its replaceable head/body. No runtime resources are
// requested until a scene is connected; vnode construction remains ordinary data.
const assets = new WeakMap()
const cssUrl = new URL('../../vendor/x3dom.css', import.meta.url).href
const fullUrl = new URL('../../vendor/x3dom-full.js', import.meta.url).href

const asset = (document, tag, attribute, url) => {
  const existing = document.querySelector(`${tag}[${attribute}="${url}"]`)
  const node = existing || document.createElement(tag)
  let ready = assets.get(node)
  if (!ready) {
    ready = existing && tag === 'link' && existing.sheet ? Promise.resolve()
      : new Promise((resolve, reject) => {
        node.addEventListener('load', resolve, { once: true })
        node.addEventListener('error', reject, { once: true })
      })
    assets.set(node, ready)
  }
  if (!existing) {
    tag === 'link' ? node.setAttribute('rel', 'stylesheet')
      : node.setAttribute('defer', '')
    node.setAttribute(attribute, url)
    document.head.appendChild(node)
  }
  return { node, ready }
}

const watchDocument = document => {
  const window = document.defaultView
  if (!window?.MutationObserver) return
  let connected = new WeakSet()
  let stylesheet = null, script = null, revision = 0
  const sync = () => {
    const scenes = Array.from(document.querySelectorAll('x3d'))
    const added = scenes.some(scene => !connected.has(scene))
    connected = new WeakSet(scenes)
    if (!scenes.length) {
      stylesheet = script = null
      revision++
      return
    }
    if (!document.head) return
    patchCanvas2DWillReadFrequentlyOnce(window)
    const css = asset(document, 'link', 'href', cssUrl)
    const js = window.x3dom?.reload ? null : asset(document, 'script', 'src', fullUrl)
    if (!added && stylesheet === css.node && script === js?.node) return
    stylesheet = css.node
    script = js?.node
    const current = ++revision
    Promise.all([css.ready, js?.ready]).then(() => {
      if (current !== revision || !document.querySelector('x3d')) return
      // The vendor skips scenes it has already initialized, including moves.
      window.x3dom?.reload()
    }).catch(error => {
      if (current === revision) console.warn('x3dom failed to load', error)
    })
  }
  new window.MutationObserver(sync).observe(document, { childList: true, subtree: true })
  sync()
}

// Importing the vocabulary installs connection detection, not the 3D runtime.
if (typeof document !== 'undefined') watchDocument(document)
