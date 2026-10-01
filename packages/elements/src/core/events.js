import { linkOf, isPlainClick, navigationURL } from './navigation.js'
import { visit } from './history.js'

/** Events select continuations; merely constructing a vnode has no effects. */
export const isEventProp = (key, value) =>
  key.startsWith('on') && typeof value === 'function'

const isThenable = value =>
  value != null && typeof value.then === 'function'

const eventArgument = (key, event) =>
  key === 'onsubmit' ? event?.target?.elements || null
    : event?.target

/**
 * A vnode return selects its observer, or the owner for a plain vnode.
 * Eligible links also record their URL and observations for Back/Forward.
 * A Promise claims it synchronously, before native dispatch completes; its
 * eventual vnode selects its observer (or the owner for a plain vnode).
 * Passive synchronous values do not
 * cancel default behavior (including false). Explicit preventDefault works too.
 *
 * @param {{ el: any, key: string, handler: Function,
 *   resume: (vnode: any) => void }} env
 */
export const createDeclarativeEventHandler = ({ el, key, handler, resume }) =>
  event => {
    const anchor = key === 'onclick' && linkOf(el)
    const url = anchor && navigationURL(anchor, event)
    // Without a browser (e.g. a DOM test), link returns still claim navigation.
    const claimLink = anchor && (url
      || typeof window === 'undefined' && isPlainClick(event))
    const claimDefault = key === 'onsubmit' || claimLink
    // Native gestures still reach user handlers, but their returned values must
    // not also advance this document while the browser follows the link.
    const nativeLink = anchor && !claimLink
    const result = /^(oninput|onsubmit|onchange)$/.test(key)
      ? handler.call(el, eventArgument(key, event), event)
      : handler.call(el, event)
    const pending = isThenable(result)
    const claimed = pending || Array.isArray(result)
    claimed && claimDefault
      && event?.cancelable !== false && event?.preventDefault?.()

    const settle = vnode =>
      Array.isArray(vnode) && !nativeLink
        ? (url ? visit(url, () => resume(vnode)) : resume(vnode), vnode)
        : undefined

    return pending ? Promise.resolve(result).then(settle) : settle(result)
  }
