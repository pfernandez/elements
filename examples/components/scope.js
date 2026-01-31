import { button, component, div, h3 } from '../../elements.js'
import { counter } from './counter.js'

export const scope = component(() =>
  div({ class: 'scope' },
      button({ onclick: scope }, 'Reset'),
      div({ class: 'grid' },
          div(h3('Counter 1'), counter()),
          div(h3('Counter 2'), counter()))))

