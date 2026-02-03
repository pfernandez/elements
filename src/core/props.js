/**
 * Element property assignment.
 *
 * The props object is treated as:
 * - DOM events: `on*` functions (wrapped to support vnode returns)
 * - Hooks: non-DOM behavior such as `ontick`
 * - Styling: `style` objects
 * - Everything else: attributes (including SVG namespace handling)
 */

import { createDeclarativeEventHandler, isEventProp } from './events.js'
import { startTickLoop } from './tick.js'

const isObject = x =>
  typeof x === 'object'
  && x !== null

const isX3DOMReadyFor = el =>
  (x3d => !x3d || !!x3d.runtime)(el?.closest?.('x3d'))

const applyTickProp = ({ el, key, value, env: _env }) =>
  key !== 'ontick' || typeof value !== 'function'
    ? false
    : (el.ontick = value,
      startTickLoop(el, value, { ready: isX3DOMReadyFor }),
      true)

const applyEventProp = ({ el, key, value, env }) =>
  !isEventProp(key, value)
    ? false
    : (el[key] = createDeclarativeEventHandler({
      el,
      key,
      handler: value,
      isRoot: env.isRoot,
      renderTree: env.renderTree,
      getCurrentEventRoot: env.getCurrentEventRoot,
      setCurrentEventRoot: env.setCurrentEventRoot,
      debug: env.debug
    }),
    true)

const applyStyleProp = ({ el, key, value, env: _env }) =>
  key !== 'style' || !isObject(value) ? false : (Object.assign(el.style, value), true)

const applyInnerHTMLProp = ({ el, key, value, env: _env }) =>
  key !== 'innerHTML' ? false : (el.innerHTML = value, true)

const applyAttributeProp = ({ el, key, value, env }) => {
  try {
    el.namespaceURI === env.svgNS
      ? el.setAttributeNS(null, key, value)
      : el.setAttribute(key, value)
  } catch {
    env.debug
      && console.warn(
        `Illegal DOM property assignment for ${el.tagName}: ${key}: ${value}`
      )
  }
  return true
}

const appliers = [
  applyTickProp,
  applyEventProp,
  applyStyleProp,
  applyInnerHTMLProp,
  applyAttributeProp
]

/**
 * Assign props to a DOM element.
 *
 * @param {any} el
 * @param {Record<string, any>} props
 * @param {{
 *   svgNS: string,
 *   debug: boolean,
 *   isRoot: (el: any) => boolean,
 *   renderTree: Function,
 *   getCurrentEventRoot: () => any,
 *   setCurrentEventRoot: (el: any) => void
 * }} env
 */
export const assignProperties = (el, props, env) =>
  Object.entries(props).forEach(([key, value]) =>
    appliers.some(apply => apply({ el, key, value, env }))
  )
