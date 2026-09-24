import { appearance, box, material, scene, shape, transform, viewpoint, x3d }
  from '@pfern/elements-x3dom'

/**
 * Minimal X3D/X3DOM demo.
 *
 * Notes:
 * - Calling a 3D helper lazy-loads the full X3DOM bundle and its stylesheet.
 * - Other examples do not load the 3D runtime.
 */
export const cube = () =>
  x3d(
    scene(
      viewpoint({ position: '0 0 6', description: 'Default View' }),
      transform({ rotation: '0 1 0 0.5' },
                shape(
                  appearance(
                    material({ diffuseColor: '0.2 0.6 1.0' })),
                  box()))))
