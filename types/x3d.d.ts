/**
 * X3D tag helpers (concrete nodes supported by X3DOM).
 *
 * Note: Some X3D node names overlap with HTML/SVG tags (e.g. `param`, `text`).
 * This library exports those with an `x3d`-prefix (e.g. `x3dparam`, `x3dtext`).
 *
 * Descriptions are sourced from the X3DOM project’s node JSDoc (when available) and
 * augmented with @see links to the official X3DOM docs pages.
 */

type ElementHelper = {
  (props: Record<string, any>, ...children: any[]): [tag: string, props: Record<string, any>, ...children: any[]];
  (...children: any[]): [tag: string, props: Record<string, any>, ...children: any[]];
};

/**
 * The <x3d> element is the top-level container for an X3D scene.
 * @see https://doc.x3dom.org/author/Core/X3D.html
 */
export const x3d: ElementHelper;

/**
 * The metadata provided by this node is contained in the Boolean values of the value field.
 * @see https://doc.x3dom.org/author/Core/MetadataBoolean.html
 */
export const metadataBoolean: ElementHelper;

/**
 * The metadata provided by this node is contained in the double-precision floating point numbers of
 * the value field.
 * @see https://doc.x3dom.org/author/Core/MetadataDouble.html
 */
export const metadataDouble: ElementHelper;

/**
 * The metadata provided by this node is contained in the single-precision floating point numbers of
 * the value field.
 * @see https://doc.x3dom.org/author/Core/MetadataFloat.html
 */
export const metadataFloat: ElementHelper;

/**
 * The metadata provided by this node is contained in the integers of the value field.
 * @see https://doc.x3dom.org/author/Core/MetadataInteger.html
 */
export const metadataInteger: ElementHelper;

/**
 * The metadata provided by this node is contained in the metadata nodes of the value field.
 * @see https://doc.x3dom.org/author/Core/MetadataSet.html
 */
export const metadataSet: ElementHelper;

/**
 * The metadata provided by this node is contained in the strings of the value field.
 * @see https://doc.x3dom.org/author/Core/MetadataString.html
 */
export const metadataString: ElementHelper;

/**
 * Class represents a field of a node containing name, type and value
 * @see https://doc.x3dom.org/author/Core/Field.html
 */
export const field: ElementHelper;

/**
 * The WorldInfo node contains information about the world. This node is strictly for documentation
 * purposes and has no effect on the visual appearance or behaviour of the world.
 * @see https://doc.x3dom.org/author/Core/WorldInfo.html
 */
export const worldInfo: ElementHelper;

/**
 * <param> node (X3DOM Core component).
 *
 * Exported as `x3dparam` to avoid colliding with the HTML/SVG `param` helper.
 * @see https://doc.x3dom.org/author/Core/Param.html
 */
export const x3dparam: ElementHelper;

/**
 * The Switch grouping node traverses zero or one of the nodes specified in the children field.
 * All nodes under a Switch continue to receive and send events regardless of the value of whichChoice.
 * For example, if an active TimeSensor is contained within an inactive choice of an Switch, the TimeSensor sends events regardless of the Switch's state.
 *
 * Exported as `x3dswitch` to avoid colliding with the HTML/SVG `switch` helper.
 * @see https://doc.x3dom.org/author/Grouping/Switch.html
 */
export const x3dswitch: ElementHelper;

/**
 * The Transform node is a grouping node that defines a coordinate system for its children that is relative to the coordinate systems of its ancestors.
 * The translation, rotation, scale, scaleOrientation and center fields define a geometric 3D transformation.
 * @see https://doc.x3dom.org/author/Grouping/Transform.html
 */
export const transform: ElementHelper;

/**
 * The MatrixTransform node is a grouping node that defines a coordinate system for its children that is relative to the coordinate systems of its ancestors.
 * The transformation is given as a matrix.
 * @see https://doc.x3dom.org/author/Grouping/MatrixTransform.html
 */
export const matrixTransform: ElementHelper;

/**
 * A Group node contains children nodes without introducing a new transformation.
 * It is equivalent to a Transform node containing an identity transform.
 * @see https://doc.x3dom.org/author/Grouping/Group.html
 */
export const group: ElementHelper;

/**
 * <block> node (X3DOM Grouping component).
 * @see https://doc.x3dom.org/author/Grouping/Block.html
 */
export const block: ElementHelper;

/**
 * The StaticGroup node contains children nodes which cannot be modified.
 * StaticGroup children are guaranteed to not change, send events, receive events or contain any USE references outside the StaticGroup.
 * This allows the browser to optimize this content for faster rendering and less memory usage.
 * @see https://doc.x3dom.org/author/Grouping/StaticGroup.html
 */
export const staticGroup: ElementHelper;

/**
 * The RemoteSelectionGroup node uses a WebSocket connection to request the results of a a  side
 *  culling.
 * @see https://doc.x3dom.org/author/Grouping/RemoteSelectionGroup.html
 */
export const remoteSelectionGroup: ElementHelper;

/**
 * The scene node wraps the x3d scene.
 * @see https://doc.x3dom.org/author/Grouping/Scene.html
 */
export const scene: ElementHelper;

/**
 * This is an experimental WebSG geo node
 * @see https://doc.x3dom.org/author/Rendering/Mesh.html
 */
export const mesh: ElementHelper;

/**
 * PointSet is a node that contains a set of colored 3D points, represented by contained Color and Coordinate nodes.
 * Color values or a Material emissiveColor is used to draw lines and points. Hint: use a different color (or emissiveColor) than the background color.
 * Hint: insert a Shape node before adding geometry or Appearance. You can also substitute a type-matched ProtoInstance for content.
 * @see https://doc.x3dom.org/author/Rendering/PointSet.html
 */
export const pointSet: ElementHelper;

/**
 * LineSet is a geometry node that can contain a Color node and a Coordinate node.
 * Color values or a Material emissiveColor is used to draw lines and points.
 * Lines are not lit, are not texture-mapped, and do not participate in collision detection.
 * Hint: use a different color (or emissiveColor) than the background color.
 * Hint: if rendering Coordinate points originally defined for an IndexedFaceSet, index values may need to repeat each initial vertex to close each polygon outline.
 * Hint: insert a Shape node before adding geometry or Appearance.
 * @see https://doc.x3dom.org/author/Rendering/LineSet.html
 */
export const lineSet: ElementHelper;

/**
 * IndexedLineSet is a geometry node that can contain a Color node and a Coordinate node.
 * Color values or a Material emissiveColor is used to draw lines and points. Lines are not lit, are not texture-mapped, and do not participate in collision detection.
 * Hint: use a different color (or emissiveColor) than the background color.
 * Hint: if rendering Coordinate points originally defined for an IndexedFaceSet, index values may need to repeat each initial vertex to close each polygon outline.
 * Hint: insert a Shape node before adding geometry or Appearance. You can also substitute a type-matched ProtoInstance for content.
 * @see https://doc.x3dom.org/author/Rendering/IndexedLineSet.html
 */
export const indexedLineSet: ElementHelper;

/**
 * IndexedTriangleSet is a geometry node that can contain a Color, Coordinate, Normal and TextureCoordinate node.
 * Hint: insert a Shape node before adding geometry or Appearance.
 * You can also substitute a type-matched ProtoInstance for content.
 * @see https://doc.x3dom.org/author/Rendering/IndexedTriangleSet.html
 */
export const indexedTriangleSet: ElementHelper;

/**
 * IndexedTriangleStripSet is a geometry node that can contain a Color, Coordinate, Normal and TextureCoordinate node.
 * Hint: insert a Shape node before adding geometry or Appearance. You can also substitute a type-matched ProtoInstance for content.
 * @see https://doc.x3dom.org/author/Rendering/IndexedTriangleStripSet.html
 */
export const indexedTriangleStripSet: ElementHelper;

/**
 * TriangleSet is a geometry node that can contain a Color, Coordinate, Normal and TextureCoordinate node.
 * Hint: insert a Shape node before adding geometry or Appearance.
 * You can also substitute a type-matched ProtoInstance for content.
 * @see https://doc.x3dom.org/author/Rendering/TriangleSet.html
 */
export const triangleSet: ElementHelper;

/**
 * Coordinate builds geometry using a set of 3D coordinates.
 * Coordinate is used by IndexedFaceSet, IndexedLineSet, LineSet and PointSet.
 * @see https://doc.x3dom.org/author/Rendering/Coordinate.html
 */
export const coordinate: ElementHelper;

/**
 * Coordinate builds geometry using a set of double precision 3D coordinates.
 * X3DCoordinateNode is used by IndexedFaceSet, IndexedLineSet, LineSet and PointSet.
 * @see https://doc.x3dom.org/author/Nurbs/CoordinateDouble.html
 */
export const coordinateDouble: ElementHelper;

/**
 * Normal is a set of 3D surface-normal vectors Normal values are optional perpendicular directions, used per-polygon or per-vertex for lighting and shading.
 * Hint: used by IndexedFaceSet and ElevationGrid.
 * @see https://doc.x3dom.org/author/Rendering/Normal.html
 */
export const normal: ElementHelper;

/**
 * This node defines a set of RGB colors to be used in the fields of another node.
 * Color nodes are only used to specify multiple colours for a single geometric shape, such as colours for the faces or vertices of an IndexedFaceSet.
 * A Material node is used to specify the overall material parameters of lit geometry.
 * If both a Material node and a Color node are specified for a geometric shape, the colours shall replace the diffuse component of the material.
 * RGB or RGBA textures take precedence over colours; specifying both an RGB or RGBA texture and a Color node for geometric shape will result in the Color node being ignored.
 * @see https://doc.x3dom.org/author/Rendering/Color.html
 */
export const color: ElementHelper;

/**
 * This node defines a set of RGBA colours to be used in the fields of another node.
 * RGBA color nodes are only used to specify multiple colours with alpha for a single geometric shape, such as colours for the faces or vertices of an IndexedFaceSet.
 * A Material node is used to specify the overall material parameters of lit geometry.
 * If both a Material node and a ColorRGBA node are specified for a geometric shape, the colours shall replace the diffuse and transparency components of the material.
 * RGB or RGBA textures take precedence over colours; specifying both an RGB or RGBA texture and a ColorRGBA node for geometric shape will result in the ColorRGBA node being ignored.
 * @see https://doc.x3dom.org/author/Rendering/ColorRGBA.html
 */
export const colorRGBA: ElementHelper;

/**
 * The ParticleSet is a geometry node used in combination with a ParticleSystem node.
 *  Attention: So far this is only a stub.
 * @see https://doc.x3dom.org/author/Rendering/ParticleSet.html
 */
export const particleSet: ElementHelper;

/**
 * A clip plane is defined as a plane that generates two half-spaces. The effected geometry in the
 * half-space that is defined as being outside the plane is removed from the rendered image as a result of a
 * clipping operation.
 * @see https://doc.x3dom.org/author/Rendering/ClipPlane.html
 */
export const clipPlane: ElementHelper;

/**
 * The Appearance node specifies the visual properties of geometry.
 * The value for each of the fields in this node may be NULL.
 * However, if the field is non-NULL, it shall contain one node of the appropriate type.
 * @see https://doc.x3dom.org/author/Shape/Appearance.html
 */
export const appearance: ElementHelper;

/**
 * The BlendMode controls blending and alpha test.
 * Pixels can be drawn using a function that blends the incoming (source) RGBA values with the RGBA values that are already in the frame buffer (the destination values).
 * @see https://doc.x3dom.org/author/Shape/BlendMode.html
 */
export const blendMode: ElementHelper;

/**
 * The depth mode contains the parameters that are specific for depth control, like the value used for depth buffer comparisons.
 * @see https://doc.x3dom.org/author/Shape/DepthMode.html
 */
export const depthMode: ElementHelper;

/**
 * The ColorMaskMode node affects drawing in RGBA mode. The 4 masks control whether the corresponding component is written.
 * @see https://doc.x3dom.org/author/Shape/ColorMaskMode.html
 */
export const colorMaskMode: ElementHelper;

/**
 * The LineProperties node specifies additional properties to be applied to all line geometry. The colour of the line is specified by the associated Material node.
 * @see https://doc.x3dom.org/author/Shape/LineProperties.html
 */
export const lineProperties: ElementHelper;

/**
 * The PointProperties node specifies additional properties to be applied to all point geometry.
 * @see https://doc.x3dom.org/author/Shape/PointProperties.html
 */
export const pointProperties: ElementHelper;

/**
 * The Material node specifies surface material properties for associated geometry nodes and is used by the X3D lighting equations during rendering.
 * All of the fields in the Material node range from 0.0 to 1.0.
 * @see https://doc.x3dom.org/author/Shape/Material.html
 */
export const material: ElementHelper;

/**
 * This node defines material properties that can effect both the front and back side of a polygon individually.
 * These materials are used for both the front and back side of the geometry whenever the X3D lighting model is active.
 * @see https://doc.x3dom.org/author/Shape/TwoSidedMaterial.html
 */
export const twoSidedMaterial: ElementHelper;

/**
 * This is the base node type for all Material nodes.
 * @see https://doc.x3dom.org/author/Shape/PhysicalMaterial.html
 */
export const physicalMaterial: ElementHelper;

/**
 * The Shape node has two fields, appearance and geometry, that are used to create rendered objects in the world.
 * The appearance field contains an Appearance node that specifies the visual attributes (e.g., material and texture) to be applied to the geometry.
 * The geometry field contains a geometry node. The specified geometry node is rendered with the specified appearance nodes applied.
 * @see https://doc.x3dom.org/author/Shape/Shape.html
 */
export const shape: ElementHelper;

/**
 * The DirectionalLight node defines a directional light source that illuminates along rays parallel to a given 3-dimensional vector.
 * A directional light source illuminates only the objects in its enclosing parent group.
 * The light may illuminate everything within this coordinate system, including all children and descendants of its parent group.
 * The accumulated transformations of the parent nodes affect the light.
 * DirectionalLight nodes do not attenuate with distance.
 * @see https://doc.x3dom.org/author/Lighting/DirectionalLight.html
 */
export const directionalLight: ElementHelper;

/**
 * The PointLight node specifies a point light source at a 3D location in the local coordinate system.
 * A point light source emits light equally in all directions; that is, it is omnidirectional.
 * PointLight nodes are specified in the local coordinate system and are affected by ancestor transformations.
 * @see https://doc.x3dom.org/author/Lighting/PointLight.html
 */
export const pointLight: ElementHelper;

/**
 * The SpotLight node defines a light source that emits light from a specific point along a specific direction vector and constrained within a solid angle.
 * Spotlights may illuminate geometry nodes that respond to light sources and intersect the solid angle defined by the SpotLight.
 * Spotlight nodes are specified in the local coordinate system and are affected by ancestors' transformations.
 * @see https://doc.x3dom.org/author/Lighting/SpotLight.html
 */
export const spotLight: ElementHelper;

/**
 * <physicalEnvironmentLight> node (X3DOM Lighting component).
 * @see https://doc.x3dom.org/author/Lighting/PhysicalEnvironmentLight.html
 */
export const physicalEnvironmentLight: ElementHelper;

/**
 * The ColorChaser animates transitions for single color values. Whenever the set_destination
 *  field receives a floating point number, the value_changed creates a transition from its current value to
 *  the newly set number. It creates a smooth transition that ends duration seconds after the last number has
 *  been received.
 * @see https://doc.x3dom.org/author/Followers/ColorChaser.html
 */
export const colorChaser: ElementHelper;

/**
 * The ColorDamper animates color values. Whenever the it receives a color, the ColorDamper node
 *  creates a transition from the current color to the newly set color. The transition created approaches the
 *  newly set position asymptotically during a time period of approximately three to four times the value of
 *  the field tau depending on the desired accuracy and the value of order. The order field specifies the
 *  smoothness of the transition.
 * @see https://doc.x3dom.org/author/Followers/ColorDamper.html
 */
export const colorDamper: ElementHelper;

/**
 * The OrientationChaser animates transitions for orientations. If it is routed to a rotation field
 *  of a Transform node that contains an object, whenever the set_destination field receives an orientation, the
 *  OrientationChaser node rotates the object from its current orientation to the newly set orientation.
 *  It creates a smooth transition that ends duration seconds after the last orientation has been received.
 * @see https://doc.x3dom.org/author/Followers/OrientationChaser.html
 */
export const orientationChaser: ElementHelper;

/**
 * The OrientationDamper animates transitions of orientations. If its value is routed to an
 *  orientation field of a Transform node that contains an object, then, whenever the destination field receives
 *  an orientation, the OrientationDamper node rotates the object from its current orientation to the newly set
 *  orientation. It creates a transition that approaches the newly set orientation asymptotically during a time
 *  period of approximately three to four times the value of the field tau depending on the desired accuracy and
 *  the value of order. Through this asymptotic approach of the destination orientation, a very smooth
 *  transition is created.
 * @see https://doc.x3dom.org/author/Followers/OrientationDamper.html
 */
export const orientationDamper: ElementHelper;

/**
 * The PositionChaser animates transitions for 3D vectors. If its value field is routed to a
 *  translation field of a Transform node that contains an object, then, whenever the destination field
 *  receives a 3D position, the PositionChaser node moves the object from its current position to the newly set
 *  position. It creates a smooth transition that ends duration seconds after the last position has been
 *  received.
 * @see https://doc.x3dom.org/author/Followers/PositionChaser.html
 */
export const positionChaser: ElementHelper;

/**
 * The PositionChaser2D animates transitions for 2D vectors. Whenever its destination field receives
 *  a 2D vector it creates a transition from its current 2D vector value to the newly set value. It creates a
 *  smooth transition that ends duration seconds after the last 2D vector has been received.
 * @see https://doc.x3dom.org/author/Followers/PositionChaser2D.html
 */
export const positionChaser2d: ElementHelper;

/**
 * The PositionDamper animates transitions for 3D vectors. If its value field is routed to a
 *  translation field of a Transform node that contains an object, then, whenever the destination field receives
 *  a 3D position, the PositionDamper node moves the object from its current position to the newly set position.
 * @see https://doc.x3dom.org/author/Followers/PositionDamper.html
 */
export const positionDamper: ElementHelper;

/**
 * The PositionDamper2D animates transitions for 2D vectors. Whenever the destination field receives
 * a 2D vector, it creates a transition from its current 2D vector value to the newly set value.
 * @see https://doc.x3dom.org/author/Followers/PositionDamper2D.html
 */
export const positionDamper2d: ElementHelper;

/**
 * The ScalarChaser animates transitions for single float values. Whenever the destination field
 *  receives a floating point number, it creates a transition from its current value to the newly set number.
 *  It creates a smooth transition that ends duration seconds after the last number has been received.
 * @see https://doc.x3dom.org/author/Followers/ScalarChaser.html
 */
export const scalarChaser: ElementHelper;

/**
 * The ScalarDamper animates transitions for single float values. If the value field is routed to a
 *  transparency field of a Material node, then, whenever the destination field receives a single float value,
 *  the ScalarDamper node creates a transition from its current value to the newly set value.
 * @see https://doc.x3dom.org/author/Followers/ScalarDamper.html
 */
export const scalarDamper: ElementHelper;

/**
 * The CoordinateChaser animates transitions for array of 3D vectors (e.g., the coordinates of a
 *  mesh). Whenever it receives an array of 3D vectors, the value_changed creates a transition from its
 *  current value to the newly set number. It creates a smooth transition that ends duration seconds after the
 *  last number has been received.
 * @see https://doc.x3dom.org/author/Followers/CoordinateDamper.html
 */
export const coordinateDamper: ElementHelper;

/**
 * The TexCoordDamper2D node animates transitions for an array of 2D vectors (e.g., the texture
 *  coordinates of a mesh). Whenever the destination field receives an array of 2D vectors, value begins
 *  sending an array of the same length, where each element moves from its current value towards the value at
 *  the same position in the array received.
 * @see https://doc.x3dom.org/author/Followers/TexCoordDamper2D.html
 */
export const texCoordDamper2d: ElementHelper;

/**
 * The OrientationInterpolator node interpolates among a list of rotation values specified in the keyValue field to produce an SFRotation value_changed event.
 * These rotations are absolute in object space and therefore are not cumulative.
 * The keyValue field shall contain exactly as many rotations as there are key frames in the key field.
 * An orientation represents the final position of an object after a rotation has been applied.
 * An OrientationInterpolator interpolates between two orientations by computing the shortest path on the unit sphere between the two orientations.
 * The interpolation is linear in arc length along this path. The results are undefined if the two orientations are diagonally opposite.
 * @see https://doc.x3dom.org/author/Interpolation/OrientationInterpolator.html
 */
export const orientationInterpolator: ElementHelper;

/**
 * The PositionInterpolator node linearly interpolates among a list of 3D vectors to produce an SFVec3f value_changed event. The keyValue field shall contain exactly as many values as in the key field.
 * @see https://doc.x3dom.org/author/Interpolation/PositionInterpolator.html
 */
export const positionInterpolator: ElementHelper;

/**
 * The PositionInterpolator2D node linearly interpolates among a list of 2D vectors to produce an SFVec2f value_changed event. The keyValue field shall contain exactly as many values as in the key field.
 * @see https://doc.x3dom.org/author/Interpolation/PositionInterpolator2D.html
 */
export const positionInterpolator2d: ElementHelper;

/**
 * The NormalInterpolator node interpolates among a list of normal vector sets specified by the keyValue field to produce an MFVec3f value_changed event.
 * The output vector, value_changed, shall be a set of normalized vectors.
 * Values in the keyValue field shall be of unit length.
 * The number of normals in the keyValue field shall be an integer multiple of the number of key frames in the key field.
 * That integer multiple defines how many normals will be contained in the value_changed events.
 * @see https://doc.x3dom.org/author/Interpolation/NormalInterpolator.html
 */
export const normalInterpolator: ElementHelper;

/**
 * The ColorInterpolator node interpolates among a list of MFColor key values to produce an SFColor (RGB) value_changed event.
 * The number of colours in the keyValue field shall be equal to the number of key frames in the key field.
 * A linear interpolation using the value of set_fraction as input is performed in HSV space.
 * The results are undefined when interpolating between two consecutive keys with complementary hues.
 * @see https://doc.x3dom.org/author/Interpolation/ColorInterpolator.html
 */
export const colorInterpolator: ElementHelper;

/**
 * The ScalarInterpolator node linearly interpolates among a list of SFFloat values to produce an SFFloat value_changed event.
 * This interpolator is appropriate for any parameter defined using a single floating point value.
 * @see https://doc.x3dom.org/author/Interpolation/ScalarInterpolator.html
 */
export const scalarInterpolator: ElementHelper;

/**
 * The CoordinateInterpolator node linearly interpolates among a list of MFVec3f values to produce an MFVec3f value_changed event.
 * The number of coordinates in the keyValue field shall be an integer multiple of the number of key frames in the key field.
 * That integer multiple defines how many coordinates will be contained in the value_changed events.
 * @see https://doc.x3dom.org/author/Interpolation/CoordinateInterpolator.html
 */
export const coordinateInterpolator: ElementHelper;

/**
 * The SplinePositionInterpolator node non-linearly interpolates among a list of 3D vectors to produce an SFVec3f value_changed event. The keyValue, keyVelocity, and key fields shall each have the same number of values.
 * @see https://doc.x3dom.org/author/Interpolation/SplinePositionInterpolator.html
 */
export const splinePositionInterpolator: ElementHelper;

/**
 * TimeSensor nodes generate events as time passes.
 * @see https://doc.x3dom.org/author/Time/TimeSensor.html
 */
export const timeSensor: ElementHelper;

/**
 * Anchor is a Grouping node that can contain most nodes. Clicking Anchored geometry loads content specified by the url field.
 * Loaded content completely replaces current content, if parameter is same window.
 * Hint: insert a Shape node before adding geometry or Appearance.
 * @see https://doc.x3dom.org/author/Networking/Anchor.html
 */
export const anchor: ElementHelper;

/**
 * Inline is a Grouping node that can load nodes from another X3D scene via url.
 * @see https://doc.x3dom.org/author/Networking/Inline.html
 */
export const inline: ElementHelper;

/**
 * The Fog node provides a way to simulate atmospheric effects by blending objects with the colour
 * specified by the color field based on the distances of the various objects from the viewer. The distances
 * are calculated in the coordinate space of the Fog node.
 * @see https://doc.x3dom.org/author/EnvironmentalEffects/Fog.html
 */
export const fog: ElementHelper;

/**
 * A background node that uses six static images to compose the backdrop.  For the backUrl,
 * bottomUrl, frontUrl, leftUrl, rightUrl, topUrl fields, browsers shall support the JPEG and PNG
 * (see ISO/IEC 15948) image file formats.
 * @see https://doc.x3dom.org/author/EnvironmentalEffects/Background.html
 */
export const background: ElementHelper;

/**
 * Bindable node to setup rendering and culling parameters
 * @see https://doc.x3dom.org/author/EnvironmentalEffects/Environment.html
 */
export const environment: ElementHelper;

/**
 * Viewpoint provides a specific location and direction where the user may view the scene.
 * The principalPoint extention allows to set asymmetric frustums.
 * @see https://doc.x3dom.org/author/Navigation/Viewpoint.html
 */
export const viewpoint: ElementHelper;

/**
 * The OrthoViewpoint node defines a viewpoint that provides an orthographic view of the scene.
 * An orthographic view is one in which all projectors are parallel to the projector from centerOfRotation to position.
 * @see https://doc.x3dom.org/author/Navigation/OrthoViewpoint.html
 */
export const orthoViewpoint: ElementHelper;

/**
 * The Viewfrustum node allows to define a camera position and projection utilizing a standard OpenGL projection/modelview pair.
 * @see https://doc.x3dom.org/author/Navigation/Viewfrustum.html
 */
export const viewfrustum: ElementHelper;

/**
 * NavigationInfo describes the viewing model and physical characteristics of the viewer's avatar.
 * Hint: for inspection of simple objects, usability often improves with type='EXAMINE' 'ANY' Hint: NavigationInfo types ''WALK' 'FLY'' support camera-to-object collision detection.
 * Background, Fog, NavigationInfo, TextureBackground and Viewpoint are bindable nodes.
 * @see https://doc.x3dom.org/author/Navigation/NavigationInfo.html
 */
export const navigationInfo: ElementHelper;

/**
 * Billboard is a Grouping node that can contain most nodes.
 * Content faces the user, rotating about the specified axis. Set axisOfRotation=0 0 0 to fully face the user's camera.
 * Hint: Put Billboard as close to the geometry as possible, nested inside Transform for local coordinate system.
 * Hint: don't put Viewpoint inside a Billboard.
 * Hint: insert a Shape node before adding geometry or Appearance.
 * @see https://doc.x3dom.org/author/Navigation/Billboard.html
 */
export const billboard: ElementHelper;

/**
 * Collision detects camera-to-object contact using current Viewpoint and NavigationInfo avatarSize.
 * Collision is a Grouping node that handles collision detection for its children.
 * Collision can contain a single proxy child node for substitute collision-detection geometry.
 * Note: proxy geometry is not rendered.
 * Note: PointSet, IndexedLineSet, LineSet and Text do not trigger collisions.
 * Hint: improve performance using proxy for simpler contact-calculation geometry.
 * Hint: NavigationInfo types ''WALK' 'FLY'' support camera-to-object collision detection.
 * Hint: insert a Shape node before adding geometry or Appearance.
 * @see https://doc.x3dom.org/author/Navigation/Collision.html
 */
export const collision: ElementHelper;

/**
 * LOD (Level Of Detail) uses camera-to-object distance to switch among contained child levels.
 * (Contained nodes are now called 'children' rather than 'level', for consistent naming among all GroupingNodeType nodes.)
 * LOD range values go from near to far (as child geometry gets simpler for better performance).
 * For n range values, you must have n+1 children levels! Only the currently selected children level is rendered, but all levels continue to send/receive events.
 * @see https://doc.x3dom.org/author/Navigation/LOD.html
 */
export const lod: ElementHelper;

/**
 * <dynamicLOD> node (X3DOM Navigation component).
 * @see https://doc.x3dom.org/author/Navigation/DynamicLOD.html
 */
export const dynamicLOD: ElementHelper;

/**
 * The FontStyle node defines the size, family, and style used for Text nodes, as well as the direction of the text strings and any language-specific rendering techniques used for non-English text.
 * @see https://doc.x3dom.org/author/Text/FontStyle.html
 */
export const fontStyle: ElementHelper;

/**
 * The Text node specifies a two-sided, flat text string object positioned in the Z=0 plane of the local coordinate system based on values defined in the fontStyle field.
 * Text nodes may contain multiple text strings specified using the UTF-8 encoding.
 * The text strings are stored in the order in which the text mode characters are to be produced as defined by the parameters in the FontStyle node.
 *
 * Exported as `x3dtext` to avoid colliding with the HTML/SVG `text` helper.
 * @see https://doc.x3dom.org/author/Text/Text.html
 */
export const x3dtext: ElementHelper;

/**
 * The Sound node specifies the spatial presentation of a sound in a X3D scene.
 * @see https://doc.x3dom.org/author/Sound/Sound.html
 */
export const sound: ElementHelper;

/**
 * An AudioClip node specifies audio data that can be referenced by Sound nodes.
 * @see https://doc.x3dom.org/author/Sound/AudioClip.html
 */
export const audioClip: ElementHelper;

/**
 * The TextureTransform node defines a 2D transformation that is applied to texture coordinates. This node affects the way textures coordinates are applied to the geometric surface. The transformation consists of (in order):
 * a translation; a rotation about the centre point; a non-uniform scale about the centre point.
 * @see https://doc.x3dom.org/author/Texturing/TextureTransform.html
 */
export const textureTransform: ElementHelper;

/**
 * The MatrixTextureTransform node defines a 2D transformation as a 4x4 matrix that is applied to texture coordinates.
 * This node affects the way textures coordinates are applied to the geometric surface.
 * @see https://doc.x3dom.org/author/Texturing/MatrixTextureTransform.html
 */
export const matrixTextureTransform: ElementHelper;

/**
 * TextureProperties allows fine control over a texture's application.
 * This node can be used to set the texture properties for a node with a textureProperties field.
 * A texture with a TextureProperties node will ignore the repeatS and repeatT fields on the texture.
 * @see https://doc.x3dom.org/author/Texturing/TextureProperties.html
 */
export const textureProperties: ElementHelper;

/**
 * The MultiTexture node specifies the application of several individual textures to a 3D object to achieve a more complex visual effect.
 * MultiTexture can be used as a value for the texture field in an Appearance node.
 * @see https://doc.x3dom.org/author/Texturing/MultiTexture.html
 */
export const multiTexture: ElementHelper;

/**
 * (Abstract) class for 2D Textures.
 * @see https://doc.x3dom.org/author/Texturing/Texture.html
 */
export const texture: ElementHelper;

/**
 * This extension provides the ability to dynamically render a partial scenegraph to an offscreen texture that can then be used on the geometry of a node.
 * This can be used in many different ways such as creating mirror effects, inputs to shaders etc.
 * The purpose of this component is to provide for extended visual effects, but not the complete form of offscreen rendering and buffers that would be available to lower-level rendering APIs.
 * @see https://doc.x3dom.org/author/Texturing/RenderedTexture.html
 */
export const renderedTexture: ElementHelper;

/**
 * <refinementTexture> node (X3DOM Texturing component).
 * @see https://doc.x3dom.org/author/Texturing/RefinementTexture.html
 */
export const refinementTexture: ElementHelper;

/**
 * The PixelTexture node defines a 2D image-based texture map as an explicit array of pixel values (image field) and parameters controlling tiling repetition of the texture onto geometry.
 * @see https://doc.x3dom.org/author/Texturing/PixelTexture.html
 */
export const pixelTexture: ElementHelper;

/**
 * ImageTexture maps a 2D-image file onto a geometric shape.
 * Texture maps have a 2D coordinate system (s, t) horizontal and vertical, with (s, t) values in range [0.0, 1.0] for opposite corners of the image.
 * @see https://doc.x3dom.org/author/Texturing/ImageTexture.html
 */
export const imageTexture: ElementHelper;

/**
 * The MovieTexture node defines a time dependent texture map (contained in a movie file) and parameters for controlling the movie and the texture mapping.
 * @see https://doc.x3dom.org/author/Texturing/MovieTexture.html
 */
export const movieTexture: ElementHelper;

/**
 * The TextureCoordinate node is a geometry property node that specifies a set of 2D texture coordinates used by vertex-based geometry nodes (EXAMPLE  IndexedFaceSet and ElevationGrid) to map textures to vertices.
 * @see https://doc.x3dom.org/author/Texturing/TextureCoordinate.html
 */
export const textureCoordinate: ElementHelper;

/**
 * TextureCoordinateGenerator supports the automatic generation of texture coordinates for geometric shapes.
 * @see https://doc.x3dom.org/author/Texturing/TextureCoordinateGenerator.html
 */
export const textureCoordinateGenerator: ElementHelper;

/**
 * MultiTextureCoordinate supplies multiple texture coordinates per vertex. This node can be used to set the texture coordinates for the different texture channels.
 * @see https://doc.x3dom.org/author/Texturing/MultiTextureCoordinate.html
 */
export const multiTextureCoordinate: ElementHelper;

/**
 * This is a special helper node to represent tiles for volume rendering.
 * @see https://doc.x3dom.org/author/Texturing/ImageTextureAtlas.html
 */
export const imageTextureAtlas: ElementHelper;

/**
 * The ComposedCubeMapTexture node defines a cubic environment map source as an explicit set of
 * images drawn from individual 2D texture nodes.
 * @see https://doc.x3dom.org/author/CubeMapTexturing/ComposedCubeMapTexture.html
 */
export const composedCubeMapTexture: ElementHelper;

/**
 * The GeneratedCubeMapTexture node defines a cubic environment map that sources its data from
 * internally generated images, rendered from a virtual situated perspective in the scene.
 * @see https://doc.x3dom.org/author/CubeMapTexturing/GeneratedCubeMapTexture.html
 */
export const generatedCubeMapTexture: ElementHelper;

/**
 * Node representing a uniform.
 * @see https://doc.x3dom.org/author/Shaders/Uniform.html
 */
export const uniform: ElementHelper;

/**
 * A texture reference that can be used as a child of SurfaceShader.
 * @see https://doc.x3dom.org/author/Shaders/SurfaceShaderTexture.html
 */
export const surfaceShaderTexture: ElementHelper;

/**
 * Implements the Blinn-Phong BRDF with normal mapping and a perfect specular component.
 * @see https://doc.x3dom.org/author/Shaders/CommonSurfaceShader.html
 */
export const commonSurfaceShader: ElementHelper;

/**
 * The ComposedShader node defines a shader where the individual source files are not individually
 *  programmable. All access to the shading capabilities is defined through a single interface that applies to
 *  all parts.
 * @see https://doc.x3dom.org/author/Shaders/ComposedShader.html
 */
export const composedShader: ElementHelper;

/**
 * The ShaderPart node defines the source for a single object to be used by a ComposedShader node.
 *  The source is not required to be a complete shader for all of the vertex/fragment processing.
 * @see https://doc.x3dom.org/author/Shaders/ShaderPart.html
 */
export const shaderPart: ElementHelper;

/**
 * The FloatVertexAttribute node defines a set of per-vertex single-precision floating point
 *  attributes.
 * @see https://doc.x3dom.org/author/Shaders/FloatVertexAttribute.html
 */
export const floatVertexAttribute: ElementHelper;

/**
 * <plane> node (X3DOM Geometry3D component).
 * @see https://doc.x3dom.org/author/Geometry3D/Plane.html
 */
export const plane: ElementHelper;

/**
 * The Box node specifies a rectangular parallelepiped box centred at (0, 0, 0) in the local coordinate system and aligned with the local coordinate axes. By default, the box measures 2 units in each dimension, from -1 to +1.
 * @see https://doc.x3dom.org/author/Geometry3D/Box.html
 */
export const box: ElementHelper;

/**
 * The Sphere node specifies a sphere centred at (0, 0, 0) in the local coordinate system.
 * @see https://doc.x3dom.org/author/Geometry3D/Sphere.html
 */
export const sphere: ElementHelper;

/**
 * The Torus node specifies a torus shape centred at (0, 0, 0) in the local coordinate system.
 * @see https://doc.x3dom.org/author/Geometry3D/Torus.html
 */
export const torus: ElementHelper;

/**
 * The Cone node specifies a cone which is centred in the local coordinate system and whose central axis is aligned with the local Y-axis.
 * By default, the cone has a radius of 1.0 at the bottom and a height of 2.0
 * @see https://doc.x3dom.org/author/Geometry3D/Cone.html
 */
export const cone: ElementHelper;

/**
 * The Cylinder node specifies a capped cylinder centred at (0,0,0) in the local coordinate system and with a central axis oriented along the local Y-axis.
 * By default, the cylinder is sized at "-1" to "+1" in all three dimensions.
 * @see https://doc.x3dom.org/author/Geometry3D/Cylinder.html
 */
export const cylinder: ElementHelper;

/**
 * The BinaryGeometry node can load binary data exported by AOPT.
 * @see https://doc.x3dom.org/author/Geometry3D/BinaryGeometry.html
 */
export const binaryGeometry: ElementHelper;

/**
 * The PopGeometryLevel node holds data of one refinement level for the PopGeometry node.
 * @see https://doc.x3dom.org/author/Geometry3D/PopGeometryLevel.html
 */
export const popGeometryLevel: ElementHelper;

/**
 * The PopGeometry node provides a first, experimental implementation of the POP Buffer algorithm for progressive streaming of triangular mesh data.
 * @see https://doc.x3dom.org/author/Geometry3D/PopGeometry.html
 */
export const popGeometry: ElementHelper;

/**
 * <indexedFaceSet> node (X3DOM Geometry3D component).
 * @see https://doc.x3dom.org/author/Geometry3D/IndexedFaceSet.html
 */
export const indexedFaceSet: ElementHelper;

/**
 * The BufferGeometry node can load binary data like glTF buffer.
 * @see https://doc.x3dom.org/author/Geometry3D/BufferGeometry.html
 */
export const bufferGeometry: ElementHelper;

/**
 * The BufferAccessor node is experimental.
 * @see https://doc.x3dom.org/author/Geometry3D/BufferView.html
 */
export const bufferView: ElementHelper;

/**
 * The BufferAccessor node is experimental.
 * @see https://doc.x3dom.org/author/Geometry3D/BufferAccessor.html
 */
export const bufferAccessor: ElementHelper;

/**
 * The ComposedTexture3D node defines a 3D image-based texture map as a collection of 2D texture sources at various depths and parameters controlling tiling repetition of the texture onto geometry.
 * @see https://doc.x3dom.org/author/Texturing3D/ComposedTexture3D.html
 */
export const composedTexture3d: ElementHelper;

/**
 * The ImageTexture3D node defines a texture map by specifying a single image file that contains complete 3D data and general parameters for mapping texels to geometry.
 * The texture is read from the URL specified by the url field. When the url field contains no values ([]), texturing is disabled.
 * @see https://doc.x3dom.org/author/Texturing3D/ImageTexture3D.html
 */
export const imageTexture3d: ElementHelper;

/**
 * The PixelTexture3D node defines a 3D image-based texture map as an explicit array of pixel values (image field) and parameters controlling tiling repetition of the texture onto geometry.
 * @see https://doc.x3dom.org/author/Texturing3D/PixelTexture3D.html
 */
export const pixelTexture3d: ElementHelper;

/**
 * The TextureCoordinate3D node is a geometry property node that specifies a set of 3D texture coordinates used by vertex-based geometry nodes (e.g., IndexedFaceSet and ElevationGrid) to map 3D textures to vertices.
 * @see https://doc.x3dom.org/author/Texturing3D/TextureCoordinate3D.html
 */
export const textureCoordinate3d: ElementHelper;

/**
 * <textureTransform3d> node (X3DOM Texturing3D component).
 * @see https://doc.x3dom.org/author/Texturing3D/TextureTransform3D.html
 */
export const textureTransform3d: ElementHelper;

/**
 * The TextureTransform3D node specifies a 3D transformation that is applied to texture coordinates.
 * This node affects the way texture coordinates are applied to the geometric surface.
 * The transformation consists of a transformation matrix.
 * @see https://doc.x3dom.org/author/Texturing3D/TextureTransformMatrix3D.html
 */
export const textureTransformMatrix3d: ElementHelper;

/**
 * TouchSensor tracks location and state of the pointing device, and detects when user points at
 * geometry. Hint: X3DOM, running in an HTML environment, you actually don't need this node, as you can
 * simply use HTML events (like onclick) on your nodes. However, this node is implemented to complete the
 * pointing device sensor component, and it may be useful to ensure compatibility with older X3D scene content.
 * @see https://doc.x3dom.org/author/PointingDeviceSensor/TouchSensor.html
 */
export const touchSensor: ElementHelper;

/**
 * PlaneSensor converts pointing device motion into 2D translation, parallel to the local Z=0 plane.
 * Hint: You can constrain translation output to one axis by setting the respective minPosition and  maxPosition
 * members to equal values for that axis.
 * @see https://doc.x3dom.org/author/PointingDeviceSensor/PlaneSensor.html
 */
export const planeSensor: ElementHelper;

/**
 * SphereSensor converts pointing device motion into a spherical rotation around the origin of the
 * local coordinate system.
 * @see https://doc.x3dom.org/author/PointingDeviceSensor/SphereSensor.html
 */
export const sphereSensor: ElementHelper;

/**
 * The CylinderSensor node converts pointer motion (for example, from a mouse) into rotation values,
 * using an invisible cylinder of infinite height, aligned with local Y-axis.
 * @see https://doc.x3dom.org/author/PointingDeviceSensor/CylinderSensor.html
 */
export const cylinderSensor: ElementHelper;

/**
 * filters Boolean events, allowing for selective routing of TRUE or FALSE values and negation.
 * @see https://doc.x3dom.org/author/EventUtilities/BooleanFilter.html
 */
export const booleanFilter: ElementHelper;

/**
 * BooleanSequencer generates sequential value_changed events selected from the keyValue field when driven from a TimeSensor clock. Among other actions, it can enable/disable lights and sensors, or bind/unbind viewpoints and other X3DBindableNode nodes using set_bind events.
 * @see https://doc.x3dom.org/author/EventUtilities/BooleanSequencer.html
 */
export const booleanSequencer: ElementHelper;

/**
 * stores and toggles boolean value
 * @see https://doc.x3dom.org/author/EventUtilities/BooleanToggle.html
 */
export const booleanToggle: ElementHelper;

/**
 * generates true Boolean events upon receiving time events
 * @see https://doc.x3dom.org/author/EventUtilities/BooleanTrigger.html
 */
export const booleanTrigger: ElementHelper;

/**
 * The IntegerSequencer node generates sequential discrete value_changed events selected from the keyValue field in response to each set_fraction, next, or previous event.
 * @see https://doc.x3dom.org/author/EventUtilities/IntegerSequencer.html
 */
export const integerSequencer: ElementHelper;

/**
 * generates Integer events upon receiving Boolean events
 * @see https://doc.x3dom.org/author/EventUtilities/IntegerTrigger.html
 */
export const integerTrigger: ElementHelper;

/**
 * generates Time events upon receiving Boolean events
 * @see https://doc.x3dom.org/author/EventUtilities/TimeTrigger.html
 */
export const timeTrigger: ElementHelper;

/**
 * The GeoCoordinate node specifies a list of coordinates in a spatial reference frame.
 * It is used in the coord field of vertex-based geometry nodes including IndexedFaceSet, IndexedLineSet, and PointSet.
 * @see https://doc.x3dom.org/author/Geospatial/GeoCoordinate.html
 */
export const geoCoordinate: ElementHelper;

/**
 * The GeoElevationGrid node specifies a uniform grid of elevation values within some spatial reference frame.
 * These are then transparently transformed into a geocentric, curved-earth representation.
 * @see https://doc.x3dom.org/author/Geospatial/GeoElevationGrid.html
 */
export const geoElevationGrid: ElementHelper;

/**
 * The GeoLOD node provides a terrain-specialized form of the LOD node.
 * It is a grouping node that specifies two different levels of detail for an object using a tree structure, where 0 to 4 children can be specified, and also efficiently manages the loading and unloading of these levels of detail.
 * @see https://doc.x3dom.org/author/Geospatial/GeoLOD.html
 */
export const geoLOD: ElementHelper;

/**
 * The GeoLocation node provides the ability to geo-reference any standard X3D model.
 * That is, to take an ordinary X3D model, contained within the children of the node, and to specify its geospatial location.
 * This node is a grouping node that can be thought of as a Transform node.
 * However, the GeoLocation node specifies an absolute location, not a relative one, so content developers should not nest GeoLocation nodes within each other.
 * @see https://doc.x3dom.org/author/Geospatial/GeoLocation.html
 */
export const geoLocation: ElementHelper;

/**
 * The GeoMetadata node supports the specification of metadata describing any number of geospatial nodes.
 * This is similar to a WorldInfo node, but specifically for describing geospatial information.
 * @see https://doc.x3dom.org/author/Geospatial/GeoMetadata.html
 */
export const geoMetadata: ElementHelper;

/**
 * The GeoOrigin node defines an absolute geospatial location and an implicit local coordinate frame against which geometry is referenced.
 * This node is used to translate from geographical coordinates into a local Cartesian coordinate system which can be managed by the X3D browser. This node is deprecated as of X3D 3.3
 * @see https://doc.x3dom.org/author/Geospatial/GeoOrigin.html
 */
export const geoOrigin: ElementHelper;

/**
 * The GeoPositionInterpolator node provides an interpolator capability where key values are specified in geographic coordinates and the interpolation is performed within the specified spatial reference frame.
 * @see https://doc.x3dom.org/author/Geospatial/GeoPositionInterpolator.html
 */
export const geoPositionInterpolator: ElementHelper;

/**
 * The GeoTransform node is a grouping node that defines a coordinate system for its children to support the translation and orientation of geometry built using GeoCoordinate nodes within the local world coordinate system.
 * The X-Z plane of a GeoTransform coordinate system is tangent to the ellipsoid of the spatial reference frame at the location specified by the geoCenter field.
 * @see https://doc.x3dom.org/author/Geospatial/GeoTransform.html
 */
export const geoTransform: ElementHelper;

/**
 * The GeoViewpoint node allows the specification of a viewpoint in terms of a geospatial coordinate.
 * This node can be used wherever a Viewpoint node can be used and can be combined with Viewpoint nodes in the same scene.
 * @see https://doc.x3dom.org/author/Geospatial/GeoViewpoint.html
 */
export const geoViewpoint: ElementHelper;

/**
 * Add a class description here.
 * @see https://doc.x3dom.org/author/Layout/ScreenGroup.html
 */
export const screenGroup: ElementHelper;

/**
 * The Arc node specifies a linear circular arc whose center is at (0,0) and whose angles are
 *  measured starting at the positive x-axis and sweeping towards the positive y-axis.
 * @see https://doc.x3dom.org/author/Geometry2D/Arc2D.html
 */
export const arc2d: ElementHelper;

/**
 * The ArcClose node specifies a portion of a circle whose center is at (0,0) and whose angles are
 *  measured starting at the positive x-axis and sweeping towards the positive y-axis.
 * @see https://doc.x3dom.org/author/Geometry2D/ArcClose2D.html
 */
export const arcClose2d: ElementHelper;

/**
 * The Circle2D node specifies a circle centred at (0,0) in the local 2D coordinate system.
 * @see https://doc.x3dom.org/author/Geometry2D/Circle2D.html
 */
export const circle2d: ElementHelper;

/**
 * The Disk2D node specifies a circular disk which is centred at (0, 0) in the local coordinate
 *  system. If innerRadius is equal to outerRadius, a solid circular line shall be drawn using the current line
 *  properties. If innerRadius is zero, the Disk2D is completely filled. Otherwise, the area within the
 *  innerRadius forms a hole in the Disk2D.
 * @see https://doc.x3dom.org/author/Geometry2D/Disk2D.html
 */
export const disk2d: ElementHelper;

/**
 * The Polyline2D node specifies a series of contiguous line segments in the local 2D coordinate
 *  system connecting the specified vertices.
 * @see https://doc.x3dom.org/author/Geometry2D/Polyline2D.html
 */
export const polyline2d: ElementHelper;

/**
 * The Polyline2D node specifies a set of vertices in the local 2D coordinate system at each of which
 *  is displayed a point.
 * @see https://doc.x3dom.org/author/Geometry2D/Polypoint2D.html
 */
export const polypoint2d: ElementHelper;

/**
 * The Rectangle2D node specifies a rectangle centred at (0, 0) in the current local 2D coordinate
 *  system and aligned with the local coordinate axes. By default, the box measures 2 units in each dimension,
 *  from -1 to +1.
 * @see https://doc.x3dom.org/author/Geometry2D/Rectangle2D.html
 */
export const rectangle2d: ElementHelper;

/**
 * The TriangleSet2D node specifies a set of triangles in the local 2D coordinate system.
 * @see https://doc.x3dom.org/author/Geometry2D/TriangleSet2D.html
 */
export const triangleSet2d: ElementHelper;

/**
 * The BlendedVolumeStyle node allows to blend the parent volume data with a second specified volume data using a weight function.
 * @see https://doc.x3dom.org/author/VolumeRendering/BlendedVolumeStyle.html
 */
export const blendedVolumeStyle: ElementHelper;

/**
 * The BoundaryEnhancementVolumeStyle node specifies that the boundaries of the volume data shall be enhanced. The rendering is performed based on the gradient magnitude.
 * Areas where density varies are made more visible than areas of constant density.
 * @see https://doc.x3dom.org/author/VolumeRendering/BoundaryEnhancementVolumeStyle.html
 */
export const boundaryEnhancementVolumeStyle: ElementHelper;

/**
 * The CartoonVolumeStyle node specifies that the associated volume data shall be rendered with a cartoon style non-photorealistic rendering.
 * The cartoon styles uses two colors the rendering will depend on the local surface normals and the view direction.
 * @see https://doc.x3dom.org/author/VolumeRendering/CartoonVolumeStyle.html
 */
export const cartoonVolumeStyle: ElementHelper;

/**
 * The ComposedVolumeStyle node is used to compose multiple rendering styles into a single-rendering pass.
 * The styles are applied in the same order they are defined on the scene tree.
 * @see https://doc.x3dom.org/author/VolumeRendering/ComposedVolumeStyle.html
 */
export const composedVolumeStyle: ElementHelper;

/**
 * <edgeEnhancementVolumeStyle> node (X3DOM VolumeRendering component).
 * @see https://doc.x3dom.org/author/VolumeRendering/EdgeEnhancementVolumeStyle.html
 */
export const edgeEnhancementVolumeStyle: ElementHelper;

/**
 * The IsoSurfaceVolumeData node specifies one or more surfaces to be extracted from the volume data.
 * @see https://doc.x3dom.org/author/VolumeRendering/IsoSurfaceVolumeData.html
 */
export const isoSurfaceVolumeData: ElementHelper;

/**
 * The MPRVolumeStyle node renders a multiplanar reconstruction of the assocciated volume data.
 * @see https://doc.x3dom.org/author/VolumeRendering/MPRVolumeStyle.html
 */
export const mPRVolumeStyle: ElementHelper;

/**
 * class for defining an arbitrary plane for the MPRVolumeStyle.
 * @see https://doc.x3dom.org/author/VolumeRendering/MPRPlane.html
 */
export const mPRPlane: ElementHelper;

/**
 * <opacityMapVolumeStyle> node (X3DOM VolumeRendering component).
 * @see https://doc.x3dom.org/author/VolumeRendering/OpacityMapVolumeStyle.html
 */
export const opacityMapVolumeStyle: ElementHelper;

/**
 * The ProjectionVolumeStyle node generates an output color based on the voxel data values traversed by a ray following the view direction.
 * @see https://doc.x3dom.org/author/VolumeRendering/ProjectionVolumeStyle.html
 */
export const projectionVolumeStyle: ElementHelper;

/**
 * The SegmentedVolumeData node specifies a segmented volume data set. Each segment can be rendered with a different volume rendering style.
 * @see https://doc.x3dom.org/author/VolumeRendering/SegmentedVolumeData.html
 */
export const segmentedVolumeData: ElementHelper;

/**
 * The ShadedVolumeStyle node applies the Blinn-Phong illumination model to the assocciated volume data.
 * The light and fog parameters are obtained from the parent Appearence node.
 * @see https://doc.x3dom.org/author/VolumeRendering/ShadedVolumeStyle.html
 */
export const shadedVolumeStyle: ElementHelper;

/**
 * The SilhouetteEnhancementVolumeStyle node specifies that silhouettes of the assocciated volume data are going to be enhanced.
 * Voxels opacity are modified based on their normals orientation relative to the view direction. When the normal orientation is perpendicular towards the view direction,
 * voxels are darkened, whereas when it is parallel towards the view direction, the opacity is not enhanced.
 * @see https://doc.x3dom.org/author/VolumeRendering/SilhouetteEnhancementVolumeStyle.html
 */
export const silhouetteEnhancementVolumeStyle: ElementHelper;

/**
 * NYI!!
 * @see https://doc.x3dom.org/author/VolumeRendering/StippleVolumeStyle.html
 */
export const stippleVolumeStyle: ElementHelper;

/**
 * The ToneMappedVolumeStyle node specifies that the associated volume rendering data is going to be rendered following the Gooch et. al. shading model.
 * Two colors are used: warm and cool to shade the volume data based on the light direction.
 * @see https://doc.x3dom.org/author/VolumeRendering/ToneMappedVolumeStyle.html
 */
export const toneMappedVolumeStyle: ElementHelper;

/**
 * <radarVolumeStyle> node (X3DOM VolumeRendering component).
 * @see https://doc.x3dom.org/author/VolumeRendering/RadarVolumeStyle.html
 */
export const radarVolumeStyle: ElementHelper;

/**
 * The VolumeData node specifies a non-segmented volume data to be rendered with a volume rendering style.
 * @see https://doc.x3dom.org/author/VolumeRendering/VolumeData.html
 */
export const volumeData: ElementHelper;

/**
 * The IndexedQuadSet node represents a 3D shape composed of a collection of individual
 * quadrilaterals (quads).
 * @see https://doc.x3dom.org/author/CADGeometry/IndexedQuadSet.html
 */
export const indexedQuadSet: ElementHelper;

/**
 * The QuadSet node represents a 3D shape that represents a collection of individual planar
 * quadrilaterals.
 * @see https://doc.x3dom.org/author/CADGeometry/QuadSet.html
 */
export const quadSet: ElementHelper;

/**
 * The CADLayer node defines a hierarchy of nodes used for showing layer structure for the CAD model.
 * @see https://doc.x3dom.org/author/CADGeometry/CADLayer.html
 */
export const cADLayer: ElementHelper;

/**
 * The CADAssembly node holds a set of assemblies or parts grouped together.
 * @see https://doc.x3dom.org/author/CADGeometry/CADAssembly.html
 */
export const cADAssembly: ElementHelper;

/**
 * The CADPart node is a grouping node that defines a coordinate system for its children that is
 * relative to the coordinate systems of its ancestors.
 * @see https://doc.x3dom.org/author/CADGeometry/CADPart.html
 */
export const cADPart: ElementHelper;

/**
 * The CADFace node holds the geometry representing a face of a part.
 * @see https://doc.x3dom.org/author/CADGeometry/CADFace.html
 */
export const cADFace: ElementHelper;

/**
 * The Patch node is used by the BVHRefiner.
 * @see https://doc.x3dom.org/author/BVHRefiner/Patch.html
 */
export const patch: ElementHelper;

/**
 * The node handles wmts conform datasets like e.g. terrain-data, city-data, point-clouds etc.
 * @see https://doc.x3dom.org/author/BVHRefiner/BVHRefiner.html
 */
export const bVHRefiner: ElementHelper;

/**
 * Describes a snout shape
 * @see https://doc.x3dom.org/author/Geometry3DExt/Snout.html
 */
export const snout: ElementHelper;

/**
 * <dish> node (X3DOM Geometry3DExt component).
 * @see https://doc.x3dom.org/author/Geometry3DExt/Dish.html
 */
export const dish: ElementHelper;

/**
 * Describes a pyramid shape.
 * @see https://doc.x3dom.org/author/Geometry3DExt/Pyramid.html
 */
export const pyramid: ElementHelper;

/**
 * Describes a rectangular torus shape.
 * @see https://doc.x3dom.org/author/Geometry3DExt/RectangularTorus.html
 */
export const rectangularTorus: ElementHelper;

/**
 * Describes a sloped cylinder shape
 * @see https://doc.x3dom.org/author/Geometry3DExt/SlopedCylinder.html
 */
export const slopedCylinder: ElementHelper;

/**
 * This node describes a nozzle shape for a pipe.
 * @see https://doc.x3dom.org/author/Geometry3DExt/Nozzle.html
 */
export const nozzle: ElementHelper;

/**
 * Describes a SolidOfRevolution shape.
 * @see https://doc.x3dom.org/author/Geometry3DExt/SolidOfRevolution.html
 */
export const solidOfRevolution: ElementHelper;

/**
 * Describes a sphere segment shape.
 * @see https://doc.x3dom.org/author/Geometry3DExt/SphereSegment.html
 */
export const sphereSegment: ElementHelper;

/**
 * The ElevationGrid node specifies a uniform rectangular grid of varying height in the Y=0 plane of the local coordinate system.
 * The geometry is described by a scalar array of height values that specify the height of a surface above each point of the grid.
 * The xDimension and zDimension fields indicate the number of elements of the grid height array in the X and Z directions.
 * Both xDimension and zDimension shall be greater than or equal to zero.
 * If either the xDimension or the zDimension is less than two, the ElevationGrid contains no quadrilaterals.
 * The vertex locations for the rectangles are defined by the height field and the xSpacing and zSpacing fields
 * @see https://doc.x3dom.org/author/Geometry3DExt/ElevationGrid.html
 */
export const elevationGrid: ElementHelper;

/**
 * The Extrusion node specifies geometric shapes based on a two dimensional cross-section extruded along a three dimensional spine in the local coordinate system. The cross-section can be scaled and rotated at each spine point to produce a wide variety of shapes.
 * @see https://doc.x3dom.org/author/Geometry3DExt/Extrusion.html
 */
export const extrusion: ElementHelper;

/**
 * In some cases, the application may need to be able to identify specific groups of vertices within an HAnimSegment.
 * It may also require "hints" as to the direction in which each vertex should move. That information is stored in a node called an HAnimDisplacer.
 * The HAnimDisplacers for a particular HAnimSegment are stored in the displacers field of that HAnimSegment.
 * @see https://doc.x3dom.org/author/H-Anim/HAnimDisplacer.html
 */
export const hAnimDisplacer: ElementHelper;

/**
 * Each joint in the body is represented by an HAnimJoint node, which is used to define the relationship of each body segment to its immediate parent.
 * An HAnimJoint may only be a child of another HAnimJoint node or a child within the skeleton field in the case of the HAnimJoint used as a humanoid root (i.e., an HAnimJoint may not be a child of an HAnimSegment).
 * The HAnimJoint node is also used to store other joint-specific information. In particular, a joint name is provided so that applications can identify each HAnimJoint node at run-time.
 * The HAnimJoint node may contain hints for inverse-kinematics systems that wish to control the H-Anim figure.
 * These hints include the upper and lower joint limits, the orientation of the joint limits, and a stiffness/resistance value.
 * @see https://doc.x3dom.org/author/H-Anim/HAnimJoint.html
 */
export const hAnimJoint: ElementHelper;

/**
 * Each body segment is stored in an HAnimSegment node.
 * The HAnimSegment node is a grouping node that will typically contain either a number of Shape nodes or perhaps Transform nodes that position the body part within its coordinate system.
 * @see https://doc.x3dom.org/author/H-Anim/HAnimSegment.html
 */
export const hAnimSegment: ElementHelper;

/**
 * An HAnimSite node serves three purposes. The first is to define an "end effecter" location that can be used by an inverse kinematics system.
 * The second is to define an attachment point for accessories such as jewelry and clothing.
 * The third is to define a location for a virtual camera in the reference frame of an HAnimSegment (such as a view "through the eyes" of the humanoid for use in multi-user worlds).
 * @see https://doc.x3dom.org/author/H-Anim/HAnimSite.html
 */
export const hAnimSite: ElementHelper;

/**
 * The HAnimHumanoid node is used to store human-readable data such as author and copyright information, as well as to store references to the HAnimJoint, HAnimSegment, and HAnimSite nodes in addition to serving as a container for the entire humanoid.
 * Thus, it serves as a central node for moving the humanoid through its environment.
 * @see https://doc.x3dom.org/author/H-Anim/HAnimHumanoid.html
 */
export const hAnimHumanoid: ElementHelper;

/**
 * The NurbsPatchSurface node is a contiguous NURBS surface patch.
 * @see https://doc.x3dom.org/author/NURBS/NurbsPatchSurface.html
 */
export const nurbsPatchSurface: ElementHelper;

/**
 * The NurbsCurve node is a geometry node defining a parametric curve in 3D space.
 * @see https://doc.x3dom.org/author/NURBS/NurbsCurve.html
 */
export const nurbsCurve: ElementHelper;

/**
 * NurbsPositionInterpolator describes a 3D NURBS curve.
 * @see https://doc.x3dom.org/author/NURBS/NurbsPositionInterpolator.html
 */
export const nurbsPositionInterpolator: ElementHelper;

/**
 * NurbsOrientationInterpolator describes a 3D NURBS curve.
 * @see https://doc.x3dom.org/author/NURBS/NurbsOrientationInterpolator.html
 */
export const nurbsOrientationInterpolator: ElementHelper;

/**
 * NurbsPositionInterpolator describes a 3D NURBS curve.
 * @see https://doc.x3dom.org/author/NURBS/NurbsSurfaceInterpolator.html
 */
export const nurbsSurfaceInterpolator: ElementHelper;

/**
 * The NurbsCurve2D node defines a trimming segment that is part of a trimming contour
 *  in the u,v domain of the surface. NurbsCurve2D nodes are used as children of the Contour2D group.
 * @see https://doc.x3dom.org/author/NURBS/NurbsCurve2D.html
 */
export const nurbsCurve2d: ElementHelper;

/**
 * The NurbsTrimmedSurface node defines a NURBS surface that is trimmed by a set of trimming loops.
 * @see https://doc.x3dom.org/author/NURBS/NurbsTrimmedSurface.html
 */
export const nurbsTrimmedSurface: ElementHelper;

/**
 * The ContourPolyline2D node defines a piecewise linear curve segment as a part of a
 *  trimming contour in the u,v domain of a surface.
 * @see https://doc.x3dom.org/author/NURBS/ContourPolyline2D.html
 */
export const contourPolyline2d: ElementHelper;

/**
 * The Contour2D node groups a set of curve segments to a composite contour. The children form a closed loop.
 *  The 2D coordinates used by the node shall be interpreted to lie in the (u, v) coordinate space defined by the NURBS surface.
 * @see https://doc.x3dom.org/author/NURBS/Contour2D.html
 */
export const contour2d: ElementHelper;
