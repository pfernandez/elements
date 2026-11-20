import { run } from './harness.js'

const groups = ['projection', 'events', 'observers', 'observer-selection', 'project', 'integration']
const group = new URL(location.href).searchParams.get('group')
if (group && !groups.includes(group)) throw new Error(`Unknown browser check group: ${group}`)
for (const name of group ? [group] : groups) await import(`./${name}.js`)

const report = async () => {
  const results = await run()
  const output = document.createElement('pre')
  output.id = 'results'
  output.textContent = encodeURIComponent(JSON.stringify(results))
  document.body.replaceChildren(output)
}

// Start interaction checks after the initial page load.
document.readyState === 'complete' ? report()
  : window.addEventListener('load', report, { once: true })
