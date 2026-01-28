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
export const anchor = withX3DOM(elements.anchor)
export const background = withX3DOM(elements.background)
export const fog = withX3DOM(elements.fog)
export const navigationInfo = withX3DOM(elements.navigationInfo)
export const viewpoint = withX3DOM(elements.viewpoint)
export const orthoViewpoint = withX3DOM(elements.orthoViewpoint)
export const worldInfo = withX3DOM(elements.worldInfo)
export const group = withX3DOM(elements.group)
export const transform = withX3DOM(elements.transform)
export const x3dswitch = withX3DOM(elements.switch)
export const inline = withX3DOM(elements.inline)
export const lod = withX3DOM(elements.lod)
export const billboard = withX3DOM(elements.billboard)
export const collision = withX3DOM(elements.collision)
export const shape = withX3DOM(elements.shape)
export const appearance = withX3DOM(elements.appearance)
export const material = withX3DOM(elements.material)
export const box = withX3DOM(elements.box)
export const sphere = withX3DOM(elements.sphere)
export const cone = withX3DOM(elements.cone)
export const cylinder = withX3DOM(elements.cylinder)
export const imageTexture = withX3DOM(elements.imageTexture)
export const textureCoordinate = withX3DOM(elements.textureCoordinate)
export const textureCoordinateGenerator = withX3DOM(elements.textureCoordinateGenerator)
export const multiTextureCoordinate = withX3DOM(elements.multiTextureCoordinate)
export const textureCoordinate3D = withX3DOM(elements.textureCoordinate3D)
export const coordinate = withX3DOM(elements.coordinate)
export const normal = withX3DOM(elements.normal)
export const color = withX3DOM(elements.color)
export const colorRGBA = withX3DOM(elements.colorRGBA)
export const pointSet = withX3DOM(elements.pointSet)
export const lineSet = withX3DOM(elements.lineSet)
export const indexedLineSet = withX3DOM(elements.indexedLineSet)
export const indexedFaceSet = withX3DOM(elements.indexedFaceSet)
export const triangleSet = withX3DOM(elements.triangleSet)
export const triangleStripSet = withX3DOM(elements.triangleStripSet)
export const triangleFanSet = withX3DOM(elements.triangleFanSet)
export const indexedTriangleSet = withX3DOM(elements.indexedTriangleSet)
export const indexedTriangleStripSet = withX3DOM(elements.indexedTriangleStripSet)
export const indexedTriangleFanSet = withX3DOM(elements.indexedTriangleFanSet)
export const directionalLight = withX3DOM(elements.directionalLight)
export const pointLight = withX3DOM(elements.pointLight)
export const spotLight = withX3DOM(elements.spotLight)
export const elevationGrid = withX3DOM(elements.elevationGrid)
export const extrusion = withX3DOM(elements.extrusion)
export const arc2d = withX3DOM(elements.arc2d)
export const arcclose2d = withX3DOM(elements.arcclose2d)
export const circle2d = withX3DOM(elements.circle2d)
export const disk2d = withX3DOM(elements.disk2d)
export const polyline2d = withX3DOM(elements.polyline2d)
export const polypoint2d = withX3DOM(elements.polypoint2d)
export const rectangle2d = withX3DOM(elements.rectangle2d)
export const triangleset2d = withX3DOM(elements.triangleset2d)
