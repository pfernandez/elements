/**
 * X3D tag helpers (concrete nodes).
 */

type ElementHelper = {
  (props: Record<string, any>, ...children: any[]): [tag: string, props: Record<string, any>, ...children: any[]];
  (...children: any[]): [tag: string, props: Record<string, any>, ...children: any[]];
};

/**
 * The <x3d> element is the top-level element that contains an X3D scene.
 * https://doc.x3dom.org/author/Core/X3D.html
 *
 * @type {ElementHelper}
 */
export const x3d: ElementHelper;

/**
 * The <scene> node groups the 3D content that makes up the scene.
 * https://doc.x3dom.org/author/Core/Scene.html
 *
 * @type {ElementHelper}
 */
export const scene: ElementHelper;

/**
 * The <anchor> node groups content and defines links that can be activated to move to a URL.
 * https://doc.x3dom.org/author/Core/Anchor.html
 *
 * @type {ElementHelper}
 */
export const anchor: ElementHelper;

/**
 * The <background> node defines background colors or textures for the scene and is bindable.
 * https://doc.x3dom.org/author/EnvironmentalEffects/Background.html
 *
 * @type {ElementHelper}
 */
export const background: ElementHelper;

/**
 * The <fog> node adds a distance-based fog effect to the scene.
 * https://doc.x3dom.org/author/EnvironmentalEffects/Fog.html
 *
 * @type {ElementHelper}
 */
export const fog: ElementHelper;

/**
 * The <navigationInfo> node specifies navigation parameters (such as type and speed) and is bindable.
 * https://doc.x3dom.org/author/Navigation/NavigationInfo.html
 *
 * @type {ElementHelper}
 */
export const navigationInfo: ElementHelper;

/**
 * The <viewpoint> node defines a viewing position and orientation; only one is active at a time.
 * https://doc.x3dom.org/author/Navigation/Viewpoint.html
 *
 * @type {ElementHelper}
 */
export const viewpoint: ElementHelper;

/**
 * The <orthoViewpoint> node defines an orthographic camera for the scene.
 * https://doc.x3dom.org/author/Navigation/OrthoViewpoint.html
 *
 * @type {ElementHelper}
 */
export const orthoViewpoint: ElementHelper;

/**
 * The <worldInfo> node provides title and metadata about the world.
 * https://doc.x3dom.org/author/Core/WorldInfo.html
 *
 * @type {ElementHelper}
 */
export const worldInfo: ElementHelper;

/**
 * The <group> node collects children together without applying a transform.
 * https://doc.x3dom.org/author/Grouping/Group.html
 *
 * @type {ElementHelper}
 */
export const group: ElementHelper;

/**
 * The <transform> node applies translation, rotation, and scale to its children.
 * https://doc.x3dom.org/author/Grouping/Transform.html
 *
 * @type {ElementHelper}
 */
export const transform: ElementHelper;

/**
 * The <switch> node selects which child to display based on its active choice.
 * https://doc.x3dom.org/author/Grouping/Switch.html
 *
 * @type {ElementHelper}
 */
export const x3dswitch: ElementHelper;

/**
 * The <inline> node loads external X3D content into the current scene.
 * https://doc.x3dom.org/author/Grouping/Inline.html
 *
 * @type {ElementHelper}
 */
export const inline: ElementHelper;

/**
 * The <lod> node switches among children based on distance from the viewer.
 * https://doc.x3dom.org/author/Grouping/LOD.html
 *
 * @type {ElementHelper}
 */
export const lod: ElementHelper;

/**
 * The <billboard> node rotates its children to face the viewer.
 * https://doc.x3dom.org/author/Grouping/Billboard.html
 *
 * @type {ElementHelper}
 */
export const billboard: ElementHelper;

/**
 * The <collision> node defines collision behavior and an optional proxy geometry.
 * https://doc.x3dom.org/author/Navigation/Collision.html
 *
 * @type {ElementHelper}
 */
export const collision: ElementHelper;

/**
 * The <shape> node ties geometry and appearance together for rendering.
 * https://doc.x3dom.org/author/Shape/Shape.html
 *
 * @type {ElementHelper}
 */
export const shape: ElementHelper;

/**
 * The <appearance> node specifies the visual appearance (materials, textures, shaders).
 * https://doc.x3dom.org/author/Shape/Appearance.html
 *
 * @type {ElementHelper}
 */
export const appearance: ElementHelper;

/**
 * The <material> node defines surface material properties used by lighting.
 * https://doc.x3dom.org/author/Shape/Material.html
 *
 * @type {ElementHelper}
 */
export const material: ElementHelper;

/**
 * The <box> node creates box geometry defined by its size.
 * https://doc.x3dom.org/author/Geometry3D/Box.html
 *
 * @type {ElementHelper}
 */
export const box: ElementHelper;

/**
 * The <sphere> node creates sphere geometry defined by its radius.
 * https://doc.x3dom.org/author/Geometry3D/Sphere.html
 *
 * @type {ElementHelper}
 */
export const sphere: ElementHelper;

/**
 * The <cone> node creates cone geometry defined by height and top/bottom radii.
 * https://doc.x3dom.org/author/Geometry3D/Cone.html
 *
 * @type {ElementHelper}
 */
export const cone: ElementHelper;

/**
 * The <cylinder> node creates cylinder geometry defined by height and radius.
 * https://doc.x3dom.org/author/Geometry3D/Cylinder.html
 *
 * @type {ElementHelper}
 */
export const cylinder: ElementHelper;

/**
 * The <imageTexture> node maps an image file onto geometry as a texture.
 * https://doc.x3dom.org/author/Texturing/ImageTexture.html
 *
 * @type {ElementHelper}
 */
export const imageTexture: ElementHelper;

/**
 * The <textureCoordinate> node supplies 2D texture coordinates for geometry.
 * https://doc.x3dom.org/author/Texturing/TextureCoordinate.html
 *
 * @type {ElementHelper}
 */
export const textureCoordinate: ElementHelper;

/**
 * The <textureCoordinateGenerator> node generates texture coordinates procedurally.
 * https://doc.x3dom.org/author/Texturing/TextureCoordinateGenerator.html
 *
 * @type {ElementHelper}
 */
export const textureCoordinateGenerator: ElementHelper;

/**
 * The <multiTextureCoordinate> node provides multiple sets of texture coordinates.
 * https://doc.x3dom.org/author/Texturing/MultiTextureCoordinate.html
 *
 * @type {ElementHelper}
 */
export const multiTextureCoordinate: ElementHelper;

/**
 * The <textureCoordinate3D> node supplies 3D texture coordinates.
 * https://doc.x3dom.org/author/Texturing/TextureCoordinate3D.html
 *
 * @type {ElementHelper}
 */
export const textureCoordinate3D: ElementHelper;

/**
 * The <coordinate> node supplies 3D point coordinates for geometry.
 * https://doc.x3dom.org/author/Rendering/Coordinate.html
 *
 * @type {ElementHelper}
 */
export const coordinate: ElementHelper;

/**
 * The <normal> node supplies per-vertex or per-face normals for lighting.
 * https://www.web3d.org/specifications/X3Dv4/ISO-IEC19775-1v4-IS/Part01/components/rendering.html
 *
 * @type {ElementHelper}
 */
export const normal: ElementHelper;

/**
 * The <color> node supplies per-vertex or per-face RGB colors.
 * https://doc.x3dom.org/author/Rendering/Color.html
 *
 * @type {ElementHelper}
 */
export const color: ElementHelper;

/**
 * The <colorRGBA> node supplies per-vertex or per-face RGBA colors including alpha.
 * https://doc.x3dom.org/author/Rendering/ColorRGBA.html
 *
 * @type {ElementHelper}
 */
export const colorRGBA: ElementHelper;

/**
 * The <pointSet> node renders a set of points.
 * https://doc.x3dom.org/author/Rendering/PointSet.html
 *
 * @type {ElementHelper}
 */
export const pointSet: ElementHelper;

/**
 * The <lineSet> node renders line segments from coordinate pairs.
 * https://www.web3d.org/specifications/X3Dv4/ISO-IEC19775-1v4-IS/Part01/components/rendering.html
 *
 * @type {ElementHelper}
 */
export const lineSet: ElementHelper;

/**
 * The <indexedLineSet> node renders lines using index lists into coordinate arrays.
 * https://doc.x3dom.org/author/Rendering/IndexedLineSet.html
 *
 * @type {ElementHelper}
 */
export const indexedLineSet: ElementHelper;

/**
 * The <indexedFaceSet> node defines polygonal faces using index lists into coordinate arrays.
 * https://doc.x3dom.org/author/Rendering/IndexedFaceSet.html
 *
 * @type {ElementHelper}
 */
export const indexedFaceSet: ElementHelper;

/**
 * The <triangleSet> node renders an unindexed set of triangles.
 * https://doc.x3dom.org/author/Rendering/TriangleSet.html
 *
 * @type {ElementHelper}
 */
export const triangleSet: ElementHelper;

/**
 * The <triangleStripSet> node renders triangle strips.
 * https://www.web3d.org/specifications/X3Dv4/ISO-IEC19775-1v4-IS/Part01/components/rendering.html
 *
 * @type {ElementHelper}
 */
export const triangleStripSet: ElementHelper;

/**
 * The <triangleFanSet> node renders triangle fans.
 * https://www.web3d.org/specifications/X3Dv4/ISO-IEC19775-1v4-IS/Part01/components/rendering.html
 *
 * @type {ElementHelper}
 */
export const triangleFanSet: ElementHelper;

/**
 * The <indexedTriangleSet> node renders indexed triangles.
 * https://doc.x3dom.org/author/Rendering/IndexedTriangleSet.html
 *
 * @type {ElementHelper}
 */
export const indexedTriangleSet: ElementHelper;

/**
 * The <indexedTriangleStripSet> node renders indexed triangle strips.
 * https://www.web3d.org/specifications/X3Dv4/ISO-IEC19775-1v4-IS/Part01/components/rendering.html
 *
 * @type {ElementHelper}
 */
export const indexedTriangleStripSet: ElementHelper;

/**
 * The <indexedTriangleFanSet> node renders indexed triangle fans.
 * https://www.web3d.org/specifications/X3Dv4/ISO-IEC19775-1v4-IS/Part01/components/rendering.html
 *
 * @type {ElementHelper}
 */
export const indexedTriangleFanSet: ElementHelper;

/**
 * The <directionalLight> node emits parallel light rays.
 * https://doc.x3dom.org/author/Lighting/DirectionalLight.html
 *
 * @type {ElementHelper}
 */
export const directionalLight: ElementHelper;

/**
 * The <pointLight> node emits light in all directions from a point.
 * https://doc.x3dom.org/author/Lighting/PointLight.html
 *
 * @type {ElementHelper}
 */
export const pointLight: ElementHelper;

/**
 * The <spotLight> node emits a cone-shaped beam of light.
 * https://doc.x3dom.org/author/Lighting/SpotLight.html
 *
 * @type {ElementHelper}
 */
export const spotLight: ElementHelper;

/**
 * The <elevationGrid> node defines a height field surface as a grid of elevations.
 * https://doc.x3dom.org/author/Geometry3DExt/ElevationGrid.html
 *
 * @type {ElementHelper}
 */
export const elevationGrid: ElementHelper;

/**
 * The <extrusion> node defines 3D geometry by sweeping a 2D cross-section along a spine.
 * https://www.web3d.org/specifications/X3Dv4/ISO-IEC19775-1v4-IS/Part01/components/geometry3D.html
 *
 * @type {ElementHelper}
 */
export const extrusion: ElementHelper;

/**
 * The <arc2d> node defines a circular arc in 2D, specified by start/end angles and radius.
 * https://www.web3d.org/specifications/X3Dv4/ISO-IEC19775-1v4-IS/Part01/components/geometry2D.html
 *
 * @type {ElementHelper}
 */
export const arc2d: ElementHelper;

/**
 * The <arcclose2d> node defines a circular arc that is closed by a chord or a pie-slice.
 * https://www.web3d.org/specifications/X3Dv4/ISO-IEC19775-1v4-IS/Part01/components/geometry2D.html
 *
 * @type {ElementHelper}
 */
export const arcclose2d: ElementHelper;

/**
 * The <circle2d> node defines a circle in 2D using a radius.
 * https://www.web3d.org/specifications/X3Dv4/ISO-IEC19775-1v4-IS/Part01/components/geometry2D.html
 *
 * @type {ElementHelper}
 */
export const circle2d: ElementHelper;

/**
 * The <disk2d> node defines a filled disk or ring in 2D using inner/outer radius.
 * https://www.web3d.org/specifications/X3Dv4/ISO-IEC19775-1v4-IS/Part01/components/geometry2D.html
 *
 * @type {ElementHelper}
 */
export const disk2d: ElementHelper;

/**
 * The <polyline2d> node defines a connected series of line segments in 2D.
 * https://www.web3d.org/specifications/X3Dv4/ISO-IEC19775-1v4-IS/Part01/components/geometry2D.html
 *
 * @type {ElementHelper}
 */
export const polyline2d: ElementHelper;

/**
 * The <polypoint2d> node defines a set of 2D points rendered as markers.
 * https://www.web3d.org/specifications/X3Dv4/ISO-IEC19775-1v4-IS/Part01/components/geometry2D.html
 *
 * @type {ElementHelper}
 */
export const polypoint2d: ElementHelper;

/**
 * The <rectangle2d> node defines a rectangle in 2D using its size.
 * https://www.web3d.org/specifications/X3Dv4/ISO-IEC19775-1v4-IS/Part01/components/geometry2D.html
 *
 * @type {ElementHelper}
 */
export const rectangle2d: ElementHelper;

/**
 * The <triangleset2d> node defines a set of filled 2D triangles.
 * https://www.web3d.org/specifications/X3Dv4/ISO-IEC19775-1v4-IS/Part01/components/geometry2D.html
 *
 * @type {ElementHelper}
 */
export const triangleset2d: ElementHelper;
