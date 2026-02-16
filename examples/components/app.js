import { a, component, div, h2, main, nav, p, section }
  from '../../packages/elements'
import { cube } from './cube.js'
import { scope } from './scope.js'
import { todos } from './todos.js'

const link = (path, label, active) =>
  a({ href: path, class: active ? 'active' : '' }, label)

const navbar = path =>
  nav(
    link('/', 'Home', path === '/'),
    link('/todos', 'Todos', path === '/todos'),
    link('/scope', 'Scope', path === '/scope'),
    link('/x3dom', 'X3DOM', path === '/x3dom'))

const home = () =>
  section(
    h2('Home'),
    div(`This template shows the built-in page navigation, a todos app,
         independent counters to demonstate component scope, and a basic X3DOM
         animation.`))

const todosDemo = () =>
  section(
    h2('Todos App'),
    p('Obligatory for any JavaScript framework.'),
    todos())

const scopeDemo = () =>
  section(
    h2('Component Scope'),
    p(`Reloading a parent component also reloads its children. Child
       components have separate scope, even when defined with the same
       names.`),
    scope())

const x3domDemo = () => section(
  h2('X3D / X3DOM Scene'),
  p('Create 3D scenes declaratively with simple function composition.'),
  cube())

export const app = component((path = window.location.pathname) =>
  main(
    navbar(path),
    path === '/todos' ? todosDemo()
      : path === '/scope' ? scopeDemo()
        : path === '/x3dom' ? x3domDemo()
          : home()))

