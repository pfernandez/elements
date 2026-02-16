/** expressive/elements.js
 *
 * Minimalist declarative UI framework based on pure functional composition.
 *
 * Purpose:
 * - All UI defined as pure functions that return declarative arrays.
 * - Directly composable into a symbolic tree compatible with Lisp-like
 *   dialects.
 * - No internal mutable state required: DOM itself is the substrate for state.
 * - No JSX, no keys, no reconciler heuristics — just pure structure +
 *   replacement.
 *
 */

import { assignProperties, removeMissingProps } from './props.js'
import { htmlTagNames, svgTagNames } from './tags.js'

export * from './types.js'

export const DEBUG =
  typeof process !== 'undefined'
  && process.env
  && (process.env.ELEMENTSJS_DEBUG?.toLowerCase() === 'true'
    || process.env.NODE_ENV === 'development')

const svgNS = 'http://www.w3.org/2000/svg'
const mathNS = 'http://www.w3.org/1998/Math/MathML'

/**
 * Maps vnode instances to their current root DOM element,
 * allowing accurate replacement when the same vnode is re-invoked.
 */
const rootMap = new WeakMap()

/**
 * Maps component-returned vnode roots to their component instance object.
 *
 * This keeps the public vnode representation “pure” (no wrapper nodes) while
 * still allowing:
 * - event updates to replace the nearest component boundary, and
 * - programmatic updates to patch the correct DOM subtree for an instance.
 */
const componentRoots = new WeakMap()

const getVNode = el => el?.__vnode
const setVNode = (el, vnode) => el.__vnode = vnode
const isRoot = el => !!el?.__root
const setRoot = el => el.__root = true

const isNodeEnv = () => typeof document === 'undefined'

let componentUpdateDepth = 0
let currentEventRoot = null

const getCurrentEventRoot = () => currentEventRoot
const setCurrentEventRoot = el => currentEventRoot = el

const isObject = x =>
  typeof x === 'object'
  && x !== null

const shallowObjectEqual = (a, b) => {
  if (a === b) return true
  if (!isObject(a) || !isObject(b)) return false
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  for (let i = 0; i < aKeys.length; i++) {
    const key = aKeys[i]
    if (!(key in b) || a[key] !== b[key]) return false
  }
  return true
}

const propsEqual = (a, b) => {
  if (a === b) return true
  if (!isObject(a) || !isObject(b)) return false
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  for (let i = 0; i < aKeys.length; i++) {
    const key = aKeys[i]
    if (!(key in b)) return false
    const av = a[key]
    const bv = b[key]
    if (key === 'style' && isObject(av) && isObject(bv)) {
      if (!shallowObjectEqual(av, bv)) return false
    } else if (av !== bv) return false
  }
  return true
}

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
  || typeof a === 'number' && a !== b
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
  if (a == null) return { type: 'CREATE', newNode: b }
  if (b == null) return { type: 'REMOVE' }
  if (changed(a, b)) return { type: 'REPLACE', newNode: b }
  if (!Array.isArray(a) || !Array.isArray(b)) return

  const prevProps = a[1] || {}
  const nextProps = b[1] || {}
  const propsChanged = !propsEqual(prevProps, nextProps)
  const children = diffChildren(a, b)

  return !propsChanged && !children
    ? undefined
    : {
      type: 'UPDATE',
      prevProps: propsChanged ? prevProps : null,
      props: propsChanged ? nextProps : null,
      children
    }
}

/**
 * Compares the children of two vnodes and returns patch list.
 *
 * @param {any[]} a - Previous vnode
 * @param {any[]} b - New vnode
 * @returns {Array<[number, Object]> | null} patches - Sparse patch list
 */
const diffChildren = (a, b) => {
  const aLen = Math.max(0, a.length - 2)
  const bLen = Math.max(0, b.length - 2)
  const len = Math.max(aLen, bLen)
  /** @type {Array<[number, Object]>} */
  const patches = []

  for (let i = 0; i < len; i++) {
    const aIndex = i + 2
    const bIndex = i + 2
    const aHasChild = aIndex < a.length
    const bHasChild = bIndex < b.length

    if (!aHasChild && !bHasChild) continue

    const prevChild = aHasChild ? a[aIndex] : undefined
    const nextChild = bHasChild ? b[bIndex] : undefined

    // If a child position is explicitly present (even as null/undefined),
    // renderTree() will create a placeholder comment node. Treat transitions
    // between empty and non-empty as REPLACE so indices stay aligned.
    let patch
    if (!aHasChild && bHasChild) {
      patch = { type: 'CREATE', newNode: nextChild }
    } else if (aHasChild && !bHasChild) {
      patch = { type: 'REMOVE' }
    } else if (prevChild == null && nextChild == null) {
      patch = undefined
    } else if (prevChild == null || nextChild == null) {
      patch = { type: 'REPLACE', newNode: nextChild }
    } else {
      patch = diffTree(prevChild, nextChild)
    }

    patch && patches.push([i, /** @type {Object} */ patch])
  }

  return patches.length ? patches : null
}


const propsEnv = {
  svgNS,
  debug: DEBUG,
  isRoot,
  renderTree: null,
  getCurrentEventRoot,
  setCurrentEventRoot
}

/**
 * Recursively builds a real DOM tree from a declarative vnode.
 * Marks root nodes and tracks state/element associations.
 *
 * @param {*} node - Vnode to render
 * @param {boolean} isRoot - Whether this is a root component
 * @returns {any} - Real DOM node
 */
const renderTree = (node, isRoot = true, namespaceURI = null) => {
  const type = typeof node

  if (type === 'string' || type === 'number')
    return isNodeEnv() ? node : document.createTextNode(String(node))

  if (!node || node.length === 0) return document.createComment('Empty vnode')

  if (!Array.isArray(node)) {
    console.error('Malformed vnode (not an array):', node)
    return document.createComment('Invalid vnode')
  }

  const componentInstance = componentRoots.get(node)
  componentInstance && (isRoot = true)

  const tag = node[0]

  if (typeof tag !== 'string') {
    console.error('Malformed vnode (non-string tag):', node)
    return document.createComment('Invalid vnode')
  }

  const props = node[1] || {}
  const isSpecialRootTag = tag === 'html' || tag === 'head' || tag === 'body'

  const elNamespaceURI =
    tag === 'svg' || namespaceURI === svgNS
      ? svgNS
      : tag === 'math' || namespaceURI === mathNS
        ? mathNS
        : null

  const isAnnotationXmlHtml =
    tag === 'annotation-xml'
    && typeof props?.encoding === 'string'
    && /(^|\/)(xhtml\+xml|xhtml|html)(;|$)/i.test(props.encoding)

  const childNamespaceURI =
    tag === 'foreignObject'
      ? null
      : tag === 'annotation-xml'
        ? isAnnotationXmlHtml ? null : namespaceURI
        : tag === 'svg'
          ? svgNS
          : tag === 'math'
            ? mathNS
            : namespaceURI

  let el = null
  if (tag === 'html') el = document.documentElement
  else if (tag === 'head') el = document.head
  else if (tag === 'body') el = document.body
  else el = elNamespaceURI
    ? document.createElementNS(elNamespaceURI, tag)
    : document.createElement(tag)

  if (!el && (tag === 'head' || tag === 'body')) {
    el = document.createElement(tag)
    document.documentElement.appendChild(el)
  }

  setVNode(el, node)

  if (isRoot && !isSpecialRootTag) {
    setRoot(el)
    rootMap.set(node, el)
  }

  componentInstance && rootMap.set(componentInstance, el)

  assignProperties(el, props, propsEnv)

  for (let i = 2; i < node.length; i++) {
    el.appendChild(renderTree(node[i], false, childNamespaceURI))
  }

  return el
}

propsEnv.renderTree = renderTree

const applyPropsUpdate = (el, prevProps, nextProps) =>
  nextProps == null
    ? undefined
    : (removeMissingProps(el, prevProps || {}, nextProps),
    assignProperties(el, nextProps, propsEnv))

/**
 * Applies a patch object to a DOM subtree.
 * Handles creation, removal, replacement, and child updates.
 *
 * @param {any} parent - DOM node to mutate
 * @param {Object} patch - Patch object from diffTree
 * @param {number} [index=0] - Child index to apply update to
 */
const applyPatch = (parent, patch, index = 0, isRootBoundary = false) => {
  if (!patch) return
  const child = parent.childNodes[index]

  switch (patch.type) {
  case 'CREATE': {
    const newEl = renderTree(patch.newNode, isRootBoundary)
    child ? parent.insertBefore(newEl, child) : parent.appendChild(newEl)
    break
  }
  case 'REMOVE':
    if (child) parent.removeChild(child)
    break
  case 'REPLACE': {
    const newEl = renderTree(patch.newNode, isRootBoundary)
    parent.replaceChild(newEl, child)
    break
  }
  case 'UPDATE':
    if (child) {
      applyPropsUpdate(child, patch.prevProps, patch.props)
      if (patch.children) {
        for (let i = patch.children.length - 1; i >= 0; i--) {
          const [childIndex, childPatch] = patch.children[i]
          applyPatch(child, childPatch, childIndex, false)
        }
      }
    }
    break
  }
}


const clearChildren = el => {
  if (!el) return

  // Prefer the standard DOM API.
  if (typeof el.firstChild !== 'undefined') {
    while (el.firstChild) el.removeChild(el.firstChild)
    return
  }

  // Fake DOM fallback.
  while (el.childNodes?.length) el.removeChild(el.childNodes[0])
}

/**
 * Render a vnode into the DOM.
 *
 * If `vtree[0]` is `html`, `head`, or `body`, no container is required.
 *
 * @param {import('./types.js').ElementsVNode} vtree
 * @param {HTMLElement | null} [container]
 */
export const render = (vtree, container = null, { replace = false } = {}) => {
  const target =
    !container && Array.isArray(vtree) && vtree[0] === 'html'
      ? document.documentElement
      : container

  if (!target) {
    throw new Error('render() requires a container for non-html() root')
  }

  const prevVNode = replace ? null : getVNode(target)

  if (!prevVNode) {
    replace && clearChildren(target)
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
    applyPatch(target, patch, 0, true)
  }

  setVNode(target, vtree)
  rootMap.set(vtree, target)
}


const getChildIndex = (parent, child) => {
  const nodes = parent?.childNodes
  if (!nodes) return -1
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i] === child) return i
  }
  return -1
}

/**
 * Wrap a pure function component so it participates in reconciliation.
 *
 * @template {any[]} Args
 * @param {(...args: Args) => import('./types.js').ElementsVNode} fn
 * @returns {(...args: Args) => import('./types.js').ElementsVNode}
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

      // Record the root vnode for this component instance so the renderer can
      // treat it as a boundary without introducing wrapper nodes into the
      // public AST.
      Array.isArray(vnode) && componentRoots.set(vnode, instance)

      if (canUpdateInPlace) {
        const prevVNode = getVNode(prevEl)
        const patch = diffTree(prevVNode, vnode)

        if (!patch) {
          setVNode(prevEl, vnode)
          return vnode
        }

        if (patch.type === 'REPLACE') {
          const replacement = renderTree(vnode, true)
          prevEl.parentNode.replaceChild(replacement, prevEl)
          return getVNode(replacement)
        }

        const parent = prevEl.parentNode
        const index = getChildIndex(parent, prevEl)
        if (index !== -1) applyPatch(parent, patch, index)

        if (patch.type === 'REMOVE') {
          rootMap.delete(instance)
          return vnode
        }

        const nextEl = index === -1 ? prevEl : parent.childNodes[index] || prevEl
        setVNode(nextEl, vnode)
        rootMap.set(instance, nextEl)
        return vnode
      }

      return vnode
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
 * @param {string} tag
 * @returns {import('./types.js').ElementsElementHelper<any>}
 */
const createElementHelper = tag => (...args) => {
  const hasFirstArg = args.length > 0
  const [propsOrChild, ...children] = args
  const props = hasFirstArg && isPropsObject(propsOrChild) ? propsOrChild : {}
  const actualChildren = !hasFirstArg
    ? []
    : props === propsOrChild
      ? children
      : [propsOrChild, ...children]
  return /** @type {import('./types.js').ElementsVNode} */ (
    [tag, props, ...actualChildren]
  )
}

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
/** @type {import('./types.js').ElementsElementMap} */
export const elements = (() => {
  /** @type {Record<string, import('./types.js').ElementsElementHelper<any>>} */
  const acc = {}
  acc.fragment = createElementHelper('fragment')
  for (const tag of tagNames) acc[tag] = createElementHelper(tag)
  return /** @type {import('./types.js').ElementsElementMap} */ (acc)
})()
