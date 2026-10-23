import { button, div, observe, project, span, table, tbody, td, tr } from '@pfern/elements/html'
import { snapshot, sourceOf } from '../../packages/elements/src/core/observer.js'

const pause = () => new Promise(resolve => setTimeout(resolve, 0))
const assert = (condition, message) => { if (!condition) throw new Error(message) }
const measure = async (run, operations = 1) => {
  const samples = []
  for (let sample = -5; sample < 15; sample++) {
    await pause()
    const start = performance.now()
    for (let index = 0; index < operations; index++) run()
    const duration = (performance.now() - start) / operations
    if (sample >= 0) samples.push(duration)
  }
  return { median: samples.toSorted((a, b) => a - b)[7], samples, operationsPerSample: operations }
}

const row = (id, value, onclick) =>
  tr({ key: id }, td(id), td(value), td(button({ onclick }, 'increment')), td(''))
const counter = id => {
  const view = observe((n = 0) => row(id, n, () => view(n + 1)))
  return view
}

const independent = async count => {
  const views = Array.from({ length: count }, (_, id) => counter(id))
  const root = project(table(tbody(views.map(view => view()))), document.body)
  const first = root.querySelector('button'), other = root.querySelectorAll('tr')[1]
  const timing = await measure(() => first.click(), 100)
  assert(root.querySelector('tr').children[1].textContent === '2000', 'Local counter missed an update')
  assert(other.children[1].textContent === '0', 'An unrelated counter changed')
  root.remove()
  return { count, ...timing }
}

const fanout = async (count, fresh) => {
  const child = observe(n => span(n))
  const parent = observe(n => {
    const source = child(n)
    return div(Array.from({ length: count }, () => fresh ? child(n) : source))
  })
  let value = 0
  const root = project(parent(value), document.body)
  const control = project(button({ onclick: () => parent(++value) }))
  const timing = await measure(() => control.click())
  assert([...root.children].every(node => node.textContent === String(value)), 'Divergent shared state')
  // Instrument only the extra count sample, leaving timed samples untouched.
  let notifications = 0
  for (const reference of sourceOf(child(value)).identity.listeners) {
    const projection = reference.deref(), notify = projection.notify
    projection.notify = next => { notifications++; notify(next) }
  }
  control.click()
  root.remove()
  return { count, fresh, notifications, ...timing }
}

const freshTable = async count => {
  const view = observe(n => table(tbody(Array.from({ length: count }, (_, id) => row(id, n)))))
  let value = 0, source
  const construction = await measure(() => { source = view(++value) })
  const root = project(source, document.body)
  const control = project(button({ onclick: () => view(++value) }))
  const update = await measure(() => control.click())
  assert(root.querySelectorAll('tr').length === count, 'Table lost rows')
  assert(root.querySelector('tr').children[1].textContent === String(value), 'Table missed an update')
  root.remove()
  return { count, construction, update }
}

const setupMemory = count => {
  const views = Array.from({ length: count }, (_, id) => counter(id))
  // Retain the graph deliberately. Its identities must not keep discarded DOM alive.
  window.memoryGraph = table(tbody(views.map(view => view())))
  window.memoryRoot = project(window.memoryGraph, document.body)
  window.memoryWeak = new WeakRef(window.memoryRoot)
  return snapshot(document).size
}
const setupTableMemory = count => {
  const view = observe(() => table(tbody(Array.from({ length: count }, (_, id) => row(id, 0)))))
  window.memoryGraph = view()
  window.memoryRoot = project(window.memoryGraph, document.body)
  window.memoryWeak = new WeakRef(window.memoryRoot)
  return { subscriptions: snapshot(document).size,
    elements: window.memoryRoot.querySelectorAll('*').length + 1 }
}
const detachMemory = retain => {
  window.memoryRoot.remove()
  if (!retain) window.memoryRoot = null
}
const inspectMemory = () => ({ rootAlive: !!window.memoryWeak.deref(), subscriptions: snapshot(document).size })

window.diagnostics = { independent, fanout, freshTable, setupMemory, setupTableMemory, detachMemory, inspectMemory }
