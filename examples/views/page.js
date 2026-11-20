import { a, aside, button, div, h1, h2, li, main, nav, observe, ul }
  from '@pfern/elements/html'
import config from '../pages/config.js'

const pageLink = (item, active) =>
  li(a({ href: import.meta.env.BASE_URL + item.href.slice(1),
         'aria-current': item === active ? 'page' : null,
         onclick: () => page(item) }, item.label))

const sidebar = observe((active, isOpen = false) =>
  aside({ id: 'sidebar' },
        h1(config.title),
        button({ type: 'button', 'aria-controls': 'pages',
                 'aria-expanded': isOpen, onclick: () => sidebar(active, !isOpen) },
               'Menu'),
        nav({ id: 'pages', 'aria-label': 'Examples' },
            ul(config.pages.map(item => pageLink(item, active))))))

const page = observe(active =>
  main(sidebar(active),
       div({ id: 'content' }, active ? active.view() : h2('Page not found'))))

export default page
