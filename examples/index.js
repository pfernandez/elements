import './css/style.css'
import { body, h1, head, header, html, meta, onNavigate, render, title }
  from '../packages/elements'
import { app } from './components/app.js'

onNavigate(app)

render(
  html(
    head(
      title('elements.js'),
      meta({ name: 'viewport',
             content: 'width=device-width, initial-scale=1.0' })),
    body({ class: 'container' },
         header(
           h1('Elements.js Demo')),
         app())))

