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

export const getNearestRoot = (el, isRoot) =>
  !el || isRoot(el) ? el : getNearestRoot(el.parentNode, isRoot)

const describeListener = ({ el, key }) =>
  `Listener '${key}' on <${el.tagName.toLowerCase()}>`

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
  async (...args) => {
    const target = getNearestRoot(env.el, env.isRoot)
    if (!target) return

    const prevEventRoot = env.getCurrentEventRoot()
    env.setCurrentEventRoot(target)

    try {
      const event = args[0]
      const isFormEvent = isFormEventProp(env.key)
      const elements = isFormEvent && event?.target?.elements || null

      const result = await (isFormEvent
        ? env.handler.call(env.el, elements, event)
        : env.handler.call(env.el, event))

      isFormEvent && result !== undefined && event.preventDefault()

      env.debug && result === undefined
        && console.warn(
          `${describeListener(env)} returned nothing.\n`
            + 'If you intended a UI update, return a vnode array like: '
            + 'div({}, ...)'
        )

      env.debug && result !== undefined && !Array.isArray(result)
        && console.warn(
          `${describeListener(env)} returned "${result}".\n`
            + 'If you intended a UI update, return a vnode array like: '
            + 'div({}, ...).\n'
            + 'Otherwise, return undefined (or nothing) for native event '
            + 'listener behavior.'
        )

      if (!Array.isArray(result)) return

      const parent = target.parentNode
      if (!parent) return

      const replacement = env.renderTree(result, true)
      parent.replaceChild(replacement, target)
    } finally {
      env.setCurrentEventRoot(prevEventRoot)
    }
  }
