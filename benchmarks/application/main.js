import { a, button, div, form, input, main, nav, observe, output, project, section } from '@pfern/elements/html'

const assert = (condition, message) => { if (!condition) throw new Error(message) }
const frame = () => new Promise(resolve => requestAnimationFrame(resolve))
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]
const sample = async (run, operations = 20, prepare = () => {}) => {
  const samples = []
  for (let i = -5; i < 15; i++) {
    prepare()
    await new Promise(resolve => setTimeout(resolve, 0))
    const start = performance.now()
    for (let j = 0; j < operations; j++) run()
    if (i >= 0) samples.push((performance.now() - start) / operations)
  }
  return { median: median(samples), samples, operationsPerSample: operations }
}

const setup = (count = 500) => {
  const metrics = { rows: Array(count).fill(0), ticks: [], shared: 0 }
  const rows = Array.from({ length: count }, (_, id) => {
    const row = observe((state = { draft: '', saved: '' }) => {
      metrics.rows[id]++
      return form({ 'data-row': id,
                    onsubmit: fields => row({ draft: fields.name.value, saved: fields.name.value }) },
        input({ name: 'name', 'aria-label': `Name ${id}`, value: state.draft,
                oninput: field => row({ ...state, draft: field.value }) }),
        button({ type: 'submit' }, 'Save'), output(state.saved))
    })
    return row()
  })
  const shared = observe((n = 0) => {
    metrics.shared++
    return button({ 'data-shared': '', onclick: () => shared(n + 1) }, n)
  })
  const initial = shared()
  const animation = div({ 'data-animation': '', ontick: (node, context = 0, dt) => {
    metrics.ticks.push({ context, dt })
    node.style.transform = `translateX(${context % 50}px)`
    return context + 1
  } }, 'Animation')
  const workspace = observe(route => main(
    nav(a({ href: '/application/edit', 'data-route': 'edit', onclick: () => workspace('edit') }, 'Edit'),
        a({ href: '/application/summary', 'data-route': 'summary', onclick: () => workspace('summary') }, 'Summary')),
    section({ 'data-toolbar': '' }, initial),
    route === 'edit' ? section({ 'data-editor': '' }, rows) : div({ 'data-summary': '' }, 'Saved records'),
    section({ 'data-footer': '' }, initial), animation))
  project(workspace('edit'), document.body)
  const rowAt = id => document.querySelector(`[data-row="${id}"]`)
  const update = (id, value) => {
    const field = rowAt(id).elements.name
    field.value = value
    field.dispatchEvent(new Event('input', { bubbles: true }))
  }
  return { count, metrics, rowAt, update,
    navigate: route => document.querySelector(`[data-route="${route}"]`).click(),
    shared: () => document.querySelector('[data-shared]').click() }
}

window.application = {
  setup,
  async nativeMount(count = 500) {
    const host = document.body.appendChild(document.createElement('main'))
    const result = await sample(() => {
      const section = document.createElement('section')
      section.setAttribute('data-editor', '')
      for (let id = 0; id < count; id++) {
        const row = document.createElement('form')
        row.setAttribute('data-row', String(id))
        row.onsubmit = event => event.preventDefault()
        const field = document.createElement('input')
        field.setAttribute('name', 'name')
        field.setAttribute('aria-label', `Name ${id}`)
        field.value = ''
        field.oninput = () => {}
        const save = document.createElement('button')
        save.setAttribute('type', 'submit')
        save.append(document.createTextNode('Save'))
        row.append(field, save, document.createElement('output'))
        section.append(row)
      }
      host.append(section)
    }, 1, () => host.replaceChildren())
    host.remove()
    return result
  },
  async measure(app) {
    let value = 0
    const before = [...app.metrics.rows]
    const input = await sample(() => app.update(0, `draft ${++value}`))
    assert(app.metrics.rows[0] === before[0] + 400, 'Input did not select exactly one observation per event')
    assert(app.metrics.rows.slice(1).every((n, i) => n === before[i + 1]), 'Input updated unrelated rows')
    const shared = await sample(app.shared)
    const projections = [...document.querySelectorAll('[data-shared]')]
    assert(projections.length === 2 && projections.every(node => node.textContent === projections[0].textContent),
           'Parallel projections diverged')
    const navigation = {
      leave: await sample(() => app.navigate('summary'), 1, () => app.navigate('edit')),
      enter: await sample(() => app.navigate('edit'), 1, () => app.navigate('summary'))
    }
    assert(app.rowAt(0).elements.name.value === `draft ${value}`, 'Navigation lost observed input state')
    const node = document.querySelector('[data-animation]')
    await frame()
    const previous = app.metrics.ticks.at(-1)
    node.remove()
    const paused = app.metrics.ticks.length
    await frame(); await frame()
    assert(app.metrics.ticks.length === paused, 'Disconnected animation still ran')
    document.querySelector('main').append(node)
    await frame(); await frame()
    const resumed = app.metrics.ticks[paused]
    assert(resumed?.context === previous.context + 1 && resumed.dt === 0, 'Animation did not resume its context')
    const timestamps = []
    for (let i = 0; i < 61; i++) timestamps.push(await frame())
    const intervals = timestamps.slice(1).map((t, i) => t - timestamps[i])
    return { rows: app.count, input, shared, navigation,
      frames: { medianInterval: median(intervals), maxInterval: Math.max(...intervals), intervals } }
  }
}
