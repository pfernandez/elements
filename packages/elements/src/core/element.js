import { htmlNS, withNamespace } from './namespaces.js'
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
 * @param {string | null} [namespace] DOM namespace; defaults to HTML.
 * @returns {import('./types.js').ElementsElementForTag<Tag>}
 */
export const element = (tag, namespace = htmlNS) =>
  /** @type {import('./types.js').ElementsElementForTag<Tag>} */ ((...args) => {
    const hasProps = isPropsObject(args[0])
    const props = hasProps ? args[0] : {}
    const children = hasProps ? args.slice(1) : args

    return withNamespace(markVNode(
      /** @type {import('./types.js').ElementsVNode} */ (
        [tag, props].concat(normalizeChildren(children)))), namespace)
  })
