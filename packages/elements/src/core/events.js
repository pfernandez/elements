/**
 * Declarative DOM event wrappers.
 *
 * Elements.js treats DOM events as a place to *declare* the next UI tree:
 * if an event handler returns a vnode, the closest component boundary is
 * replaced with the rendered result.
 */

export const isEventProp = (key, value) =>
  key.startsWith('on') && typeof value === 'function'

export const isFormEventProp = key => /^(oninput|onsubmit|onchange)$/.test(key)
export const isSubmitEventProp = key => key === 'onsubmit'
export const isValueEventProp = key => /^(oninput|onchange)$/.test(key)

export const getNearestRoot = (el, isRoot) =>
  !el || isRoot(el) ? el : getNearestRoot(el.parentNode, isRoot)

const isThenable = x =>
  !!x
  && (typeof x === 'object' || typeof x === 'function')
  && typeof x.then === 'function'

const describeListener = ({ el, key }) =>
  `Listener '${key}' on <${el.tagName.toLowerCase()}>`

const withEventRoot = (env, eventRoot, fn) => {
  const prevEventRoot = env.getCurrentEventRoot()
  const restoreEventRoot = () => env.setCurrentEventRoot(prevEventRoot)
  env.setCurrentEventRoot(eventRoot)

  let result
  try { result = fn() }
  catch (err) { restoreEventRoot(); throw err }

  return !isThenable(result)
    ? (restoreEventRoot(), result)
    : result.then(
      value => (restoreEventRoot(), value),
      err => { restoreEventRoot(); throw err }
    )
}

const warnPassiveReturn = (env, resolved) =>
  resolved === undefined
    ? console.warn(
      `${describeListener(env)} returned nothing.\n`
        + 'If you intended a UI update, return a vnode array like: '
        + 'div({}, ...)'
    )
    : !Array.isArray(resolved)
      ? console.warn(
        `${describeListener(env)} returned "${resolved}".\n`
          + 'If you intended a UI update, return a vnode array like: '
          + 'div({}, ...).\n'
          + 'Otherwise, return undefined (or nothing) for native event '
          + 'listener behavior.'
      )
      : undefined

/**
 * Wrap an event handler so it can return a vnode to trigger an update.
 *
 * @param {{
 *   el: any,
 *   key: string,
 *   handler: Function,
 *   isRoot: (el: any) => boolean,
 *   renderTree:
 *     (node: any, isRoot?: boolean, namespaceURI?: string | null) => any,
 *   getCurrentEventRoot: () => any,
 *   setCurrentEventRoot: (el: any) => void,
 *   debug: boolean
 * }} env
 */
export const createDeclarativeEventHandler = env =>
  (...args) => {
    const eventRoot = getNearestRoot(env.el, env.isRoot)
    if (!eventRoot) return

    return withEventRoot(env, eventRoot, () => {
      const event = args[0]
      const isFormEvent = isFormEventProp(env.key)
      const isSubmitEvent = isSubmitEventProp(env.key)
      const isValueEvent = isValueEventProp(env.key)

      const arg =
        isSubmitEvent
          ? event?.target?.elements || null
          : isValueEvent
            ? event?.target?.value
            : null

      const result = isFormEvent
        ? env.handler.call(env.el, arg, event)
        : env.handler.call(env.el, event)

      const handleResult = resolved => {
        isSubmitEvent && resolved !== undefined && event.preventDefault()

        env.debug && warnPassiveReturn(env, resolved)

        if (!Array.isArray(resolved)) return resolved

        const parent = eventRoot.parentNode
        if (!parent) return resolved

        const replacement = env.renderTree(resolved, true)
        parent.replaceChild(replacement, eventRoot)
        return resolved
      }

      return isThenable(result) ? result.then(handleResult) : handleResult(result)
    })
  }
