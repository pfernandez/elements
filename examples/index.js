import { project } from '@pfern/elements'
import { body, h1, head, header, html, link, meta, style, title }
  from '@pfern/elements/html'
import { app } from './views/app.js'
import css from './css/style.css?inline'

const graph =
  html({ lang: 'en' },
       head(
         meta({ charset: 'utf-8' }),
         meta({ name: 'viewport',
                content: 'width=device-width, initial-scale=1.0' }),
         title('Elements.js'),
         style(css),
         link({ rel: 'icon', href: 'data:x-icon' })),
       body({ class: 'container' },
            header(h1('Elements.js Demo')),
            app()))

const tree = project(graph)
document.documentElement.replaceWith(tree)
