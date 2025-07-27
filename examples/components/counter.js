import { button, component, div, output } from '../../elements.js'

export const counter = component((count = 0) =>
  div(
    output(count),
    button(
      { onclick: () => counter(count + 1) },
      'Increment')))

