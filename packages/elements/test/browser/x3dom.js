import { html, observe, project } from '@pfern/elements'
import { appearance, box, material, scene, shape, x3d } from '@pfern/elements-x3dom'

const assert = (condition, message) => { if (!condition) throw new Error(message) }
const delay = () => new Promise(resolve => setTimeout(resolve, 30))
const until = async (predicate, message) => {
  for (let i = 0; i < 100; i++) {
    if (predicate()) return
    await delay()
  }
  throw new Error(message)
}
const assets = () => document.querySelectorAll('script[src*="x3dom-full"], link[href*="x3dom"]')
const styles = () => document.querySelector('link[rel="stylesheet"][href*="x3dom"]')
const view = observe(() => x3d({ width: '100px', height: '100px' },
  scene(shape(appearance(material({ diffuseColor: '1 0 0' })), box()))))

try {
  const description = view()
  await delay()
  assert(assets().length === 0 && !window.x3dom, 'construction must not load X3DOM')
  const node = project(description)
  await delay()
  assert(assets().length === 0 && !node.runtime, 'detached projection must not load X3DOM')
  const tree = project(html.html(html.head(html.title('X3DOM connection test')), html.body()))
  document.documentElement.replaceWith(tree)
  let started = null
  const duringLoad = new MutationObserver(() => {
    const script = document.querySelector('script[src*="x3dom-full"]')
    if (!script) return
    started = script
    duringLoad.disconnect()
    document.head.replaceWith(project(html.head(html.title('Head replaced during loading'))))
  })
  duringLoad.observe(document, { childList: true, subtree: true })
  document.body.append(node)
  await until(() => node.runtime?.canvas?.gl && styles()?.sheet, 'connected scene did not initialize real WebGL')
  assert(started && !started.isConnected, 'the loading script must have survived head removal')
  assert(!document.querySelector('script[src*="x3dom-full"]'), 'head replacement must not start a second vendor script')
  assert(window.x3dom.about.version === '1.8.3', 'the vendored runtime must be running')
  assert(node.querySelector('shape')._x3domNode, 'the scene must be parsed by X3DOM')
  const engine = window.x3dom
  node.remove()
  await delay()
  document.head.replaceWith(project(html.head(html.title('Replacement head'))))
  await delay()
  assert(!styles(), 'disconnected scenes must not inject assets')
  document.body.append(node)
  await until(() => styles()?.sheet && node.runtime?.canvas?.gl,
              'reconnection did not restore the stylesheet and initialize the scene')
  assert(window.x3dom === engine, 'reconnection must reuse the loaded engine')
  assert(node.querySelectorAll('canvas').length === 1, 'reconnection must not duplicate canvases')
  const next = project(view(), document.body)
  await until(() => next.runtime?.canvas?.gl, 'a later scene did not initialize')
  const destination = document.createElement('section')
  document.body.append(destination)
  destination.append(node)
  await delay()
  await until(() => node.runtime?.canvas?.gl, 'moving a connected scene did not reinitialize it')
  node.setAttribute('width', '120px')
  assert(node.querySelector('canvas').width === 120 * devicePixelRatio,
         'reconnection must restore functioning attribute wrappers')
  assert(node.querySelectorAll('canvas').length === 1, 'moves must not leave duplicate canvases')
  document.head.replaceWith(project(html.head(html.title('Live head replacement'))))
  await until(() => styles()?.sheet, 'live head replacement did not restore CSS')
  assert(document.querySelectorAll('link[rel="stylesheet"][href*="x3dom"]').length === 1,
         'parallel scenes must share a stylesheet')
  parent.postMessage({ x3domCheck: 'PASS' }, location.origin)
} catch (error) {
  parent.postMessage({ x3domCheck: error.stack || String(error) }, location.origin)
}
