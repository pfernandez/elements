import { button, component, div, h2, p } from '../../elements.js'
import { counter } from './counter.js'

export const scope = component(() =>
  div(
    h2('Component Scope'),
    p(`Reloading a parent components also reloads its children. Child components
       have separate scope, even with the same names.`),
    button({ class: 'reset', onclick: scope }, 'Reset'),
    div({ class: 'grid' },
      div(h2('Counter 1'),
        counter()),
      div(
        h2('Counter 2'),
        counter()))))
