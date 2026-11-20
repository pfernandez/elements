/** Public construction and rendering boundary. */
import { element } from './element.js'

export * from './types.js'
export { element } from './element.js'
export { observe } from './observer.js'
export { project } from './dom.js'

/** Group children without introducing a DOM element. */
export const fragment = element('fragment')
