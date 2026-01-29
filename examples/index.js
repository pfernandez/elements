import { body, h1, h2, head, header, html,
         link, main, meta, render, section, title } from '../elements.js'
import { scope } from './components/scope.js'
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
          scope()),
        section(
          h2('Todos'),
          todos()),
        section(
          h2('X3D / X3DOM'),
          x3dDemo())))))

