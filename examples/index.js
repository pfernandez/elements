import { body, div, h1, h2, head, header, html,
         link, main, meta, render, section, title } from '../elements.js'
import { counter } from './components/counter.js'
import { todos } from './components/todos.js'
import { x3dDemo } from './components/x3d-demo.js'

render(
  html(
    head(
      title('elements.js'),
      meta({ name: 'viewport',
             content: 'width=device-width, initial-scale=1.0' }),
      link({ rel: 'stylesheet', href: 'examples/css/style.css' })),
    body(
      header(
        h1('Elements.js Demo')),
      main(
        section(
          h2('Todos'),
          todos()),
        section(
          h2('X3D / X3DOM'),
          x3dDemo()),
        section({ class: 'grid' },
          div(
            h2('Counter 1'),
            counter()),
          div(
            h2('Counter 2'),
            counter()))))))
