// Adapted from Stefan Krause's js-framework-benchmark table workload.
// Rewritten for Elements observers and retained vnodes; see LICENSE (Apache-2.0).
import { observe, project } from '@pfern/elements'
import { a, button, div, h1, span, table, tbody, td, tr } from '@pfern/elements/html'

const adjectives = ['pretty', 'large', 'big', 'small', 'tall', 'short', 'long',
                    'handsome', 'plain', 'quaint', 'clean', 'elegant', 'easy', 'angry', 'crazy',
                    'helpful', 'mushy', 'odd', 'unsightly', 'adorable', 'important', 'inexpensive',
                    'cheap', 'expensive', 'fancy']
const colours = ['red', 'yellow', 'blue', 'green', 'pink', 'brown', 'purple',
                 'brown', 'white', 'black', 'orange']
const nouns = ['table', 'chair', 'house', 'bbq', 'desk', 'car', 'pony', 'cookie',
               'sandwich', 'burger', 'pizza', 'mouse', 'keyboard']
const pick = values => values[Math.round(Math.random() * 1000) % values.length]
let nextId = 1
const buildData = count => Array.from({ length: count }, () => ({
  id: nextId++, label: `${pick(adjectives)} ${pick(colours)} ${pick(nouns)}`
}))
const swap = data => {
  const next = data.slice()
  if (next.length > 998) [next[1], next[998]] = [next[998], next[1]]
  return next
}

// Like the comparison's memoized React Row, reuse a row while its immutable
// item and selected flag are unchanged. The cache does not own discarded data.
const rows = new WeakMap()
const row = (item, selected) => {
  const previous = import.meta.env.ELEMENTS_FRESH_ROWS ? null : rows.get(item)
  const source = previous?.selected === selected ? previous.source
    : tr({ key: item.id, class: selected ? 'danger' : '' },
         td({ class: 'col-md-1' }, item.id),
         td({ class: 'col-md-4' }, a(item.label)),
         td({ class: 'col-md-1' },
            a(span({ class: 'glyphicon glyphicon-remove', 'aria-hidden': 'true' }))),
         td({ class: 'col-md-6' }))
  if (!import.meta.env.ELEMENTS_FRESH_ROWS) rows.set(item, { selected, source })
  return source
}
const action = (id, title, onclick) =>
  div({ class: 'col-sm-6 smallpad' },
      button({ type: 'button', class: 'btn btn-primary btn-block', id, onclick }, title))

const app = observe((data = [], selected = 0) =>
  div({ class: 'container' },
      div({ class: 'jumbotron' },
          div({ class: 'row' },
              div({ class: 'col-md-6' }, h1('Elements keyed')),
              div({ class: 'col-md-6' },
                  div({ class: 'row' },
                      action('run', 'Create 1,000 rows', () => app(buildData(1000))),
                      action('runlots', 'Create 10,000 rows', () => app(buildData(10000))),
                      action('add', 'Append 1,000 rows', () => app(data.concat(buildData(1000)), selected)),
                      action('update', 'Update every 10th row', () => app(
                        data.map((item, index) => index % 10 ? item
                          : { ...item, label: `${item.label} !!!` }), selected)),
                      action('clear', 'Clear', () => app()),
                      action('swaprows', 'Swap Rows', () => app(swap(data), selected)))))),
      table({ class: 'table table-hover table-striped test-data' },
            tbody({ onclick: event => {
              const link = event.target.closest('a')
              const node = link?.closest('tr')
              const id = node && Number(node.firstChild.textContent)
              return !node ? undefined
                : link.parentNode.cellIndex === 1 ? app(data, id)
                  : app(data.filter(item => item.id !== id), selected)
            } }, data.map(item => row(item, item.id === selected)))),
      span({ class: 'preloadicon glyphicon glyphicon-remove', 'aria-hidden': 'true' })))

project(app(), document.getElementById('main'))
