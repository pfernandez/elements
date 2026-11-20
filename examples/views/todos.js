import { button, div, form, input, li, observe, span, ul } from '@pfern/elements/html'

const demoItems = [{ value: 'Add my first todo', isDone: true },
                   { value: 'Install elements.js', isDone: false }]

export const todos = observe(
  (items = demoItems) => {
    const add = ({ todo: { value }}) =>
      value && todos([...items, { value, isDone: false }])

    const remove = item =>
      todos(items.filter(i => i !== item))

    const toggle = item =>
      todos(items.map(i => i === item ? { ...i, isDone: !item.isDone } : i))

    return div(
      { class: 'todos' },
      form(
        { onsubmit: add },
        input({ name: 'todo', placeholder: 'What needs doing?' }),
        button({ type: 'submit' }, 'Add')
      ),
      ul(items.map(item =>
        li({ style:
          { 'text-decoration': item.isDone ? 'line-through' : 'none' }},
           span({ onclick: () => toggle(item) }, item.value),
           button({ onclick: () => remove(item) }, '✕')))))
  })
