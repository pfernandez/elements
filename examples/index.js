import { body, h1, h2, head, header, html, link,
         main, meta, p, render, section, title }
  from '../packages/elements/elements.js'
import { scope } from './components/scope.js'
import { todos } from './components/todos.js'
import { x3dDemo } from './components/3d.js'

render(
  html(
    head(
      title('elements.js'),
      meta({ name: 'viewport',
             content: 'width=device-width, initial-scale=1.0' }),
      link({ rel: 'stylesheet', href: 'examples/css/style.css' })),
    body(
      header(h1('Elements.js Demo')),
      main({ class: 'container' },
           section(
             h2('Todos App'),
             p('Obligatory for any JavaScript framework.'),
             todos()),
           section(
             h2('Component Scope'),
             p(`Reloading a parent component also reloads its children. Child
             components have separate scope, even when defined with the same
             names.`),
             scope()),
           section(
             h2('X3D / X3DOM Scene'),
             p(`Create 3D scenes declaratively with simple function
                composition.`),
             x3dDemo())))))

