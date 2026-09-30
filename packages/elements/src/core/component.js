// A source value is immutable. Its origin carries the current observation;
// mounted projections subscribe at the DOM boundary, never on the source array.
const sources = new WeakMap()
const presented = new WeakSet()
const projections = new WeakMap()

export const sourceOf = vnode => sources.get(vnode)
export const createOrigin = current => ({ current, listeners: new Set() })
const notify = origin =>
  Array.from(origin.listeners).forEach(listener =>
    origin.listeners.has(listener) && listener(origin.current))

// Selection advances the origin; its mounted projections follow the change.
export const select = (origin, next) => {
  if (origin.current !== next) {
    origin.current = next
    notify(origin)
  }
}

// Construction never selects an observation. A new source is selected when
// first projected; reusing it projects the origin's current observation.
export const present = vnode => {
  const source = sourceOf(vnode)
  if (source && !presented.has(vnode)) {
    presented.add(vnode)
    select(source.origin, source.observation)
  }
}

// Component continuations carry their destination. Plain vnodes use the
// event's captured boundary instead. Explicit selection can revisit a source.
export const resume = (vnode, owner = null) => {
  const source = sourceOf(vnode)
  const origin = source?.origin || owner
  source && presented.add(vnode)
  origin && select(origin, source?.observation ?? vnode)
}

export const subscribe = (origin, listener, document) => {
  const active = projections.get(document) || new Map()
  projections.set(document, active)
  active.set(origin, (active.get(origin) || 0) + 1)
  origin.listeners.add(listener)
  return () => {
    origin.listeners.delete(listener)
    const count = active.get(origin) - 1
    count ? active.set(origin, count) : active.delete(origin)
  }
}

// History stores observations, never DOM nodes or serialized closures.
export const snapshot = document =>
  new Map(Array.from(projections.get(document)?.keys() || [], origin =>
    [origin, origin.current]))

export const restore = observations => {
  const changed = Array.from(observations).filter(([origin, next]) =>
    origin.current !== next)
  // Set the whole observation before notifying: a parent may remount children.
  changed.forEach(([origin, next]) => { origin.current = next })
  changed.forEach(([origin]) => notify(origin))
}

/**
 * Infer the whole observer before extracting its arguments, so default
 * parameters keep their types instead of being contextually widened to any.
 * @template Observer
 * @typedef {Observer extends (...args: infer Args) => import('./types.js').ElementsVNode
 *   ? (...args: Args) => import('./types.js').ElementsVNode : never} StateObserver
 */

/**
 * Create a state observer with one stable component identity.
 *
 * The observer takes state as arguments and returns an observation: a vnode
 * describing the interface and its event handlers. Handlers can return another
 * observation of the same component with new arguments, forming a recursive
 * sequence of state transitions. Mounted DOM projections follow each selection.
 *
 * Calls to the returned observer construct vnodes without updating the DOM.
 * Returning one from an event
 * selects that component's next observation, even from a sibling or child.
 * Plain vnode returns update the event's closest boundary. Promises may resolve
 * to either kind of continuation; errors propagate to the caller.
 *
 * All projections of this definition share its current observation. Create
 * separate component definitions for independent state (a factory can help).
 * A fresh vnode selects its observation when first rendered; reusing an already
 * projected vnode preserves current state. Source arrays are never rewritten.
 * Unkeyed sibling boundaries follow their definition through reordering when
 * that definition occurs once on each side. Repeated projections need retained
 * vnode references or keys to distinguish them; otherwise they remain positional.
 * Strict TypeScript consumers may need an explicit return type on a recursive
 * observer to break circular inference; JavaScript needs no annotation.
 *
 * @example
 * const counter = observe((n = 0) =>
 *   button({ onclick: () => counter(n + 1) }, n))
 *
 * @template {Function} Observer
 * @param {Observer} describe Describe a state and its available interactions.
 * @returns {StateObserver<Observer>}
 */
export const observe = describe => {
  const origin = createOrigin(undefined)
  return /** @type {StateObserver<Observer>} */ ((...args) => {
    const result = describe(...args)
    if (!Array.isArray(result))
      throw new TypeError('A state observer must return a vnode array.')
    const source = sourceOf(result)
    const observation = source?.origin === origin ? source.observation : result

    const vnode = /** @type {import('./types.js').ElementsVNode} */ (observation.slice())
    sources.set(vnode, { origin, observation })
    return vnode
  })
}
