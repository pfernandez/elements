import { button, component, div, output }
  from '@pfern/elements'

export const createCounter = () => {
  const counter = component((count = 0) =>
    div(
      output(count),
      button({ onclick: () => counter(count + 1) },
             'Increment')))
  return counter
}
