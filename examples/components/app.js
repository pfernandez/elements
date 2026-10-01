import { a, code, observe, div, h2, h3, main, nav, p, pre, section }
  from '@pfern/elements'
import { cube } from './cube.js'
import { tick } from './tick.js'
import tickSource from './tick.js?raw'
import { scope } from './scope.js'
import { todos } from './todos.js'
import { markdown } from './markdown.js'
import introduction from '../content/introduction.md?raw'
import { routes } from '../routes.js'

const base = import.meta.env.BASE_URL
const initialPath = () =>
  window.location.pathname.slice(base.length - 1).replace(/\/$/, '') || '/'

const link = (path, label, active) =>
  a({ href: `${base}${path.slice(1)}`, onclick: () => app(path),
      class: active ? 'active' : '' }, label)

const navbar = path =>
  nav(...routes.map(([route, label]) => link(route, label, path === route)))

const home = () =>
  section(
    h2('Home'),
    div(`This template shows the built-in page navigation, a todos app,
         independent counters to demonstrate component scope, and a basic X3DOM
         animation. The Writing page explains components as recursive state
         observers, with prose loaded from Markdown.`))

const writing = () => section(markdown(introduction))

const todosDemo = () =>
  section(
    h2('Todos App'),
    p('Obligatory for any JavaScript framework.'),
    todos())

const scopeDemo = () =>
  section(
    h2('Component Scope'),
    p(`Reset selects fresh observations of two separately defined counters.
       Each definition has its own identity; its projections share state.`),
    scope())

const x3domDemo = () => section(
  h2('X3D / X3DOM Scene'),
  p('Create 3D scenes declaratively with simple function composition.'),
  div({ class: 'grid cube-demos' },
      div(h3('Static cube'), cube()),
      div(h3('Animation with ontick'), tick())),
  p('ontick runs once per animation frame, after the scene is ready. '
    + 'Return the next angle to carry it into the following frame.'),
  pre(code(tickSource)))

export const app = observe((path = initialPath()) =>
  main(
    navbar(path),
    path === '/todos' ? todosDemo()
      : path === '/scope' ? scopeDemo()
        : path === '/x3dom' ? x3domDemo()
          : path === '/writing' ? writing()
            : home()))
