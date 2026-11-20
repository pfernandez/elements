import { code, div, h2, h3, p, pre, section } from '@pfern/elements/html'
import { cube } from '../views/cube.js'
import introduction from '../content/introduction.md?raw'
import { markdown } from '../views/markdown.js'
import { scope } from '../views/scope.js'
import { tick } from '../views/tick.js'
import tickSource from '../views/tick.js?raw'
import { todos } from '../views/todos.js'

export const home = () =>
  section(
    h2('Home'),
    div(`Explore observer scope with independent counters, edit a todo list,
         or animate a 3D scene. The Writing page renders Markdown.`))

export const writing = () => section(markdown(introduction))

export const todosDemo = () =>
  section(
    h2('Todos App'),
    p('Obligatory for any JavaScript framework.'),
    todos())

export const scopeDemo = () =>
  section(
    h2('Observer Scope'),
    p(`Reset selects fresh observations of two separately defined counters.
       Each definition has its own identity; its projections share state.`),
    scope())

export const x3domDemo = () => section(
  h2('X3D / X3DOM Scene'),
  p('Create 3D scenes declaratively with simple function composition.'),
  div({ class: 'grid cube-demos' },
      div(h3('Static cube'), cube()),
      div(h3('Animation with ontick'), tick())),
  p('ontick runs once per animation frame, after the scene is ready. '
    + 'Return the next angle to carry it into the following frame.'),
  pre(code(tickSource)))
