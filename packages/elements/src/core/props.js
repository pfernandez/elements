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

const deleteKey = (obj, key) =>
  (delete obj[String(key)], undefined)

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

const removeAttribute = (el, key) =>
  typeof el.removeAttribute === 'function'
    ? el.removeAttribute(key)
    : el.attributes ? deleteKey(el.attributes, key) : undefined

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
export const removeMissingProps = (el, prevProps, nextProps) => {
  const keys = Object.keys(prevProps)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    !(key in nextProps) && clearProp(el, key)
  }
}

/**
 * Assign props to a DOM element.
 *
 * @param {any} el
 * @param {Record<string, any>} props
 * @param {{
 *   svgNS: string,
 *   debug: boolean,
 *   isRoot: (el: any) => boolean,
 *   renderTree: (node: any, isRoot?: boolean, namespaceURI?: string | null) =>
 *     any,
 *   getCurrentEventRoot: () => any,
 *   setCurrentEventRoot: (el: any) => void
 * }} env
 */
export const assignProperties = (el, props, env) => {
  const isSvg = el.namespaceURI === env.svgNS
  const keys = Object.keys(props)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const value = props[key]

    if (key === 'ontick' && typeof value === 'function') {
      el.ontick = value
      startTickLoop(el, value, { ready: isX3DOMReadyFor })
      continue
    }

    if (key in propertyExceptions && key in el) {
      el[propertyExceptions[key]] = value
      continue
    }

    if (isEventProp(key, value)) {
      el[key] = createDeclarativeEventHandler({
        el,
        key,
        handler: value,
        isRoot: env.isRoot,
        renderTree: env.renderTree,
        getCurrentEventRoot: env.getCurrentEventRoot,
        setCurrentEventRoot: env.setCurrentEventRoot,
        debug: env.debug
      })
      continue
    }

    if (key === 'style' && isObject(value)) {
      Object.assign(el.style, value)
      continue
    }

    if (key === 'innerHTML') {
      el.innerHTML = value
      continue
    }

    isSvg ? el.setAttributeNS(null, key, value) : el.setAttribute(key, value)
  }
}
