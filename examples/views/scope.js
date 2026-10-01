import { button, observe, div, h3 } from '@pfern/elements'
import { createCounter } from './counter.js'

const counter1 = createCounter()
const counter2 = createCounter()

export const scope = observe(() =>
  div({ class: 'scope' },
      button({ onclick: scope }, 'Reset'),
      div({ class: 'grid' },
          div(h3('Counter 1'), counter1()),
          div(h3('Counter 2'), counter2()))))
