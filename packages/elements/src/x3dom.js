// X3DOM replaces its global engine when the full bundle loads. Load it once
// when a scene connects, and keep the request if the page replaces its head.
const assets = new WeakMap()
const cssUrl = new URL('../vendor/x3dom.css', import.meta.url).href
const fullUrl = new URL('../vendor/x3dom-full.js', import.meta.url).href

// X3DOM 1.8.3 destroys a removed scene's backend, but leaves its flag, DOM
// controls and method wrappers behind. Reset only those vendor-owned pieces.
const resetScene = (scene, canvas) => {
  if (!canvas || scene.runtime) return
  const controls = [canvas.canvas, canvas.stateViewer?.viewer,
                    canvas.progressDiv, canvas.vrDiv]
  controls.forEach(node => node?.remove())
  const methods = ['setAttribute', 'addEventListener', 'removeEventListener']
  methods.forEach(name => {
    const original = scene[`__${name}`]
    if (original) scene[name] = original
    delete scene[`__${name}`]
  })
  delete scene.hasRuntime
}

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

export const watchDocument = document => {
  const window = document.defaultView
  if (!window?.MutationObserver) return
  let connected = new WeakSet()
  const initialized = new WeakMap()
  let engineLoad = null
  let stylesheet = null, script = null, revision = 0
  const sync = (mutations = []) => {
    const scenes = Array.from(document.querySelectorAll('x3d'))
    const hasRemovedScene = mutations.some(mutation =>
      Array.from(mutation.removedNodes).some(node =>
        node.localName === 'x3d' || node.querySelector?.('x3d')))
    const haveScenesChanged = hasRemovedScene
      || scenes.some(scene => !connected.has(scene))
    connected = new WeakSet(scenes)
    if (!scenes.length) {
      stylesheet = script = null
      revision++
      return
    }
    if (!document.head) return
    const css = asset(document, 'link', 'href', cssUrl)
    // A started script still executes if its old head is removed. Share that
    // request so head replacement cannot execute the vendor bundle twice.
    const js = window.x3dom?.reload ? null
      : engineLoad || (engineLoad = asset(document, 'script', 'src', fullUrl))
    if (!haveScenesChanged && stylesheet === css.node && script === js?.node)
      return
    if (stylesheet !== css.node)
      css.ready.catch(error => console.warn('x3dom stylesheet failed to load', error))
    stylesheet = css.node
    script = js?.node
    const current = ++revision
    // Styling must not gate runtime bookkeeping: X3DOM also initializes itself
    // when its script loads, even if the stylesheet request fails.
    Promise.resolve(js?.ready).then(() => {
      if (current !== revision || !document.querySelector('x3d')) return
      engineLoad = null
      const currentScenes = Array.from(document.querySelectorAll('x3d'))
      currentScenes.forEach(scene => resetScene(scene, initialized.get(scene)))
      window.x3dom?.reload()
      currentScenes.forEach(scene => {
        if (scene.runtime?.canvas) initialized.set(scene, scene.runtime.canvas)
      })
    }).catch(error => {
      if (current === revision) {
        engineLoad = null
        console.warn('x3dom failed to load', error)
      }
    })
  }
  new window.MutationObserver(sync).observe(document,
                                            { childList: true, subtree: true })
  sync()
}

// Importing the vocabulary installs connection detection, not the 3D runtime.
if (typeof document !== 'undefined') watchDocument(document)
