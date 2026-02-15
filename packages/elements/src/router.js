// Router utilities.
//
// `onNavigate(fn)` registers a callback that should re-render your app when the
// URL changes (via History API navigation or back/forward).
//
// The callback is invoked on a microtask after `popstate` so it can safely run
// outside of any current declarative event update.

let current = null
let installed = false
let scheduled = false

const defer = fn =>
  typeof queueMicrotask === 'function'
    ? queueMicrotask(fn)
    : Promise.resolve().then(fn)

const schedule = () => {
  if (typeof current !== 'function') return
  if (scheduled) return
  scheduled = true
  defer(() => {
    scheduled = false
    typeof current === 'function' && current()
  })
}

const onPopState = () => schedule()

export const hasNavigateHandler = () => typeof current === 'function'

export const onNavigate = (fn, { immediate = false } = {}) => {
  current = fn

  if (typeof window !== 'undefined' && !installed) {
    window.addEventListener('popstate', onPopState)
    installed = true
  }

  immediate && schedule()

  return () => {
    if (current !== fn) return
    current = null

    if (typeof window !== 'undefined' && installed) {
      window.removeEventListener('popstate', onPopState)
      installed = false
    }
  }
}
