import { project } from '@pfern/elements'
import { header, h1 } from '@pfern/elements/html'
import { app } from './views/app.js'
import './css/style.css'

project(header(h1('Elements.js Demo')), document.body)
project(app(), document.body)
