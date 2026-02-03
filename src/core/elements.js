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

import { htmlTagNames, svgTagNames } from './tags.js'
import { assignProperties, removeMissingProps } from './props.js'

export const DEBUG =
  typeof process !== 'undefined'
  && process.env
  && (process.env.ELEMENTSJS_DEBUG?.toLowerCase() === 'true'
    || process.env.NODE_ENV === 'development')

const svgNS = 'http://www.w3.org/2000/svg'

/**
 * Primitive values that can be serialized as HTML/SVG attribute values.
 *
 * Note: the runtime assigns most props via `setAttribute`, so strings are the
 * canonical representation. Numbers/booleans are accepted for convenience and
 * are coerced by the DOM.
 *
 * @typedef {string | number | boolean | null | undefined}
 *   ElementsAttributeValue
 */

/**
 * Inline style object applied via `Object.assign(el.style, style)`.
 *
 * @typedef {Partial<CSSStyleDeclaration> & Record<string, string | number>}
 *   ElementsStyleObject
 */

/**
 * A vnode is a declarative array of the form:
 *
 * ```js
 * [tag, props, ...children]
 * ```
 *
 * @typedef {[tag: string, props: ElementsProps, ...children: ElementsChild[]]}
 *   ElementsVNode
 */

/**
 * Child nodes are plain values, nested arrays, or vnodes.
 *
 * Note: nested arrays are treated as children values (they are not
 * automatically flattened).
 *
 * @typedef {ElementsVNode | string | number | boolean | null | undefined
 *   | any[]} ElementsChild
 */

/**
 * Props for the `ontick` animation hook.
 *
 * `ontick` is not a DOM event. It runs once per animation frame and can thread
 * context across ticks:
 *
 * ```js
 * ontick: (el, ctx = { t: 0 }, dt) => ({ ...ctx, t: ctx.t + dt })
 * ```
 *
 * The handler must be synchronous; thrown errors stop ticking.
 *
 * @callback ElementsOnTick
 * @param {Element} el
 * @param {any} ctx
 * @param {number} dtMs
 * @returns {any | void}
 */

/**
 * If an event handler returns a vnode array, the UI updates by replacing the
 * nearest component boundary. Otherwise the event is treated as passive.
 *
 * @typedef {ElementsVNode | void | null | false | '' | 0} ElementsEventResult
 * @typedef {ElementsEventResult | Promise<ElementsEventResult>}
 *   ElementsMaybeAsyncEventResult
 */

/**
 * @template {Event} Evt
 * @callback ElementsEventHandler
 * @param {Evt} event
 * @returns {ElementsMaybeAsyncEventResult}
 */

/**
 * Form event handlers receive `(elements, event)`.
 *
 * @template {Event} FormEvt
 * @callback ElementsFormEventHandler
 * @param {any} elements
 * @param {FormEvt} event
 * @returns {ElementsMaybeAsyncEventResult}
 */

/**
 * Common global HTML attributes.
 *
 * This is a permissive shared set: some attributes only apply to certain
 * elements in the HTML spec, but Elements.js accepts them everywhere because
 * the underlying DOM will ignore irrelevant attributes.
 *
 * This is not exhaustive; `data-*` and `aria-*` are supported via template
 * keys below.
 *
 * @typedef {{
  *   id?: string,
  *   class?: string,
  *   title?: string,
  *   role?: string,
  *   name?: string,
  *   part?: string,
  *   slot?: string,
  *   exportparts?: string,
  *   nonce?: string,
  *   elementtiming?: string,
  *   contentsecuritypolicy?: string,
  *   popovertarget?: string,
  *   popovertargetaction?: 'toggle' | 'show' | 'hide',
  *   autocapitalize?:
  *     | 'none'
  *     | 'sentences'
  *     | 'words'
  *     | 'characters'
  *     | 'on'
  *     | 'off',
  *   enterkeyhint?:
  *     | 'enter'
  *     | 'done'
  *     | 'go'
  *     | 'next'
  *     | 'previous'
  *     | 'search'
  *     | 'send',
  *   inputmode?:
  *     | 'none'
  *     | 'text'
  *     | 'tel'
  *     | 'url'
  *     | 'email'
  *     | 'numeric'
  *     | 'decimal'
  *     | 'search',
  *   virtualkeyboardpolicy?: 'auto' | 'manual',
  *   draggable?: boolean,
  *   hidden?: boolean,
  *   inert?: boolean,
  *   spellcheck?: boolean,
  *   tabindex?: number | string,
  *   accesskey?: string,
  *   translate?: 'yes' | 'no',
  *   autocorrect?: 'on' | 'off',
  *   autocomplete?: string,
  *   lang?: string,
  *   dir?: 'ltr' | 'rtl' | 'auto',
  *   is?: string,
  *   writingsuggestions?: 'true' | 'false' | boolean,
  *   contenteditable?: 'true' | 'false' | 'plaintext-only' | boolean,
  *   autofocus?: boolean,
  *   popover?: 'auto' | 'manual',
  *   label?: string,
  *   itemscope?: boolean,
  *   itemtype?: string,
  *   itemid?: string,
  *   itemprop?: string,
  *   itemref?: string,
  *   vocab?: string,
  *   typeof?: string,
  *   property?: string,
  *   resource?: string,
  *   prefix?: string
 * }} ElementsGlobalAttributes
 */

/**
 * @typedef {{ [key: `data-${string}`]: ElementsAttributeValue }}
 *   ElementsDataAttributes
 */

/**
 * @typedef {{ [key: `aria-${string}`]: ElementsAttributeValue }}
 *   ElementsAriaAttributes
 */

/**
 * Dash-cased attributes commonly used by custom elements and utilities.
 *
 * @typedef {{ [key: `${string}-${string}`]: ElementsAttributeValue }}
 *   ElementsDashedAttributes
 */

/**
 * DOM event handler props.
 *
 * @typedef {Omit<{
 *   [K in keyof GlobalEventHandlersEventMap as `on${K}`]?:
 *     ElementsEventHandler<GlobalEventHandlersEventMap[K]>
 * }, 'oninput' | 'onsubmit' | 'onchange'> & {
 *   oninput?: ElementsFormEventHandler<InputEvent | Event>,
 *   onsubmit?: ElementsFormEventHandler<SubmitEvent | Event>,
 *   onchange?: ElementsFormEventHandler<Event>
 * }} ElementsEventProps
 */

/**
 * Special (non-attribute) props supported by Elements.js.
 *
 * Note: some props are assigned as DOM properties (when present on the target
 * element) rather than attributes: `value`, `checked`, `selected`, `disabled`,
 * `multiple`, `muted`, `volume`, `currentTime`, `playbackRate`, `open`,
 * `indeterminate`.
 *
 * @typedef {{
 *   style?: ElementsStyleObject,
 *   innerHTML?: string,
 *   ontick?: ElementsOnTick,
 *   value?: string | number,
 *   checked?: boolean,
 *   selected?: boolean,
 *   disabled?: boolean,
 *   multiple?: boolean,
 *   muted?: boolean,
 *   volume?: number,
 *   currentTime?: number,
 *   playbackRate?: number,
 *   open?: boolean,
 *   indeterminate?: boolean
 * }} ElementsSpecialProps
 */

/**
 * Props accepted by all Elements.js tag helpers.
 *
 * @typedef {ElementsGlobalAttributes
 *   & ElementsDataAttributes
 *   & ElementsAriaAttributes
 *   & ElementsDashedAttributes
 *   & ElementsEventProps
 *   & ElementsSpecialProps
 * } ElementsProps
 */

/**
 * @callback ElementsElementHelper
 * @param {ElementsProps | ElementsChild} [propsOrChild]
 * @param {...ElementsChild} children
 * @returns {ElementsVNode}
 */

/**
 * Maps vnode instances to their current root DOM element,
 * allowing accurate replacement when the same vnode is re-invoked.
 */
const rootMap = new WeakMap()

const getVNode = el => el?.__vnode
const setVNode = (el, vnode) => (el.__vnode = vnode)
const isRoot = el => !!el?.__root
const setRoot = el => (el.__root = true)

const isNodeEnv = () => typeof document === 'undefined'

let componentUpdateDepth = 0
let currentEventRoot = null

const getCurrentEventRoot = () => currentEventRoot
const setCurrentEventRoot = el => (currentEventRoot = el)

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
  if (Array.isArray(a) && Array.isArray(b)) {
    return {
      type: 'UPDATE',
      prevProps: a[1],
      props: b[1],
      children: diffChildren(a, b)
    }
  }
}

/**
 * Compares the children of two vnodes and returns patch list.
 *
 * @param {any[]} a - Previous vnode
 * @param {any[]} b - New vnode
 * @returns {Array} patches - One per child node
 */
const diffChildren = (a, b) => {
  const patches = []
  const aLen = Math.max(0, a.length - 2)
  const bLen = Math.max(0, b.length - 2)
  const len = Math.max(aLen, bLen)
  for (let i = 0; i < len; i++) {
    patches[i] = diffTree(a[i + 2], b[i + 2])
  }
  return patches
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
  if (typeof node === 'string' || typeof node === 'number') {
    return isNodeEnv()
      ? node
      : document.createTextNode(String(node))
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

  setVNode(el, node)

  if (isRoot && tag !== 'html' && tag !== 'head' && tag !== 'body') {
    setRoot(el)
    rootMap.set(node, el)
  }

  assignProperties(el, props, propsEnv)

  for (let i = 0; i < children.length; i++) {
    const childEl = renderTree(children[i], false, childNamespaceURI)
    el.appendChild(childEl)
  }

  return el
}

propsEnv.renderTree = renderTree

const applyPropsUpdate = (el, prevProps, nextProps) =>
  nextProps
    ? (removeMissingProps(el, prevProps || {}, nextProps),
      assignProperties(el, nextProps, propsEnv),
      undefined)
    : undefined

/**
 * Applies a patch object to a DOM subtree.
 * Handles creation, removal, replacement, and child updates.
 *
 * @param {any} parent - DOM node to mutate
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
    if (child) {
      applyPropsUpdate(child, patch.prevProps, patch.props)
      for (let i = 0; i < patch.children.length; i++) {
        applyPatch(child, patch.children[i], i)
      }
    }
    break
  }
}

/**
 * Render a vnode into the DOM.
 *
 * If `vtree[0]` is `html`, `head`, or `body`, no container is required.
 *
 * @param {ElementsVNode} vtree
 * @param {HTMLElement | null} [container]
 */
export const render = (vtree, container = null) => {
  const target =
    !container && Array.isArray(vtree) && vtree[0] === 'html'
      ? document.documentElement
      : container

  if (!target) {
    throw new Error('render() requires a container for non-html() root')
  }

  const prevVNode = getVNode(target)

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

  setVNode(target, vtree)
  rootMap.set(vtree, target)
}

/**
 * Wrap a pure function component so it participates in reconciliation.
 *
 * @template {any[]} Args
 * @param {(...args: Args) => ElementsVNode} fn
 * @returns {(...args: Args) => ElementsVNode}
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
        const replacement = renderTree(
          ['wrap', { __instance: instance }, vnode],
          true,
        )
        prevEl.parentNode.replaceChild(replacement, prevEl)
        return getVNode(replacement)
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
 * @param {string} tag
 * @returns {ElementsElementHelper}
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
  return /** @type {ElementsVNode} */ ([tag, props, ...actualChildren])
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
/** @type {Record<string, ElementsElementHelper>} */
export const elements = (() => {
  /** @type {Record<string, ElementsElementHelper>} */
  const acc = {}
  acc.fragment = createElementHelper('fragment')
  for (const tag of tagNames) acc[tag] = createElementHelper(tag)
  return acc
})()

// TODO: MathML
// https://developer.mozilla.org/en-US/docs/Web/MathML/Reference/Element
