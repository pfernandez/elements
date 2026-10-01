import './projection.js'
import './events.js'
import './observers.js'
import './integration.js'
import { run } from './harness.js'

const results = await run()
const report = document.createElement('pre')
report.id = 'results'
report.textContent = encodeURIComponent(JSON.stringify(results))
document.body.replaceChildren(report)
