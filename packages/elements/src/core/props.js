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
import { attributeValue, validateProps } from './attributes.js'
import { checkpoint } from './update.js'

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
  Object.hasOwn(propertyExceptions, key) && key in el
    ? (el[propertyExceptions[key]] = propertyExceptionDefaults[key], undefined)
    : undefined

const clearTick = el =>
  (el.ontick = null, stopTickLoop(el))

const clearProp = (el, key) =>
  key === 'ontick' ? clearTick(el)
    : key === 'style' ? clearStyle(el)
      : key === 'innerHTML' ? clearInnerHTML(el)
        : Object.hasOwn(propertyExceptions, key) && key in el
          ? clearPropertyException(el, key)
          : key.startsWith('on') ? clearEventProp(el, key)
            : removeAttribute(el, key)

// Record the value before a native callback can reenter. Failed assignments
// restore the bookkeeping and still propagate the original error.
const applying = (applied, key, value, assign) => {
  const undo = applied?.(key, value)
  try { assign() }
  catch (error) { undo?.(); throw error }
  checkpoint()
}

/**
 * Remove props that existed previously but are absent in the next vnode.
 *
 * This keeps updates symmetric: setting a prop then omitting it later clears it
 * from the DOM element.
 *
 * @param {any} el
 * @param {Record<string, any>} prevProps
 * @param {Record<string, any>} nextProps
 * @param {(key: string, value: any) => (() => void) | void} [applied]
 */
export const removeMissingProps = (el, prevProps, nextProps, applied = () => {}) => {
  const prevStyle = prevProps?.style
  const nextStyle = nextProps?.style
  if (typeof prevStyle === 'string' && isObject(nextStyle)) {
    applying(applied, 'style', {}, () => clearStyle(el))
  }
  if (isObject(prevStyle) && isObject(nextStyle) && el?.style) {
    const style = { ...prevStyle }
    const keys = Object.keys(prevStyle)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      if (key in nextStyle) continue

      delete style[key]
      applying(applied, 'style', { ...style }, () =>
        key.startsWith('--') ? el.style.removeProperty(key) : el.style[key] = '')
    }
  }

  const keys = Object.keys(prevProps)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (key === 'key') continue
    if (key in nextProps) continue

    applying(applied, key, undefined, () => clearProp(el, key))
  }
  checkpoint()
}

/**
 * Assign props to a DOM element.
 *
 * @param {any} el
 * @param {Record<string, any>} props
 * @param {{
 *   svgNS: string,
 *   resume: (vnode: any) => void,
 *   applied?: (key: string, value: any) => (() => void) | void,
 *   style?: any
 * }} env
 */
export const assignProperties = (el, props, env) => {
  validateProps(props)
  const isSvg = el.namespaceURI === env.svgNS
  const keys = Object.keys(props)
  for (const key of keys) {
    checkpoint()
    if (key === 'key') continue
    const value = props[key]
    if (key === 'style' && isObject(value) && el?.style) {
      const style = { ...isObject(env.style) ? env.style : {} }
      for (const styleKey of Object.keys(value)) {
        const styleValue = value[styleKey]
        style[styleKey] = styleValue
        applying(env.applied, 'style', { ...style }, () =>
          styleValue == null
            ? styleKey.startsWith('--') ? el.style.removeProperty(styleKey) : el.style[styleKey] = ''
            : styleKey.startsWith('--') ? el.style.setProperty(styleKey, String(styleValue))
              : el.style[styleKey] = styleValue)
      }
    } else applying(env.applied, key, value, () => {
      if (value == null) clearProp(el, key)
      else if (key === 'ontick' && typeof value === 'function') {
        el.ontick = value
        startTickLoop(el, value, { ready: isX3DOMReadyFor })
      } else if (Object.hasOwn(propertyExceptions, key) && key in el)
        el[propertyExceptions[key]] = value
      else if (isEventProp(key, value))
        el[key] = createDeclarativeEventHandler({ el, key, handler: value, resume: env.resume })
      else if (key === 'innerHTML') el.innerHTML = value
      else {
        const text = attributeValue(key, value)
        text == null ? removeAttribute(el, key)
          : isSvg ? el.setAttributeNS(null, key, text) : el.setAttribute(key, text)
      }
    })
  }
  checkpoint()
}
