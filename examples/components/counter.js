import { button, observe, div, output }
  from '@pfern/elements'

export const createCounter = () => {
  const counter = observe((count = 0) =>
    div(
      output(count),
      button({ onclick: () => counter(count + 1) },
             'Increment')))
  return counter
}
