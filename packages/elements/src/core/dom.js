import { assignProperties, removeMissingProps } from './props.js'
import { createIdentity, present, resume, sourceOf, subscribe } from './observer.js'
import { matchChildren } from './reconcile.js'
import { stopTickLoop } from './tick.js'
import { validateProps } from './attributes.js'
import { watchHistory } from './history.js'
import { isEventProp } from './events.js'
import { htmlNS, svgNS, namespaceAt, childNamespace } from './namespaces.js'

// Every projected node retains its boundary, including the outer boundaries.
// The reverse subscription edges are weak, so native removal permits collection.
const boundaries = new WeakMap()

/** @typedef {{ source: any, namespace: any, owner: any,
 * node?: any, end?: any, children?: Mount[], projection?: Mount,
 * identity?: any, unsubscribe?: () => void, scope?: Mount, notify?: Function }} Mount */

const tagOf = value => Array.isArray(value) ? value[0] : null
const propsOf = value => Array.isArray(value) ? value[1] || {} : {}
const childrenOf = value =>
  'innerHTML' in propsOf(value) ? [] : value.slice(2)
const kindOf = value =>
  typeof value === 'string' || typeof value === 'number' ? 'text'
    : typeof tagOf(value) === 'string' ? tagOf(value) : 'empty'
const documentOf = node =>
  node.nodeType === 9 ? node : node.ownerDocument || document
const firstNode = record =>
  record.projection ? firstNode(record.projection) : record.node
const lastNode = record =>
  record.projection ? lastNode(record.projection) : record.end || record.node
const nodesOf = record =>
  record.projection ? nodesOf(record.projection)
    : record.end ? [record.node, ...record.children.flatMap(nodesOf), record.end]
      : [record.node]

const release = record => {
  record.unsubscribe?.()
  record.projection ? release(record.projection)
    : (boundaries.delete(record.node), record.end && boundaries.delete(record.end),
       stopTickLoop(record.node), record.children?.forEach(release))
}

const removeNodes = record =>
  record.projection ? removeNodes(record.projection)
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
const mountBoundary = (source, identity, parent, namespace, before, scope = null) => {
  const record = { source, identity, namespace, owner: identity, scope,
                   projection: null, unsubscribe: null, notify: null }
  record.projection = mount(identity.current, parent, namespace, identity, before, record)
  record.notify = next => {
    record.projection = patch(record.projection, next, identity)
  }
  record.unsubscribe = subscribe(identity, record, documentOf(parent))
  return record
}

/** @returns {Mount} */
const mount = (source, parent, namespace, owner, before = null, scope = null) => {
  const association = sourceOf(source)
  association && present(source)
  return association
    ? mountBoundary(source, association.identity, parent, namespace, before, scope)
    : mountValue(source, parent, namespace, owner, before, scope)
}

/** @returns {Mount} */
const mountValue = (source, parent, namespace, owner, before, scope) => {
  const kind = kindOf(source)
  const props = propsOf(source)
  const ownNamespace = kind === 'fragment' ? namespace : namespaceAt(source, namespace)
  const doc = documentOf(parent)
  const node = kind === 'text' ? doc.createTextNode(String(source))
    : kind === 'empty' || kind === 'fragment' ? doc.createComment('')
      : doc.createElementNS(ownNamespace, kind)
  /** @type {Mount} */
  const record = { source, namespace, owner, node, children: [], scope }
  boundaries.set(node, scope)
  if (kind === 'fragment') {
    record.end = doc.createComment('')
    boundaries.set(record.end, scope)
    parent.insertBefore(node, before)
    parent.insertBefore(record.end, before)
    record.children = childrenOf(source).map(child =>
      mount(child, parent, namespace, owner, record.end, scope))
  } else {
    if (kind !== 'text' && kind !== 'empty') {
      assignProperties(node, beforeChildrenProps(kind, props), propsEnv(owner))
      record.children = childrenOf(source).map(child =>
        mount(child, node, childNamespace(kind, props, ownNamespace), owner, null, scope))
      afterChildrenProps(node, kind, props, owner)
    }
    parent.insertBefore(node, before)
  }
  return record
}

const patchChildren = (record, sources, owner, namespace) => {
  const parent = record.end ? record.node.parentNode : record.node
  const previous = record.children
  const matches = matchChildren(previous.map(child => child.source), sources)
  const used = new Set(matches)
  const next = sources.map((source, index) =>
    matches[index] === -1
      ? mount(source, parent, namespace, owner, record.end || null, record.scope)
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
  // Retire subscriptions before selection can update shared descendants.
  release(record)
  const first = firstNode(record)
  const parent = first.parentNode
    || documentOf(first).createDocumentFragment()
  const next = mount(source, parent, namespace, owner,
                     first.parentNode ? first : null, record.scope)
  removeNodes(record)
  return next
}

/** @returns {Mount} */
const patch = (record, source, owner) => {
  const association = sourceOf(source)
  const sameIdentity = record.identity && association?.identity === record.identity
  const sameValue = source === record.source

  return sameIdentity
    ? (present(source), record.source = source, record)
    : sameValue && record.owner === owner ? record
      : record.identity
        ? replace(record, source, owner)
        : association || kindOf(source) !== kindOf(record.source)
          || namespaceAt(source, record.namespace) !== namespaceAt(record.source, record.namespace)
          ? replace(record, source, owner)
          : patchValue(record, source, owner, kindOf(source))
}

/** @returns {Mount} */
const patchValue = (record, source, owner, kind) => {
  const props = propsOf(source)
  const previous = propsOf(record.source)
  const namespace = kind === 'fragment' ? record.namespace : namespaceAt(source, record.namespace)
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
 * Create a live DOM projection, optionally appending it to a target.
 * Observer event returns update all projections of that identity; plain vnode
 * returns update their captured boundary. Fresh observations select immediately.
 * Each call creates independent DOM and preserves existing target children.
 * Vocabulary helpers determine namespaces independently of the target.
 * Returns the root element, or a DocumentFragment for an explicit fragment.
 * Inserting a fragment empties it. Replacing an observer's root does not change
 * a previously returned element reference; it still refers to the original node.
 *
 * @param {import('./types.js').ElementsVNode} graph
 * @param {Element | Document | DocumentFragment} [target] Optional DOM parent.
 * @returns {Element | DocumentFragment} The initially projected DOM.
 */
export const project = (graph, target) => {
  if (target !== undefined && (!target || typeof target.insertBefore !== 'function'))
    throw new TypeError('project() target must be a DOM parent.')
  watchHistory()
  const staging = (target ? documentOf(target) : document).createDocumentFragment()
  const record = mountBoundary(graph, createIdentity(graph), staging, htmlNS, null)
  const first = firstNode(record)
  const projection = first === lastNode(record) ? staging.removeChild(first) : staging
  target?.insertBefore(projection, null)
  return projection
}
