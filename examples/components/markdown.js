import MarkdownIt from 'markdown-it'
import { div } from '@pfern/elements'

const parser = MarkdownIt({ html: false })

/** Render prose as ordinary markup; raw HTML and scripts remain text. */
export const markdown = source =>
  div({ class: 'markdown', innerHTML: parser.render(source) })
