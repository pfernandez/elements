import { button, component, div, form, input, li, span, ul }
  from '../../packages/elements/elements.js'

const demoItems = [{ value: 'Add my first todo', done: true },
                   { value: 'Install elements.js', done: false }]

export const todos = component(
  (items = demoItems) => {
    const add = ({ todo: { value }}) =>
      value && todos([...items, { value, done: false }])

    const remove = item =>
      todos(items.filter(i => i !== item))

    const toggle = item =>
      todos(items.map(i => i === item ? { ...i, done: !item.done } : i))

    return div(
      { class: 'todos' },
      form(
        { onsubmit: add },
        input({ name: 'todo', placeholder: 'What needs doing?' }),
        button({ type: 'submit' }, 'Add')
      ),
      ul(...items.map(item =>
        li({ style:
          { 'text-decoration': item.done ? 'line-through' : 'none' }},
           span({ onclick: () => toggle(item) }, item.value),
           button({ onclick: () => remove(item) }, '✕')))))
  })

