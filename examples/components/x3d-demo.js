import { appearance, arc2d, box, material,
         scene, shape, transform, viewpoint, x3d } from '../../3d.js'

/**
 * Minimal X3D/X3DOM demo.
 *
 * Notes:
 * - The first render will lazy-load the small core X3DOM bundle.
 * - Because this demo uses <arc2d> (Geometry2D), it will also trigger loading
 *   the full bundle.
 */
export const x3dDemo = () =>
  x3d({ width: '100%',
        height: '360px',
        showStat: 'false',
        showLog: 'false' },
  scene(
    viewpoint({ position: '0 0 6' }),
    transform(
      { translation: '1.2 0 0' },
      shape(
        appearance(material({ diffuseColor: '0.2 0.6 1.0' })),
        box())),
    transform(
      { translation: '-1.6 0 0' },
      shape(
        appearance(material({ emissiveColor: '1.0 0.5 0.0' })),
        arc2d({ radius: 1.0, startAngle: 0, endAngle: 1.57 })))))

