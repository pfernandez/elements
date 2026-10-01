import { body, h1, head, header, html, meta,
         render, title } from '@pfern/elements'
import { app } from './components/app.js'
import './css/style.css'

render(
  html(
    head(
      title('elements.js'),
      meta({ name: 'viewport',
             content: 'width=device-width, initial-scale=1.0' })),
    body({ class: 'container' },
         header(h1('Elements.js Demo')),
         app())))
