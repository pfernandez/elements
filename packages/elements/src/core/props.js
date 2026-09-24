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
  const prevStyle = prevProps?.style
  const nextStyle = nextProps?.style
  typeof prevStyle === 'string' && isObject(nextStyle) && clearStyle(el)
  if (isObject(prevStyle) && isObject(nextStyle) && el?.style) {
    const keys = Object.keys(prevStyle)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      if (key in nextStyle) continue

      key.startsWith('--')
        ? el.style.removeProperty(key)
        : el.style[key] = ''
    }
  }

  const keys = Object.keys(prevProps)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (key === 'key') continue
    if (key in nextProps) continue

    clearProp(el, key)
  }
}

/**
 * Assign props to a DOM element.
 *
 * @param {any} el
 * @param {Record<string, any>} props
 * @param {{
 *   svgNS: string,
 *   resume: (vnode: any) => void
 * }} env
 */
export const assignProperties = (el, props, env) => {
  validateProps(props)
  const isSvg = el.namespaceURI === env.svgNS
  const keys = Object.keys(props)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const value = props[key]

    if (key === 'key') continue

    if (value == null) {
      clearProp(el, key)
      continue
    }

    if (key === 'ontick' && typeof value === 'function') {
      el.ontick = value
      startTickLoop(el, value, { ready: isX3DOMReadyFor })
      continue
    }

    if (Object.hasOwn(propertyExceptions, key) && key in el) {
      el[propertyExceptions[key]] = value
      continue
    }

    if (isEventProp(key, value)) {
      el[key] = createDeclarativeEventHandler({
        el,
        key,
        handler: value,
        resume: env.resume
      })
      continue
    }

    if (key === 'style') {
      if (isObject(value) && el?.style) {
        const styleKeys = Object.keys(value)
        for (let i = 0; i < styleKeys.length; i++) {
          const styleKey = styleKeys[i]
          const styleValue = value[styleKey]

          if (styleValue == null) {
            styleKey.startsWith('--')
              ? el.style.removeProperty(styleKey)
              : el.style[styleKey] = ''
            continue
          }

          styleKey.startsWith('--')
            ? el.style.setProperty(styleKey, String(styleValue))
            : el.style[styleKey] = styleValue
        }

        continue
      }
    }

    if (key === 'innerHTML') {
      el.innerHTML = value
      continue
    }

    const text = attributeValue(key, value)
    text == null ? removeAttribute(el, key)
      : isSvg ? el.setAttributeNS(null, key, text)
        : el.setAttribute(key, text)
  }
}
