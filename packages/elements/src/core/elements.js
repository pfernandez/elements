/** Public construction and rendering boundary. */
import { element } from './element.js'
import { htmlTagNames, svgTagNames } from './tags.js'

export * from './types.js'
export { element } from './element.js'
export { observe } from './observer.js'
export { render } from './dom.js'

export const DEBUG =
  typeof process !== 'undefined'
  && process.env
  && (process.env.ELEMENTSJS_DEBUG?.toLowerCase() === 'true'
    || process.env.NODE_ENV === 'development')

const tags = htmlTagNames.map(String).concat(svgTagNames.map(String))

export const elements =
  /** @type {import('./types.js').ElementsElementMap} */ (Object.assign(
    { fragment: element('fragment') },
    Object.fromEntries(tags.map(tag => [tag, element(tag)]))
  ))
