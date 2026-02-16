import { body, h1, head, header, html, link, meta,
         onNavigate, render, title }
  from '@pfern/elements'
import { app } from './components/app.js'

onNavigate(app)

render(
  html(
    head(
      title('elements.js'),
      meta({ name: 'viewport',
             content: 'width=device-width, initial-scale=1.0' }),
      link({ rel: 'stylesheet', href: 'examples/css/style.css' })),
    body({ class: 'container' },
         header(
           h1('Elements.js Demo')),
         app())))
