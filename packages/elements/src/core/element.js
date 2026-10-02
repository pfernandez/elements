import { markVNode, normalizeChildren } from './children.js'

const isPropsObject = value =>
  typeof value === 'object'
  && value !== null
  && !Array.isArray(value)
  && !(typeof Node !== 'undefined' && value instanceof Node)

/**
 * Create a vnode constructor for an element tag.
 *
 * The returned helper accepts optional props followed by children. Arrays of
 * vnodes compose directly, so mapped children do not need argument spreading.
 *
 * @template {string} Tag
 * @param {Tag} tag
 * @returns {import('./types.js').ElementsElementForTag<Tag>}
 */
export const element = tag =>
  /** @type {import('./types.js').ElementsElementForTag<Tag>} */ ((...args) => {
  const hasFirstArg = args.length > 0
  const [propsOrChild, ...children] = args
  const props = hasFirstArg && isPropsObject(propsOrChild) ? propsOrChild : {}
  const actualChildren = !hasFirstArg
    ? []
    : props === propsOrChild
      ? children
      : [propsOrChild].concat(children)

  return markVNode(/** @type {import('./types.js').ElementsVNode} */ (
    [tag, props].concat(normalizeChildren(actualChildren))
  ))
})
