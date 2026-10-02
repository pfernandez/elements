// A source value is immutable. Its identity carries the current observation;
// mounted projections subscribe at the DOM boundary, never on the source array.
const sources = new WeakMap()
const presented = new WeakSet()
const projections = new WeakMap()

export const sourceOf = vnode => sources.get(vnode)
export const createIdentity = current => ({ current, listeners: new Set() })
const notify = identity =>
  Array.from(identity.listeners).forEach(listener =>
    identity.listeners.has(listener) && listener(identity.current))

// Selection advances the identity; its mounted projections follow the change.
export const select = (identity, next) => {
  if (identity.current !== next) {
    identity.current = next
    notify(identity)
  }
}

// Construction never selects an observation. A new source is selected when
// first projected; reusing it projects the identity's current observation.
export const present = vnode => {
  const source = sourceOf(vnode)
  if (source && !presented.has(vnode)) {
    presented.add(vnode)
    select(source.identity, source.observation)
  }
}

// Observer continuations carry their destination. Plain vnodes use the
// event's captured boundary instead. Explicit selection can revisit a source.
export const resume = (vnode, owner = null) => {
  const source = sourceOf(vnode)
  const identity = source?.identity || owner
  source && presented.add(vnode)
  identity && select(identity, source?.observation ?? vnode)
}

export const subscribe = (identity, listener, document) => {
  const active = projections.get(document) || new Map()
  projections.set(document, active)
  active.set(identity, (active.get(identity) || 0) + 1)
  identity.listeners.add(listener)
  return () => {
    identity.listeners.delete(listener)
    const count = active.get(identity) - 1
    count ? active.set(identity, count) : active.delete(identity)
  }
}

// History stores observations, never DOM nodes or serialized closures.
export const snapshot = document =>
  new Map(Array.from(projections.get(document)?.keys() || [], identity =>
    [identity, identity.current]))

export const restore = observations => {
  const changed = Array.from(observations).filter(([identity, next]) =>
    identity.current !== next)
  // Set the whole observation before notifying: a parent may remount children.
  changed.forEach(([identity, next]) => { identity.current = next })
  changed.forEach(([identity]) => notify(identity))
}

/**
 * Infer the whole view before extracting its arguments, so default
 * parameters keep their types instead of being contextually widened to any.
 * @template View
 * @typedef {View extends (...args: infer Args) => import('./types.js').ElementsVNode
 *   ? (...args: Args) => import('./types.js').ElementsVNode : never} StateObserver
 */

/**
 * Give a pure view a stable identity, returning a state observer.
 *
 * The view takes state as arguments and returns an observation: a vnode
 * describing the interface and its event handlers. Handlers can return another
 * observation of the same observer with new arguments, forming a recursive
 * sequence of state transitions. Mounted DOM projections follow each selection.
 *
 * Calls to the returned observer construct vnodes without updating the DOM.
 * Returning one from an event selects that observer's next observation,
 * even from a sibling or child.
 * Plain vnode returns update the event's closest boundary. Promises may resolve
 * to either kind of continuation; errors propagate to the caller.
 *
 * All projections of this definition share its current observation. Create
 * separate observer definitions for independent state (a factory can help).
 * A fresh vnode selects its observation when first rendered; reusing an already
 * projected vnode preserves current state. Source arrays are never rewritten.
 * Unkeyed sibling boundaries follow their identity through reordering when
 * that identity occurs once on each side. Repeated projections need retained
 * vnode references or keys to distinguish them; otherwise they remain positional.
 * Strict TypeScript consumers may need an explicit return type on a recursive
 * view to break circular inference; JavaScript needs no annotation.
 *
 * @example
 * const counter = observe((n = 0) =>
 *   button({ onclick: () => counter(n + 1) }, n))
 *
 * @template {Function} View
 * @param {View} view A pure function describing a state and its interactions.
 * @returns {StateObserver<View>}
 */
export const observe = view => {
  const identity = createIdentity(undefined)
  return /** @type {StateObserver<View>} */ ((...args) => {
    const result = view(...args)
    if (!Array.isArray(result))
      throw new TypeError('A view must return a vnode array.')
    const source = sourceOf(result)
    const observation =
      source?.identity === identity ? source.observation : result

    const vnode = /** @type {import('./types.js').ElementsVNode} */ (
      observation.slice()
    )
    sources.set(vnode, { identity, observation })
    return vnode
  })
}
