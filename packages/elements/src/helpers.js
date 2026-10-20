/**
 * Environment-derived flag for application diagnostics.
 *
 * Set `process.env.ELEMENTSJS_DEBUG=true` (or `NODE_ENV=development`) to enable
 * this flag. Passive event returns are valid and do not produce warnings.
 */
export { DEBUG } from './core/elements.js'

/**
 * Give a pure view a stable identity using `observe(view)`.
 *
 * The view describes a state and its event handlers as a vnode. Calling the
 * returned observer constructs an observation; an event return selects it
 * and updates that observer wherever it is rendered. Use separate observer
 * definitions for independent state. Source arrays remain unchanged.
 *
 * @example
 * const counter = observe((n = 0) =>
 *   button({ onclick: () => counter(n + 1) }, n))
 */
export { observe } from './core/elements.js'

/**
 * Create a vnode constructor for any element tag.
 *
 * Built-in HTML, SVG, and MathML modules are vocabularies of these constructors;
 * custom vocabularies can use the same primitive.
 */
export { element } from './core/elements.js'

/**
 * Group children without introducing a DOM element.
 */
export { fragment } from './core/elements.js'

/**
 * Create a live projection and return its root element. An explicit fragment
 * returns a DocumentFragment. An optional target receives the projected DOM;
 * otherwise insert it with native DOM operations. Each call creates a projection.
 * Root replacement leaves previously returned element references unchanged;
 * inserting a fragment empties it while its projected range remains live.
 *
 * @param {import('./core/types.js').ElementsVNode} graph
 * @param {Element | Document | DocumentFragment} [target]
 * @returns {Element | DocumentFragment}
 */
export { project } from './core/elements.js'

/**
 * Serialize a vnode tree to an HTML string (SSR/SSG).
 *
 * This is the “stringification” counterpart to `project()`: it walks the same
 * declarative vnode arrays and produces static HTML for build-time prerendering
 * or server-side rendering.
 *
 * @param {*} vnode
 * @returns {string}
 */
export { toHtmlString } from './ssr.js'
