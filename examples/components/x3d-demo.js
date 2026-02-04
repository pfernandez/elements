import { appearance, box, material, scene,
         shape, transform, viewpoint, x3d }
  from '../../packages/elements-3d/3d.js'

/**
 * Minimal X3D/X3DOM demo.
 *
 * Notes:
 * - The first render will lazy-load the small core X3DOM bundle.
 * - Because this demo uses <arc2d> (Geometry2D), it will also trigger loading
 *   the full bundle.
 */
export const x3dDemo = () =>
  x3d(
    scene(
      viewpoint({ position: '0 0 6', description: 'Default View' }),
      transform({ rotation: '0 1 0 0.5' },
        shape(
          appearance(
            material({ diffuseColor: '0.2 0.6 1.0' })),
          box()))))
