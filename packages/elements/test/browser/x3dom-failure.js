import { project } from '@pfern/elements'
import { box, scene, shape, x3d } from '@pfern/elements-x3dom'

const assert = (condition, message) => { if (!condition) throw new Error(message) }
const delay = () => new Promise(resolve => setTimeout(resolve, 30))
const until = async (predicate, message) => {
  for (let i = 0; i < 100; i++) {
    if (predicate()) return
    await delay()
  }
  throw new Error(message)
}
const styles = () => document.querySelector('link[href*="x3dom.css"]')
const graph = x3d({ width: '100px', height: '100px' }, scene(shape(box())))
const warnings = [], warn = console.warn
console.warn = (...args) => (warnings.push(args), warn(...args))

try {
  // The browser test server rejects this document's first stylesheet request.
  const node = project(graph, document.body)
  await until(() => warnings.length && node.runtime?.canvas?.gl,
              'the runtime must initialize despite the failed stylesheet')
  assert(warnings[0][0] === 'x3dom stylesheet failed to load', 'expected a stylesheet failure')
  const failed = styles()
  const engine = window.x3dom
  node.remove()
  await delay()
  assert(!node.runtime, 'removal must destroy the old runtime')
  document.body.append(node)
  await until(() => node.runtime?.canvas?.gl, 'reconnection must work before CSS recovery')
  const next = project(graph, document.body)
  await until(() => next.runtime?.canvas?.gl, 'later scenes must initialize despite failed CSS')
  failed.remove()
  await until(() => styles()?.sheet && styles() !== failed, 'replacement stylesheet must load')
  node.remove()
  await delay()
  document.body.append(node)
  await until(() => node.runtime?.canvas?.gl, 'reconnection must also work after CSS recovery')
  assert(window.x3dom === engine, 'CSS recovery must not reload the engine')
  assert(node.querySelectorAll('canvas').length === 1, 'reconnection must not duplicate controls')
  node.setAttribute('width', '120px')
  assert(node.querySelector('canvas').width === 120 * devicePixelRatio,
         'reconnection must preserve attribute updates')
  parent.postMessage({ x3domCheck: 'PASS' }, location.origin)
} catch (error) {
  parent.postMessage({ x3domCheck: error.stack || String(error) }, location.origin)
} finally { console.warn = warn }
