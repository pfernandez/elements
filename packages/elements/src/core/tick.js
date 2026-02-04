/**
 * Tick engine for `ontick`.
 *
 * `ontick` is a hook (not a DOM event) that runs a handler once per frame.
 * It is intentionally minimal: it schedules via `requestAnimationFrame`,
 * threads optional context, and provides a `dt` in milliseconds.
 *
 * The engine is generic and can be used with any element; callers may provide
 * a `ready(el)` predicate to gate ticking on external readiness (e.g. X3DOM
 * runtime availability).
 */

const tickStateMap = new WeakMap()

export const isConnected = el =>
  typeof el?.isConnected === 'boolean' ? el.isConnected : !!el?.parentNode

const isThenable = x =>
  !!x
  && (typeof x === 'object' || typeof x === 'function')
  && typeof x.then === 'function'

export const stopTickLoop = el =>
  (state =>
    !state ? undefined
      : (state.running = false,
      state.rafId != null
          && typeof window?.cancelAnimationFrame === 'function'
          && window.cancelAnimationFrame(state.rafId),
      tickStateMap.delete(el),
      undefined))(tickStateMap.get(el))

/**
 * Start (or restart) a tick loop for an element.
 *
 * The handler signature is:
 *
 * ```js
 * (el, ctx, dtMs) => nextCtx | undefined
 * ```
 *
 * Returning `undefined` preserves the previous `ctx`. Returning any other value
 * replaces `ctx` for the next tick.
 *
 * If the handler throws (or returns a Promise), ticking stops.
 *
 * @template Ctx
 * @param {Element} el
 * @param {(el: Element, ctx: any, dtMs: number) => (any | void)} handler
 * @param {{ ready?: (el: Element) => boolean }} [options]
 */
export const startTickLoop = (el, handler, { ready = () => true } = {}) => {
  const canTick =
    typeof window !== 'undefined'
    && typeof window.requestAnimationFrame === 'function'

  if (!canTick) return

  const existing = tickStateMap.get(el)

  const same = existing?.handler === handler
    && existing?.ready === ready
    && existing?.running

  if (same) return

  existing && stopTickLoop(el)

  const state = {
    handler,
    ready,
    ctx: undefined,
    lastTime: null,
    rafId: null,
    wasConnected: false,
    running: true
  }

  tickStateMap.set(el, state)

  const step = t => {
    const connected = isConnected(el)
    const done = !state.running || !connected && state.wasConnected
    if (done) return stopTickLoop(el)

    if (!connected) {
      state.lastTime = null
      state.rafId = window.requestAnimationFrame(step)
      return
    }

    state.wasConnected = true

    if (!ready(el)) {
      state.lastTime = null
      state.rafId = window.requestAnimationFrame(step)
      return
    }

    const dt = state.lastTime == null ? 0 : t - state.lastTime
    state.lastTime = t

    let next
    try { next = handler.call(el, el, state.ctx, dt) }
    catch (err) { stopTickLoop(el); throw err }

    if (isThenable(next)) {
      stopTickLoop(el)
      throw new TypeError('ontick must be synchronous (no Promises).')
    }

    next !== undefined && (state.ctx = next)
    state.running && (state.rafId = window.requestAnimationFrame(step))
  }

  state.rafId = window.requestAnimationFrame(step)
}
