/** expressive/elements.js
 *
 * Minimalist declarative UI framework based on pure functional composition.
 *
 * Purpose:
 * - All UI defined as pure functions that return declarative arrays.
 * - Directly composable into a symbolic tree compatible with Lisp-like dialects.
 * - No internal mutable state required: DOM itself is the substrate for state.
 * - No JSX, no keys, no reconciler heuristics — just pure structure + replacement.
 *
 */

import { htmlTagNames, svgTagNames } from './tags.js'

export const DEBUG =
  typeof process !== 'undefined'
  && process.env
  && (process.env.ELEMENTSJS_DEBUG?.toLowerCase() === 'true'
    || process.env.NODE_ENV === 'development')

const svgNS = 'http://www.w3.org/2000/svg'

/**
 * Maps vnode instances to their current root DOM element,
 * allowing accurate replacement when the same vnode is re-invoked.
 */
const rootMap = new WeakMap()

const isNodeEnv = () => typeof document === 'undefined'

let componentUpdateDepth = 0
let currentEventRoot = null

/**
 * Determines whether two nodes have changed enough to require replacement.
 * Compares type, string value, or element tag.
 *
 * @param {*} a - Previous vnode
 * @param {*} b - New vnode
 * @returns {boolean} - True if nodes are meaningfully different
 */
const changed = (a, b) =>
  typeof a !== typeof b
  || typeof a === 'string' && a !== b
  || Array.isArray(a) && Array.isArray(b) && a[0] !== b[0]

/**
 * Computes a patch object describing how to transform tree `a` into tree `b`.
 * Used by `render` to apply minimal updates to the DOM.
 *
 * @param {*} a - Previous vnode
 * @param {*} b - New vnode
 * @returns {Object} - Patch object with type and content
 */
const diffTree = (a, b) => {
  if (!a) return { type: 'CREATE', newNode: b }
  if (!b) return { type: 'REMOVE' }
  if (changed(a, b)) return { type: 'REPLACE', newNode: b }
  if (Array.isArray(a) && Array.isArray(b)) {
    return {
      type: 'UPDATE',
      children: diffChildren(a.slice(2), b.slice(2))
    }
  }
}

/**
 * Compares the children of two vnodes and returns patch list.
 *
 * @param {Array} aChildren - Previous vnode children
 * @param {Array} bChildren - New vnode children
 * @returns {Array} patches - One per child node
 */
const diffChildren = (aChildren, bChildren) => {
  const patches = []
  const len = Math.max(aChildren.length, bChildren.length)
  for (let i = 0; i < len; i++) {
    patches[i] = diffTree(aChildren[i], bChildren[i])
  }
  return patches
}

/**
 * Assigns attributes, styles, and event handlers to a DOM element.
 *
 * - Event listeners may return a vnode array to trigger a subtree replacement.
 * - For `onsubmit`, `oninput`, and `onchange`, `preventDefault()` is called automatically
 *   *if* the listener returns a vnode (to support declarative form updates).
 * - Handlers for these event types receive `(elements, event)` as arguments,
 *   where `elements` is `event.target.elements` if available.
 * - Async handlers are supported: if the listener returns a Promise,
 *   it will be awaited and the resulting vnode (if any) will be rendered.
 *
 * @param {HTMLElement} el - The DOM element to receive props
 * @param {Object} props - Attributes and event listeners to assign
 */
const assignProperties = (el, props) =>
  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith('on') && typeof value === 'function') {
      el[key] = async (...args) => {
        let target = el
        while (target && !target.__root) target = target.parentNode
        if (!target) return

        const prevEventRoot = currentEventRoot
        currentEventRoot = target
        try {
          const event = args[0]
          const isFormEvent = /^(oninput|onsubmit|onchange)$/.test(key)
          const elements = isFormEvent && event?.target?.elements || null

          const result = await (isFormEvent
            ? value.call(el, elements, event)
            : value.call(el, event))

          if (isFormEvent && result !== undefined) {
            event.preventDefault()
          }

          if (DEBUG && result === undefined) {
            console.warn(
              `Listener '${key}' on <${el.tagName.toLowerCase()}> returned nothing.\n`
                + 'If you intended a UI update, return a vnode array like: div({}, ...)'
            )
          }

          if (DEBUG && result !== undefined && !Array.isArray(result)) {
            isFormEvent && event.preventDefault()
            DEBUG
              && console.warn(
                `Listener '${key}' on <${el.tagName.toLowerCase()}> returned "${result}".\n`
                  + 'If you intended a UI update, return a vnode array like: div({}, ...).\n'
                  + 'Otherwise, return undefined (or nothing) for native event listener behavior.'
              )
          }

          if (Array.isArray(result)) {
            const parent = target.parentNode
            if (!parent) return

            const replacement = renderTree(result, true)
            parent.replaceChild(replacement, target)

            replacement.__vnode = result
            replacement.__root = true
            rootMap.set(result, replacement)
          }
        } catch (error) {
          console.error(error)
        } finally {
          currentEventRoot = prevEventRoot
        }
      }
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value)
    } else if (key === 'innerHTML') {
      el.innerHTML = value
    } else {
      try {
        if (el.namespaceURI === svgNS) {
          el.setAttributeNS(null, key, value)
        } else {
          el.setAttribute(key, value)
        }
      } catch {
        DEBUG
          && console.warn(
            `Illegal DOM property assignment for ${el.tagName}: ${key}: ${value}`
          )
      }
    }
  })

/**
 * Recursively builds a real DOM tree from a declarative vnode.
 * Marks root nodes and tracks state/element associations.
 *
 * @param {*} node - Vnode to render
 * @param {boolean} isRoot - Whether this is a root component
 * @returns {Node} - Real DOM node
 */
const renderTree = (node, isRoot = true, namespaceURI = null) => {
  if (typeof node === 'string' || typeof node === 'number') {
    return isNodeEnv() ? node : document.createTextNode(node)
  }

  if (!node || node.length === 0) {
    return document.createComment('Empty vnode')
  }

  if (!Array.isArray(node)) {
    console.error('Malformed vnode (not an array):', node)
    return document.createComment('Invalid vnode')
  }

  if (Array.isArray(node) && node[0] === 'wrap') {
    const [_tag, props = {}, child] = node
    const el = renderTree(child, true, namespaceURI)
    if (props && typeof props === 'object' && props.__instance) {
      rootMap.set(props.__instance, el)
    }
    return el
  }

  const [tag, props = {}, ...children] = node

  if (typeof tag !== 'string') {
    console.error('Malformed vnode (non-string tag):', node)
    return document.createComment('Invalid vnode')
  }

  const elNamespaceURI = tag === 'svg' || namespaceURI === svgNS ? svgNS : null
  const childNamespaceURI =
    tag === 'foreignObject'
      ? null
      : tag === 'svg'
        ? svgNS
        : namespaceURI

  let el =
    tag === 'html'
      ? document.documentElement
      : tag === 'head'
        ? document.head
        : tag === 'body'
          ? document.body
          : elNamespaceURI
            ? document.createElementNS(svgNS, tag)
            : document.createElement(tag)

  if (!el && (tag === 'head' || tag === 'body')) {
    el = document.createElement(tag)
    document.documentElement.appendChild(el)
  }

  el.__vnode = node

  if (isRoot && tag !== 'html' && tag !== 'head' && tag !== 'body') {
    el.__root = true
    rootMap.set(node, el)
  }

  assignProperties(el, props)

  children.forEach(child => {
    const childEl = renderTree(child, false, childNamespaceURI)
    el.appendChild(childEl)
  })

  return el
}

/**
 * Applies a patch object to a DOM subtree.
 * Handles creation, removal, replacement, and child updates.
 *
 * @param {HTMLElement} parent - DOM node to mutate
 * @param {Object} patch - Patch object from diffTree
 * @param {number} [index=0] - Child index to apply update to
 */
const applyPatch = (parent, patch, index = 0) => {
  if (!patch) return
  const child = parent.childNodes[index]

  switch (patch.type) {
  case 'CREATE': {
    const newEl = renderTree(patch.newNode)
    parent.appendChild(newEl)
    break
  }
  case 'REMOVE':
    if (child) parent.removeChild(child)
    break
  case 'REPLACE': {
    const newEl = renderTree(patch.newNode)
    parent.replaceChild(newEl, child)
    break
  }
  case 'UPDATE':
    patch.children.forEach((p, i) => applyPatch(child, p, i))
    break
  }
}

/**
 * Renders a new vnode into the DOM. If this vnode was rendered before,
 * reuses the previous root and applies a patch. Otherwise, performs initial mount.
 *
 * @param {any[]} vtree - The declarative vnode array to render
 * @param {HTMLElement} container - The container to render into
 */
export const render = (vtree, container = null) => {
  const target =
    !container && Array.isArray(vtree) && vtree[0] === 'html'
      ? document.documentElement
      : container

  if (!target) {
    throw new Error('render() requires a container for non-html() root')
  }

  const prevVNode = target.__vnode

  if (!prevVNode) {
    const dom = renderTree(vtree)
    if (target === document.documentElement) {
      if (dom !== document.documentElement) {
        document.replaceChild(dom, document.documentElement)
      }
    } else {
      target.appendChild(dom)
    }
  } else {
    const patch = diffTree(prevVNode, vtree)
    applyPatch(target, patch)
  }

  target.__vnode = vtree
  rootMap.set(vtree, target)
}

/**
 * Wraps a function component so that it participates in reconciliation.
 *
 * @param {(...args: any[]) => any} fn - A pure function that returns a declarative tree (array format).
 * @returns {(...args: any[]) => any} - A callable component that can manage its own subtree.
 */
export const component = fn => {
  const instance = {}
  return (...args) => {
    try {
      const prevEl = rootMap.get(instance)
      const canUpdateInPlace =
        !!prevEl?.parentNode
        && componentUpdateDepth === 0
        && !currentEventRoot

      componentUpdateDepth++
      let vnode
      try {
        vnode = fn(...args)
      } finally {
        componentUpdateDepth--
      }

      if (canUpdateInPlace) {
        const replacement = renderTree(['wrap', { __instance: instance }, vnode], true)
        prevEl.parentNode.replaceChild(replacement, prevEl)
        return replacement.__vnode
      }

      return ['wrap', { __instance: instance }, vnode]
    } catch (err) {
      console.error('Component error:', err)
      return ['div', {}, `Error: ${err.message}`]
    }
  }
}

const tagNames = [...htmlTagNames, ...svgTagNames]
const isPropsObject = x =>
  typeof x === 'object'
  && x !== null
  && !Array.isArray(x)
  && !(typeof Node !== 'undefined' && x instanceof Node)

/**
 * A map of supported HTML and SVG element helpers.
 *
 * Each helper is a function that accepts optional props as first argument
 * and children as subsequent arguments.
 *
 * Example:
 *
 * ```js
 * div({ id: 'foo' }, 'Hello World')
 * ```
 *
 * Produces:
 *
 * ```js
 * ['div', { id: 'foo' }, 'Hello World']
 * ```
 *
 * The following helpers are included:
 * `div`, `span`, `button`, `svg`, `circle`, etc.
 */
export const elements = tagNames.reduce(
  (acc, tag) => ({
    ...acc,
    [tag]: (...args) => {
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
  }),
  {
    fragment: (...children) => ['fragment', {}, ...children]
  }
)

// TODO: MathML
// https://developer.mozilla.org/en-US/docs/Web/MathML/Reference/Element
