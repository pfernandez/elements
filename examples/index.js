import { body, div, h1, h2, head, header, html,
         link, main, meta, render, section, title } from '../elements.js'
import { counter } from './components/counter.js'
import { todos } from './components/todos.js'

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
          div({ style: { width: '50%' } },
            h2('Counter 1'),
            counter()),
          div({ style: { width: '50%' } },
            h2('Counter 2'),
            counter()))))))

