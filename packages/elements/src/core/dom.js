import { assignProperties, removeMissingProps } from './props.js'
import { checkpoint, mutateRange, updating } from './update.js'
import { childNamespace, htmlNS, namespaceAt, svgNS } from './namespaces.js'
import { createIdentity, present, resume, sourceOf, subscribe } from './observer.js'
import { isSingleChildMatch, matchChildren, stablePositions } from './reconcile.js'
import { isEventProp } from './events.js'
import { stopTickLoop } from './tick.js'
import { validateProps } from './attributes.js'
import { watchHistory } from './history.js'

// Every projected node retains its boundary, including the outer boundaries.
// Weak subscriptions let the browser collect discarded DOM.
const boundaries = new WeakMap()
const textKind = Symbol('text')
const emptyKind = Symbol('empty')
const emptyProps = Object.freeze({})
const emptyChildren = []
Object.freeze(emptyChildren)

/** @typedef {{ source: any, namespace: any, owner: any,
 * node?: any, end?: any, children?: Mount[], projection?: Mount,
 * identity?: any, unsubscribe?: () => void, scope?: Mount, notify?: Function,
 * document?: any, update?: any, props?: any, isDirty?: boolean,
 * location?: any, retired?: any[], isReordering?: boolean }} Mount */

const tagOf = value => Array.isArray(value) ? value[0] : null
const propsOf = value =>
  Array.isArray(value) ? value[1] || emptyProps : emptyProps
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
    : record.end
      ? [record.node, ...record.children.flatMap(nodesOf), record.end]
      : [record.node]

const release = record => {
  if (record.update) record.update.isCancelled = true
  record.unsubscribe?.()
  if (record.projection) release(record.projection)
  else {
    boundaries.delete(record.node)
    if (record.end) boundaries.delete(record.end)
    stopTickLoop(record.node)
    record.children?.forEach(release)
  }
}

const discardedNodes = record =>
  [...record.projection ? discardedNodes(record.projection) : nodesOf(record),
   ...record.retired || []].filter(Boolean)
const isInPlace = (record, parent, before) =>
  firstNode(record) === before
    || firstNode(record).parentNode === parent
      && lastNode(record).nextSibling === before
const moveBefore = (record, parent, before) =>
  mutateRange(nodesOf(record), node => parent.insertBefore(node, before))

const appliedProps = record => (key, value) => {
  const props = record.props
  const previous = props[key]
  props[key] = value
  return () => { if (record.props === props) props[key] = previous }
}
const propsEnv = (owner, record) => ({
  svgNS,
  resume: result => resume(result, owner),
  applied: appliedProps(record),
  style: record.props.style
})

const isEqualProp = (key, left, right) =>
  left === right || key === 'style' && left != null && right != null
    && typeof left === 'object' && typeof right === 'object'
    && Object.keys(left).length === Object.keys(right).length
    && Object.keys(left).every(name =>
      Object.hasOwn(right, name) && left[name] === right[name])
const changedProps = (previous, next, hasOwnerChanged = false) =>
  Object.fromEntries(Object.entries(next).filter(([key, value]) =>
    !isEqualProp(key, previous[key], value)
    || hasOwnerChanged && key !== 'ontick' && isEventProp(key, value)))
const beforeChildrenProps = (tag, props) =>
  tag === 'select'
    ? Object.fromEntries(Object.entries(props).filter(([key]) => key !== 'value'))
    : props
const afterChildrenProps = (node, tag, props, owner, record) => {
  if (tag === 'select' && 'value' in props) {
    record.props = { ...record.props }
    assignProperties(node, { value: props.value }, propsEnv(owner, record))
  }
}

// Publish records before native callbacks run. Once placed, a projection
// must release its former parent.
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
const mountBoundary = (source, identity, parent, namespace, before,
                       scope = null, publish = _record => {},
                       retired = null) => {
  const doc = documentOf(parent)
  const record = { source, identity, namespace, owner: identity, scope,
                   projection: null, unsubscribe: null, notify: null,
                   location: { parent, before }, retired,
                   get document() {
                     return this.projection ? documentOf(firstNode(this)) : doc
                   } }
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
    ? mountBoundary(source, association.identity, parent, namespace, before,
                    scope, publish, retired)
    : mountValue(source, parent, namespace, owner,
                 before, scope, publish, retired)
}

/** @returns {Mount} */
const mountValue = (source, parent, namespace, owner,
                    before, scope, publish, retired) => {
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
                   children: kind === textKind || kind === emptyKind
                     ? emptyChildren : [],
                   scope, props: {}, isDirty: true,
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
    assignProperties(node, beforeChildrenProps(kind, props),
                     propsEnv(owner, record))
    childrenOf(source).forEach(child =>
      mount(child, node, childNamespace(kind, props, ownNamespace),
            owner, null, scope,
            child => { record.children.push(child) }))
    afterChildrenProps(node, kind, props, owner, record)
  }
  finishMount(record)
  // Incremental publication permits reentry; compact its spare capacity once
  // complete.
  if (record.children.length) record.children = record.children.slice()
  record.props = props
  record.isDirty = false
  return record
}

// Only a reentrant update needs to reconstruct an interrupted sibling order.
// Ordinary moves keep reconciliation linear rather than splicing for every
// node.
const orderedChildren = (record, parent) => {
  const children = new Map(record.children.map(child =>
    [firstNode(child), child]))
  return Array.from(parent.childNodes, node => children.get(node))
    .filter(Boolean)
}

const patchChildren = (record, source, owner, namespace) => {
  checkpoint()
  const parent = record.end ? record.node.parentNode : record.node
  if (record.isReordering) record.children = orderedChildren(record, parent)
  record.isReordering = false
  const previous = record.children
  // Empty leaves and a matched single child need no sibling arrays.
  if (!previous.length && source.length <= 2) return previous
  const hasSingleChild = source.length === 3 && 2 in source
  const childSource = hasSingleChild ? source[2] : undefined
  if (previous.length === 1 && hasSingleChild
      && isSingleChildMatch(previous[0].source, childSource)
      && previous[0].namespace === namespace
        && firstNode(previous[0]).parentNode === parent) {
    const child = patch(previous[0], childSource, owner,
                        child => { record.children[0] = child })
    checkpoint()
    record.isReordering = true
    if (firstNode(child).parentNode !== parent)
      moveBefore(child, parent, record.end || null)
    checkpoint()
    record.isReordering = false
    return record.children
  }
  const sources = hasSingleChild ? [childSource] : childrenOf(source)
  const matches = matchChildren(previous.map(child => child.source), sources)
  const areAllMatched =
    previous.length === sources.length && !matches.includes(-1)
  if (!areAllMatched) record.children = previous.slice()
  const used = !areAllMatched && previous.length > 1 ? new Set(matches) : null
  const next = sources.map((source, index) => {
    checkpoint()
    const match = matches[index]
    const slot = match === -1 ? record.children.length : match
    const publish = child => { record.children[slot] = child }
    const child = match === -1
      ? mount(source, parent, namespace, owner, record.end || null,
              record.scope, publish)
      : previous[match].namespace !== namespace
        ? replace(previous[match], source, owner, namespace, publish)
        : patch(previous[match], source, owner, publish)
    checkpoint()
    return child
  })
  let discarded
  if (!areAllMatched) previous.forEach((child, index) => {
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
  record.isReordering = true
  let before = record.end || null
  for (let index = next.length - 1; index >= 0; index--) {
    const child = next[index]
    const shouldMove = matches[index] === -1 || stable && !stable.has(index)
      || firstNode(child).parentNode !== parent
    if (shouldMove && !isInPlace(child, parent, before)) {
      moveBefore(child, parent, before)
    }
    before = firstNode(child)
  }
  checkpoint()
  record.isReordering = false
  return next
}

/** @returns {Mount} */
const replace = (record, source, owner, namespace = record.namespace,
                 publish = _record => {}) => {
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
  const hasSameIdentity =
    !!association && association.identity === record.identity
  const isSameValue = source === record.source

  return hasSameIdentity
    ? (present(source), record.source = source, record)
    : isSameValue && !record.isDirty && record.owner === owner ? record
      : record.identity || association
        || kindOf(source) !== kindOf(record.source)
        || namespaceAt(source, record.namespace)
          !== namespaceAt(record.source, record.namespace)
        ? replace(record, source, owner, record.namespace, publish)
        : patchValue(record, source, owner, kindOf(source))
}

/** @returns {Mount} */
const patchValue = (record, source, owner, kind) => {
  const props = propsOf(source)
  const previous = record.props || propsOf(record.source)
  record.isDirty = true
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
        if (Object.keys(changed).length
            || Object.keys(previous).some(key => !(key in props))) {
          record.props = { ...previous }
          removeMissingProps(record.node, previous, props, appliedProps(record))
          assignProperties(record.node, beforeChildrenProps(kind, changed),
                           propsEnv(owner, record))
        }
      }
    }
    record.children = 'innerHTML' in props ? []
      : patchChildren(record, source, owner,
                      childNamespace(kind, props, namespace))
    afterChildrenProps(record.node, kind, props, owner, record)
  }
  checkpoint()
  finishMount(record)
  record.source = source
  record.owner = owner
  record.props = props
  record.isDirty = false
  return record
}

/**
 * Create a live DOM projection, optionally appending it to a target.
 * An observer event return updates every projection of that identity. A plain
 * vnode updates the captured boundary. Fresh observations select immediately.
 * Each call creates independent DOM and preserves existing target children.
 * Without a target, HTML html, head, and body roots replace their document
 * counterparts; other roots remain detached.
 * Vocabulary helpers determine namespaces independently of the target.
 * Returns the root element, or a DocumentFragment for an explicit fragment.
 * Inserting a fragment empties it. After root replacement, a previously
 * returned reference still points at the original node.
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
  updating({}, () => {
    record = mountBoundary(graph, createIdentity(graph), staging, htmlNS, null)
  })
  const first = firstNode(record)
  const projection = first === lastNode(record)
    ? staging.removeChild(first) : staging
  const tag = projection.namespaceURI === htmlNS
    ? projection.tagName?.toLowerCase() : null
  if (target) target.insertBefore(projection, null)
  else if (tag === 'html' || tag === 'head' || tag === 'body') {
    const previous = tag === 'html' ? doc.documentElement : doc[tag]
    const parent = tag === 'html' ? doc : doc.documentElement
    previous ? parent.replaceChild(projection, previous)
      : parent.insertBefore(projection, tag === 'head' ? parent.firstChild : null)
  }
  return projection
}
