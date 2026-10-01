import { assignProperties, removeMissingProps } from './props.js'
import { createOrigin, select, present, resume, sourceOf, subscribe } from './observer.js'
import { matchChildren } from './reconcile.js'
import { stopTickLoop } from './tick.js'
import { validateProps } from './attributes.js'
import { watchHistory } from './history.js'
import { isEventProp } from './events.js'

const svgNS = 'http://www.w3.org/2000/svg'
const mathNS = 'http://www.w3.org/1998/Math/MathML'
const roots = new WeakMap()
const documentSlots = new WeakMap()

/** @typedef {{ source: any, parent: any, namespace: any, owner: any,
 * node?: any, end?: any, children?: Mount[], projection?: Mount,
 * origin?: any, unsubscribe?: () => void, adopted?: any }} Mount */

const tagOf = value => Array.isArray(value) ? value[0] : null
const propsOf = value => Array.isArray(value) ? value[1] || {} : {}
const childrenOf = value =>
  'innerHTML' in propsOf(value) ? [] : value.slice(2)
const kindOf = value =>
  typeof value === 'string' || typeof value === 'number' ? 'text'
    : typeof tagOf(value) === 'string' ? tagOf(value) : 'empty'
const namespaceOf = (tag, parent) =>
  tag === 'svg' ? svgNS : tag === 'math' ? mathNS : parent
const childNamespace = (tag, props, namespace) =>
  tag.toLowerCase() === 'foreignobject'
  || tag === 'annotation-xml' && /^(text\/html|application\/xhtml\+xml)$/i.test(props.encoding)
    ? null : namespace
const containerNamespace = node =>
  childNamespace(node.localName || node.tagName.toLowerCase(),
                 { encoding: node.getAttribute('encoding') },
                 [svgNS, mathNS].includes(node.namespaceURI) ? node.namespaceURI : null)
const firstNode = record =>
  record.projection ? firstNode(record.projection) : record.node
const lastNode = record =>
  record.projection ? lastNode(record.projection) : record.end || record.node
const nodesOf = record =>
  record.projection ? nodesOf(record.projection)
    : record.end ? [record.node, ...record.children.flatMap(nodesOf), record.end]
      : [record.node]

const clearChildren = node => {
  while (node.firstChild) node.removeChild(node.firstChild)
}

const release = record => {
  record.unsubscribe?.()
  record.adopted && documentSlots.get(record.adopted) === record
    && documentSlots.delete(record.adopted)
  record.projection ? release(record.projection)
    : (stopTickLoop(record.node), record.children?.forEach(release))
}

const removeNodes = record =>
  record.projection ? removeNodes(record.projection)
    : record.adopted ? record.children.forEach(removeNodes)
      : nodesOf(record).forEach(node => node.parentNode?.removeChild(node))

const remove = record => (release(record), removeNodes(record))

const moveBefore = (record, parent, before) =>
  firstNode(record) === before ? undefined
    : nodesOf(record).forEach(node => parent.insertBefore(node, before))

const propsEnv = owner => ({ svgNS, resume: result => resume(result, owner) })
const equalProp = (key, left, right) =>
  left === right || key === 'style' && left && right
    && typeof left === 'object' && typeof right === 'object'
    && Object.keys(left).length === Object.keys(right).length
    && Object.keys(left).every(name => left[name] === right[name])
const changedProps = (previous, next, changedOwner = false) =>
  Object.fromEntries(Object.entries(next).filter(([key, value]) =>
    !equalProp(key, previous[key], value)
    || changedOwner && key !== 'ontick' && isEventProp(key, value)))
const beforeChildrenProps = (tag, props) =>
  tag === 'select'
    ? Object.fromEntries(Object.entries(props).filter(([key]) => key !== 'value'))
    : props
const afterChildrenProps = (node, tag, props, owner) =>
  tag === 'select' && 'value' in props
    && assignProperties(node, { value: props.value }, propsEnv(owner))

/** @returns {Mount} */
const mountBoundary = (source, origin, parent, namespace, before, adopted = null,
                       owner = origin) => {
  const record = { source, origin, parent, namespace, owner,
                   projection: null, unsubscribe: null, adopted }
  record.projection = mount(origin.current, parent, namespace, owner, before, adopted)
  const notify = next => {
    record.projection = patch(record.projection, next, record.owner)
  }
  record.unsubscribe = subscribe(origin, notify, document)
  return record
}

// Document slots may acquire a different event owner without changing source.
// Rebind handlers even then, while preserving native state and child origins.
const updateBoundary = (record, source, owner) => {
  const changedOwner = record.owner !== owner
  record.owner = owner
  record.origin.current !== source ? select(record.origin, source)
    : changedOwner && (record.projection = patch(record.projection, source, owner))
  record.source = source
  return record
}

const documentNode = tag =>
  tag === 'html' ? document.documentElement
    : (tag === 'head' ? document.head : document.body)
      || document.documentElement.appendChild(document.createElement(tag))

const documentBoundary = (source, node, owner = null) => {
  const previous = documentSlots.get(node)
  const origin = previous?.origin || createOrigin(source)
  const record = previous || mountBoundary(source, origin, node.parentNode,
                                           null, null, node, owner || origin)
  previous && updateBoundary(record, source, owner || origin)
  documentSlots.set(node, record)
  return record
}

/** @returns {Mount} */
const mount = (source, parent, namespace, owner, before = null, adopted = null) => {
  const identity = sourceOf(source)
  identity && present(source)
  const kind = kindOf(source)
  const isDocumentChild = !adopted && parent === document.documentElement
    && (kind === 'head' || kind === 'body')

  return identity
    ? mountBoundary(source, identity.origin, parent, namespace, before, adopted)
    : isDocumentChild ? documentBoundary(source, documentNode(kind), owner)
      : mountValue(source, parent, namespace, owner, before, adopted)
}

/** @returns {Mount} */
const mountValue = (source, parent, namespace, owner, before, adopted) => {
  const kind = kindOf(source)
  if (adopted && kind !== adopted.tagName.toLowerCase())
    throw new TypeError('A document root must retain its html, head, or body tag.')
  const props = propsOf(source)
  const ownNamespace = namespaceOf(kind, namespace)
  const node = adopted || (kind === 'text' ? document.createTextNode(String(source))
    : kind === 'empty' || kind === 'fragment' ? document.createComment('')
      : ownNamespace ? document.createElementNS(ownNamespace, kind)
        : document.createElement(kind))
  /** @type {Mount} */
  const record = { source, parent, namespace, owner, node, children: [], adopted }
  if (kind === 'fragment') {
    record.end = document.createComment('')
    parent.insertBefore(node, before)
    parent.insertBefore(record.end, before)
    record.children = childrenOf(source).map(child =>
      mount(child, parent, namespace, owner, record.end))
  } else {
    if (kind !== 'text' && kind !== 'empty') {
      adopted && kind === 'body' && clearChildren(node)
      assignProperties(node, beforeChildrenProps(kind, props), propsEnv(owner))
      record.children = childrenOf(source).map(child =>
        mount(child, node, childNamespace(kind, props, ownNamespace), owner))
      afterChildrenProps(node, kind, props, owner)
    }
    !adopted && parent.insertBefore(node, before)
  }
  return record
}

const patchChildren = (record, sources, owner, namespace) => {
  const parent = record.end ? record.parent : record.node
  const previous = record.children
  const matches = matchChildren(previous.map(child => child.source), sources)
  const used = new Set(matches)
  const next = sources.map((source, index) =>
    matches[index] === -1
      ? mount(source, parent, namespace, owner, record.end || null)
      : previous[matches[index]].namespace !== namespace
        ? replace(previous[matches[index]], source, owner, namespace)
        : patch(previous[matches[index]], source, owner))
  previous.forEach((child, index) => !used.has(index) && remove(child))

  // Walk forward so appends/removals leave focused preceding nodes untouched.
  let cursor = record.end ? record.node.nextSibling
    : next.length ? parent.firstChild : null
  next.forEach(child => {
    moveBefore(child, parent, cursor)
    cursor = lastNode(child).nextSibling
  })
  return next
}

/** @returns {Mount} */
const replace = (record, source, owner, namespace = record.namespace) => {
  const adopted = record.adopted
  // Selecting the replacement can notify shared descendants. Retire this
  // projection first so those notifications cannot remove its insertion anchor.
  release(record)
  if (adopted) {
    removeMissingProps(adopted, propsOf(record.source), propsOf(source))
    removeNodes(record)
  }
  const next = mount(source, record.parent, namespace, owner,
                     adopted ? null : firstNode(record), adopted)
  !adopted && removeNodes(record)
  return next
}

/** @returns {Mount} */
const patch = (record, source, owner) => {
  const identity = sourceOf(source)
  const sameOrigin = record.origin && identity?.origin === record.origin
  const sameValue = source === record.source

  return sameOrigin
    ? (present(source), record.source = source, record)
    : sameValue && record.owner === owner ? record
      : record.origin
        ? record.adopted
          ? updateBoundary(record, source, owner)
          : replace(record, source, owner)
        : identity || kindOf(source) !== kindOf(record.source) ? replace(record, source, owner)
          : patchValue(record, source, owner, kindOf(source))
}

/** @returns {Mount} */
const patchValue = (record, source, owner, kind) => {
  const props = propsOf(source)
  const previous = propsOf(record.source)
  const namespace = namespaceOf(kind, record.namespace)
  validateProps(props)
  if (kind === 'text') record.node.nodeValue = String(source)
  else if (kind !== 'empty') {
    if (kind !== 'fragment') {
      // Release managed children before assigning innerHTML removes their DOM.
      'innerHTML' in props && record.children.forEach(release)
      removeMissingProps(record.node, previous, props)
      assignProperties(record.node,
                       beforeChildrenProps(kind, changedProps(previous, props, record.owner !== owner)),
                       propsEnv(owner))
    }
    const children = 'innerHTML' in props ? []
      : patchChildren(record, childrenOf(source), owner,
                      childNamespace(kind, props, namespace))
    record = { ...record, children }
    afterChildrenProps(record.node, kind, props, owner)
  }
  return { ...record, source, owner }
}

/**
 * Mount a vnode, normally once at page load. Event continuations update it.
 * All projections of one observer definition share its current observation.
 * Fresh observer vnodes select when first rendered; reused references retain
 * current state. Calls constructing those vnodes never update the DOM alone.
 * `html`, `head`, and `body` roots may omit the container. Existing unmanaged
 * head assets are retained; the first body mount owns its contents.
 *
 * @param {import('./types.js').ElementsVNode} vnode
 * @param {Element | null} [container]
 * @param {{ replace?: boolean }} [options]
 */
export const render = (vnode, container = null, { replace: fresh = false } = {}) => {
  const tag = tagOf(vnode)
  if (!container && !['html', 'head', 'body'].includes(tag))
    throw new Error('render() requires a container for non-document roots')

  watchHistory()
  if (!container) documentBoundary(vnode, documentNode(tag))
  else {
    const previous = roots.get(container)
    fresh && previous && remove(previous)
    fresh && clearChildren(container)
    const record = previous && !fresh ? previous
      : mountBoundary(vnode, createOrigin(vnode), container, containerNamespace(container), null)
    previous && !fresh && select(record.origin, vnode)
    roots.set(container, record)
  }
}
