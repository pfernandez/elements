/** Pure vnode construction and the public rendering boundary. */
import { htmlTagNames, svgTagNames } from './tags.js'

export * from './types.js'
export { observe } from './observer.js'
export { render } from './dom.js'

export const DEBUG =
  typeof process !== 'undefined'
  && process.env
  && (process.env.ELEMENTSJS_DEBUG?.toLowerCase() === 'true'
    || process.env.NODE_ENV === 'development')

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
