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
import { startTickLoop, stopTickLoop } from './tick.js'

const isObject = x =>
  typeof x === 'object'
  && x !== null

const tap = (value, effect) => (effect(value), value)

const isX3DOMReadyFor = el =>
  (x3d => !x3d || !!x3d.runtime)(el?.closest?.('x3d'))

const propertyExceptions = {
  value: 'value',
  checked: 'checked',
  selected: 'selected',
  disabled: 'disabled',
  multiple: 'multiple',
  muted: 'muted',
  volume: 'volume',
  currentTime: 'currentTime',
  playbackRate: 'playbackRate',
  open: 'open',
  indeterminate: 'indeterminate'
}

const propertyExceptionDefaults = {
  value: '',
  checked: false,
  selected: false,
  disabled: false,
  multiple: false,
  muted: false,
  volume: 1,
  currentTime: 0,
  playbackRate: 1,
  open: false,
  indeterminate: false
}

const applyTickProp = (el, key, value, _env) =>
  key !== 'ontick' || typeof value !== 'function'
    ? false
    : (tap(undefined, () => el.ontick = value),
      startTickLoop(el, value, { ready: isX3DOMReadyFor }),
      true)

const applyPropertyExceptionProp = (el, key, value, _env) =>
  !(key in propertyExceptions) || !(key in el)
    ? false
    : (tap(undefined, () => el[propertyExceptions[key]] = value), true)

const applyEventProp = (el, key, value, env) =>
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

const applyStyleProp = (el, key, value, _env) =>
  key !== 'style' || !isObject(value)
    ? false
    : (Object.assign(el.style, value), true)

const applyInnerHTMLProp = (el, key, value, _env) =>
  key !== 'innerHTML'
    ? false
    : (tap(undefined, () => el.innerHTML = value), true)

const applyAttributeProp = (el, key, value, env) =>
  (el.namespaceURI === env.svgNS
    ? el.setAttributeNS(null, key, value)
    : el.setAttribute(key, value),
  true)

const appliers = [
  applyTickProp,
  applyPropertyExceptionProp,
  applyEventProp,
  applyStyleProp,
  applyInnerHTMLProp,
  applyAttributeProp
]

const removeAttribute = (el, key) =>
  typeof el.removeAttribute === 'function'
    ? el.removeAttribute(key)
    : (el.attributes && delete el.attributes[String(key)], undefined)

const clearStyle = el =>
  (style =>
    !style
      ? undefined
      : 'cssText' in style
        ? (style.cssText = '', undefined)
        : (Object.keys(style).forEach(k => delete style[k]), undefined)
  )(el?.style)

const clearInnerHTML = el =>
  el.innerHTML = ''

const clearEventProp = (el, key) =>
  el[key] = null

const clearPropertyException = (el, key) =>
  key in propertyExceptions && key in el
    ? (el[propertyExceptions[key]] = propertyExceptionDefaults[key], undefined)
    : undefined

const clearTick = el =>
  (el.ontick = null, stopTickLoop(el))

const clearProp = (el, key) =>
  key === 'ontick' ? clearTick(el)
    : key === 'style' ? clearStyle(el)
      : key === 'innerHTML' ? clearInnerHTML(el)
        : key in propertyExceptions ? clearPropertyException(el, key)
          : key.startsWith('on') ? clearEventProp(el, key)
            : removeAttribute(el, key)

/**
 * Remove props that existed previously but are absent in the next vnode.
 *
 * This keeps updates symmetric: setting a prop then omitting it later clears it
 * from the DOM element.
 *
 * @param {any} el
 * @param {Record<string, any>} prevProps
 * @param {Record<string, any>} nextProps
 */
export const removeMissingProps = (el, prevProps, nextProps) =>
  Object.keys(prevProps)
    .forEach(key =>
      !(key in nextProps) && clearProp(el, key)
    )

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
  Object.keys(props).forEach(key => {
    const value = props[key]
    for (let i = 0; i < appliers.length; i++) {
      if (appliers[i](el, key, value, env)) break
    }
  })
