import { assignProperties, removeMissingProps } from './props.js'
import { createIdentity, present, resume, sourceOf, subscribe } from './observer.js'
import { matchChildren, matchesSingleChild, stablePositions } from './reconcile.js'
import { stopTickLoop } from './tick.js'
import { checkpoint, mutateRange, updating } from './update.js'
import { validateProps } from './attributes.js'
import { watchHistory } from './history.js'
import { isEventProp } from './events.js'
import { childNamespace, htmlNS, namespaceAt, svgNS } from './namespaces.js'

// Every projected node retains its boundary, including the outer boundaries.
// The reverse subscription edges are weak, so native removal permits collection.
const boundaries = new WeakMap()
const textKind = Symbol('text'), emptyKind = Symbol('empty')
const emptyProps = Object.freeze({}), emptyChildren = []
Object.freeze(emptyChildren)

/** @typedef {{ source: any, namespace: any, owner: any,
 * node?: any, end?: any, children?: Mount[], projection?: Mount,
 * identity?: any, unsubscribe?: () => void, scope?: Mount, notify?: Function,
 * document?: any, update?: any, props?: any, dirty?: boolean,
 * location?: any, retired?: any[], reordering?: boolean }} Mount */

const tagOf = value => Array.isArray(value) ? value[0] : null
const propsOf = value => Array.isArray(value) ? value[1] || emptyProps : emptyProps
const childrenOf = value =>
  'innerHTML' in propsOf(value) ? [] : value.slice(2)
const isText = value => typeof value === 'string' || typeof value === 'number'
const kindOf = value =>
  isText(value) ? textKind
    : typeof tagOf(value) === 'string' ? tagOf(value) : emptyKind
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
  if (record.update) record.update.cancelled = true
  record.unsubscribe?.()
  record.projection ? release(record.projection)
    : (boundaries.delete(record.node), record.end && boundaries.delete(record.end),
      stopTickLoop(record.node), record.children?.forEach(release))
}

const discardedNodes = record =>
  [...record.projection ? discardedNodes(record.projection) : nodesOf(record),
   ...record.retired || []].filter(Boolean)
const inPlace = (record, parent, before) =>
  firstNode(record) === before
    || firstNode(record).parentNode === parent && lastNode(record).nextSibling === before
const moveBefore = (record, parent, before) =>
  mutateRange(nodesOf(record), node => parent.insertBefore(node, before))

const appliedProps = record => (key, value) => {
  const props = record.props, previous = props[key]
  props[key] = value
  return () => { if (record.props === props) props[key] = previous }
}
const propsEnv = (owner, record) => ({ svgNS, resume: result => resume(result, owner),
                                       applied: record && appliedProps(record), style: record?.props?.style })
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
const afterChildrenProps = (node, tag, props, owner, record) =>
  tag === 'select' && 'value' in props
    && (record.props = { ...record.props },
    assignProperties(node, { value: props.value }, propsEnv(owner, record)))

// Publish in-progress records before native callbacks can select another observation.
// Placement information is temporary: finished projections never retain former parents.
const finishMount = record => {
  const location = record.location
  if (location && firstNode(record).parentNode !== location.parent) {
    location.parent.insertBefore(firstNode(record), location.before)
    checkpoint()
  }
  if (record.retired)
    mutateRange(record.retired, node => node.parentNode?.removeChild(node))
  record.location = null
  record.retired = null
}

/** @returns {Mount} */
const mountBoundary = (source, identity, parent, namespace, before, scope = null,
                       publish = _record => {}, retired = null) => {
  const doc = documentOf(parent)
  const record = { source, identity, namespace, owner: identity, scope,
                   projection: null, unsubscribe: null, notify: null,
                   location: { parent, before }, retired,
                   get document() { return this.projection ? documentOf(firstNode(this)) : doc } }
  publish(record)
  record.notify = next => updating(record, () => {
    const publish = projection => { record.projection = projection }
    record.projection
      ? patch(record.projection, next, identity, publish)
      : mount(next, record.location.parent, namespace, identity,
              record.location.before, record, publish)
    checkpoint()
    finishMount(record)
  })
  record.unsubscribe = subscribe(identity, record)
  record.notify(identity.current)
  checkpoint()
  return record
}

/** @returns {Mount} */
const mount = (source, parent, namespace, owner, before = null, scope = null,
               publish = _record => {}, retired = null) => {
  checkpoint()
  const association = sourceOf(source)
  association && present(source)
  checkpoint()
  return association
    ? mountBoundary(source, association.identity, parent, namespace, before, scope, publish, retired)
    : mountValue(source, parent, namespace, owner, before, scope, publish, retired)
}

/** @returns {Mount} */
const mountValue = (source, parent, namespace, owner, before, scope, publish, retired) => {
  const kind = kindOf(source)
  const props = propsOf(source)
  const ownNamespace = kind === 'fragment' ? namespace : namespaceAt(source, namespace)
  const doc = documentOf(parent)
  const node = kind === textKind ? doc.createTextNode(String(source))
    : kind === emptyKind || kind === 'fragment' ? doc.createComment('')
      : doc.createElementNS(ownNamespace, kind)
  checkpoint()
  /** @type {Mount} */
  const record = { source, namespace, owner, node,
                   children: kind === textKind || kind === emptyKind ? emptyChildren : [],
                   scope, props: {}, dirty: true,
                   location: { parent, before }, retired }
  boundaries.set(node, scope)
  publish(record)
  if (kind === 'fragment') {
    record.end = doc.createComment('')
    boundaries.set(record.end, scope)
    parent.insertBefore(node, before)
    parent.insertBefore(record.end, before)
    childrenOf(source).forEach(child =>
      mount(child, parent, namespace, owner, record.end, scope,
            child => { record.children.push(child) }))
  } else if (kind !== textKind && kind !== emptyKind) {
    assignProperties(node, beforeChildrenProps(kind, props), propsEnv(owner, record))
    childrenOf(source).forEach(child =>
      mount(child, node, childNamespace(kind, props, ownNamespace), owner, null, scope,
            child => { record.children.push(child) }))
    afterChildrenProps(node, kind, props, owner, record)
  }
  finishMount(record)
  // Incremental publication permits reentry; compact its spare capacity once complete.
  if (record.children.length) record.children = record.children.slice()
  record.props = props
  record.dirty = false
  return record
}

// Only a reentrant update needs to reconstruct an interrupted sibling order.
// Ordinary moves keep reconciliation linear rather than splicing for every node.
const orderedChildren = (record, parent) => {
  const children = new Map(record.children.map(child => [firstNode(child), child]))
  return Array.from(parent.childNodes).flatMap(node => children.has(node) ? [children.get(node)] : [])
}

const patchChildren = (record, source, owner, namespace) => {
  checkpoint()
  const parent = record.end ? record.node.parentNode : record.node
  if (record.reordering) record.children = orderedChildren(record, parent)
  record.reordering = false
  const previous = record.children
  // Empty leaves and a matched single child need no sibling arrays.
  if (!previous.length && source.length <= 2) return previous
  const single = source.length === 3 && 2 in source
  const childSource = single ? source[2] : undefined
  if (previous.length === 1 && single
      && matchesSingleChild(previous[0].source, childSource)
      && previous[0].namespace === namespace && firstNode(previous[0]).parentNode === parent) {
    const child = patch(previous[0], childSource, owner,
                        child => { record.children[0] = child })
    checkpoint()
    record.reordering = true
    if (firstNode(child).parentNode !== parent && !inPlace(child, parent, record.end || null))
      moveBefore(child, parent, record.end || null)
    checkpoint()
    record.reordering = false
    return record.children
  }
  const sources = single ? [childSource] : childrenOf(source)
  const matches = matchChildren(previous.map(child => child.source), sources)
  const allMatched = previous.length === sources.length && !matches.includes(-1)
  if (!allMatched) record.children = previous.slice()
  const used = !allMatched && previous.length > 1 ? new Set(matches) : null
  const next = sources.map((source, index) => {
    checkpoint()
    const slot = matches[index] === -1 ? record.children.length : matches[index]
    const publish = child => { record.children[slot] = child }
    const child = matches[index] === -1
      ? mount(source, parent, namespace, owner, record.end || null, record.scope, publish)
      : previous[matches[index]].namespace !== namespace
        ? replace(previous[matches[index]], source, owner, namespace, publish)
        : patch(previous[matches[index]], source, owner, publish)
    checkpoint()
    return child
  })
  let discarded
  if (!allMatched) previous.forEach((child, index) => {
    checkpoint()
    if (!(used ? used.has(index) : matches.includes(index))) {
      record.children[index] = null
      release(child)
      discarded ||= []
      discarded.push(...discardedNodes(child))
    }
  })
  if (discarded) {
    record.children = record.children.filter(Boolean)
    mutateRange(discarded, node => node.parentNode?.removeChild(node))
  }

  // Place only new or out-of-sequence ranges, leaving retained controls alone.
  const stable = stablePositions(matches)
  record.reordering = true
  let before = record.end || null
  for (let index = next.length - 1; index >= 0; index--) {
    const child = next[index]
    if ((matches[index] === -1 || stable && !stable.has(index)
         || firstNode(child).parentNode !== parent) && !inPlace(child, parent, before)) {
      moveBefore(child, parent, before)
    }
    before = firstNode(child)
  }
  checkpoint()
  record.reordering = false
  return next
}

/** @returns {Mount} */
const replace = (record, source, owner, namespace = record.namespace, publish = _record => {}) => {
  // Retire subscriptions before selection can update shared descendants.
  release(record)
  const first = firstNode(record)
  const parent = first?.parentNode || record.location?.parent
    || documentOf(first).createDocumentFragment()
  const retired = discardedNodes(record)
  return mount(source, parent, namespace, owner,
               first?.parentNode ? first : record.location?.before || null,
               record.scope, publish, retired)
}

/** @returns {Mount} */
const patch = (record, source, owner, publish = _record => {}) => {
  checkpoint()
  const association = sourceOf(source)
  const sameIdentity = record.identity && association?.identity === record.identity
  const sameValue = source === record.source

  return sameIdentity
    ? (present(source), record.source = source, record)
    : sameValue && !record.dirty && record.owner === owner ? record
      : record.identity
        ? replace(record, source, owner, record.namespace, publish)
        : association || kindOf(source) !== kindOf(record.source)
          || namespaceAt(source, record.namespace) !== namespaceAt(record.source, record.namespace)
          ? replace(record, source, owner, record.namespace, publish)
          : patchValue(record, source, owner, kindOf(source))
}

/** @returns {Mount} */
const patchValue = (record, source, owner, kind) => {
  const props = propsOf(source)
  const previous = record.props || propsOf(record.source)
  record.dirty = true
  const namespace = kind === 'fragment' ? record.namespace : namespaceAt(source, record.namespace)
  validateProps(props)
  if (kind === textKind) record.node.nodeValue = String(source)
  else if (kind !== emptyKind) {
    if (kind !== 'fragment') {
      // Release managed children before assigning innerHTML removes their DOM.
      if ('innerHTML' in props) {
        record.children.forEach(release)
        record.children = []
      }
      if (Object.keys(previous).length || Object.keys(props).length) {
        const changed = changedProps(previous, props, record.owner !== owner)
        if (Object.keys(changed).length || Object.keys(previous).some(key => !(key in props))) {
          record.props = { ...previous }
          removeMissingProps(record.node, previous, props, appliedProps(record))
          assignProperties(record.node, beforeChildrenProps(kind, changed), propsEnv(owner, record))
        }
      }
    }
    const children = 'innerHTML' in props ? []
      : patchChildren(record, source, owner,
                      childNamespace(kind, props, namespace))
    record.children = children
    afterChildrenProps(record.node, kind, props, owner, record)
  }
  checkpoint()
  finishMount(record)
  record.source = source
  record.owner = owner
  record.props = props
  record.dirty = false
  return record
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
  const doc = target ? documentOf(target) : document
  watchHistory(doc.defaultView)
  const staging = doc.createDocumentFragment()
  let record
  updating({}, () => { record = mountBoundary(graph, createIdentity(graph), staging, htmlNS, null) })
  const first = firstNode(record)
  const projection = first === lastNode(record) ? staging.removeChild(first) : staging
  target?.insertBefore(projection, null)
  return projection
}
