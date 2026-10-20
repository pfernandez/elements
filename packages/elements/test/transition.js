import { observe, project } from '../elements.js'
import { resume } from '../src/core/observer.js'

const observers = new WeakMap()

// Drive selections explicitly in reconciliation tests. Public project() always
// appends; this fixture keeps a separate observer for each test placement.
export const transition = (graph, target) => {
  const previous = observers.get(target)
  const view = previous || observe(value => value)
  previous ? resume(view(graph))
    : (observers.set(target, view), project(view(graph), target))
}
