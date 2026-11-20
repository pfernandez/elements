import { body, head, html, link, meta, project, style, title }
  from '@pfern/elements/html'
import config from './pages/config.js'
import css from './css/style.css?inline'
import page from './views/page.js'

const path = location.pathname.slice(import.meta.env.BASE_URL.length - 1)
  .replace(/\/$/, '') || '/'
const active = config.pages.find(item => item.href === path)

project(
  html({ lang: 'en' },
       head(
         meta({ charset: 'utf-8' }),
         meta({ name: 'viewport',
                content: 'width=device-width, initial-scale=1.0' }),
         title(config.title),
         style(css),
         link({ rel: 'icon', href: 'data:x-icon' })),
       body({ class: 'container' }, page(active))))
