import { elements } from './elements.js'

let x3domLoadPromise = null
let x3domLoadFailed = false

const ensureX3DOM = () => {
  if (typeof window === 'undefined' || x3domLoadFailed) return null
  if (window?.x3dom?.reload) return Promise.resolve(window.x3dom)
  if (x3domLoadPromise) return x3domLoadPromise

  x3domLoadPromise = Promise.all([
    import('x3dom'),
    import('x3dom/x3dom.css')
  ])
    .then(() => window?.x3dom?.reload?.())
    .catch(err => {
      x3domLoadFailed = true
      console.warn(
        'x3dom failed to load. Ensure it is installed in @pfern/elements.',
        err
      )
    })

  return x3domLoadPromise
}

const withX3DOM = fn => (...args) => {
  ensureX3DOM()
  return fn(...args)
}

export const x3d = withX3DOM(elements.x3d)
export const scene = withX3DOM(elements.scene)
export const viewpoint = withX3DOM(elements.viewpoint)
export const transform = withX3DOM(elements.transform)
export const shape = withX3DOM(elements.shape)
export const appearance = withX3DOM(elements.appearance)
export const material = withX3DOM(elements.material)
export const box = withX3DOM(elements.box)
export const sphere = withX3DOM(elements.sphere)
export const cone = withX3DOM(elements.cone)
export const cylinder = withX3DOM(elements.cylinder)
export const imageTexture = withX3DOM(elements.imageTexture)
export const directionalLight = withX3DOM(elements.directionalLight)
export const pointLight = withX3DOM(elements.pointLight)
export const spotLight = withX3DOM(elements.spotLight)
