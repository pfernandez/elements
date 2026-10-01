import { cube } from './cube.js'

// The returned angle becomes the next frame's context; dt is milliseconds.
const rotate = (el, angle = 0.5, dt) => {
  const next = (angle + dt * 0.001) % (2 * Math.PI)
  el.setAttribute('rotation', `0 1 0 ${next}`)
  return next
}

export const tick = () => cube({ ontick: rotate })
