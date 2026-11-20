import { home, scopeDemo, todosDemo, writing, x3domDemo } from './views.js'

export default {
  title: 'Elements.js',
  pages: [
    { href: '/', label: 'Home', view: home },
    { href: '/writing', label: 'Writing', view: writing },
    { href: '/todos', label: 'Todos', view: todosDemo },
    { href: '/scope', label: 'Scope', view: scopeDemo },
    { href: '/x3dom', label: 'X3DOM', view: x3domDemo }
  ]
}
