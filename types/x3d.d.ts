/**
 * X3D tag helpers (concrete nodes supported by X3DOM).
 *
 * Note: Some X3D node names overlap with HTML/SVG tags (e.g. `param`, `text`).
 * This library exports those with an `x3d`-prefix (e.g. `x3dparam`, `x3dtext`).
 *
 * Descriptions are sourced from the X3DOM project’s node JSDoc (when available) and
 * augmented with @see links to the official X3DOM docs pages.
 */

export type X3DNumber = number | string;
export type X3DBool = boolean | string;
export type X3DVec2 = string | [X3DNumber, X3DNumber] | X3DNumber[];
export type X3DVec3 = string | [X3DNumber, X3DNumber, X3DNumber] | X3DNumber[];
export type X3DVec4 = string | [X3DNumber, X3DNumber, X3DNumber, X3DNumber] | X3DNumber[];
export type X3DColor = string | [X3DNumber, X3DNumber, X3DNumber] | X3DNumber[];
export type X3DColorRGBA = string | [X3DNumber, X3DNumber, X3DNumber, X3DNumber] | X3DNumber[];
export type X3DRotation = string | [X3DNumber, X3DNumber, X3DNumber, X3DNumber] | X3DNumber[];
export type X3DMatrix4 = string | X3DNumber[];

export type X3DProps = Record<string, any>;
export type X3DVNode<P extends X3DProps = X3DProps> = [tag: string, props: P, ...children: any[]];
export type ElementHelper<P extends X3DProps = X3DProps> = {
  (props: P, ...children: any[]): X3DVNode<P>;
  (...children: any[]): X3DVNode<P>;
};

/**
 * The <x3d> element is the top-level container for an X3D scene.
 * @see https://doc.x3dom.org/author/Core/X3D.html
 */
export const x3d: ElementHelper;

export interface MetadataBooleanProps extends X3DProps {
  value?: any;
}

/**
 * The metadata provided by this node is contained in the Boolean values of the value field.
 * @see https://doc.x3dom.org/author/Core/MetadataBoolean.html
 */
export const metadataboolean: ElementHelper<MetadataBooleanProps>;

export interface MetadataDoubleProps extends X3DProps {
  value?: string | X3DNumber[];
}

/**
 * The metadata provided by this node is contained in the double-precision floating point numbers of
 * the value field.
 * @see https://doc.x3dom.org/author/Core/MetadataDouble.html
 */
export const metadatadouble: ElementHelper<MetadataDoubleProps>;

export interface MetadataFloatProps extends X3DProps {
  value?: string | X3DNumber[];
}

/**
 * The metadata provided by this node is contained in the single-precision floating point numbers of
 * the value field.
 * @see https://doc.x3dom.org/author/Core/MetadataFloat.html
 */
export const metadatafloat: ElementHelper<MetadataFloatProps>;

export interface MetadataIntegerProps extends X3DProps {
  value?: string | X3DNumber[];
}

/**
 * The metadata provided by this node is contained in the integers of the value field.
 * @see https://doc.x3dom.org/author/Core/MetadataInteger.html
 */
export const metadatainteger: ElementHelper<MetadataIntegerProps>;

export interface MetadataSetProps extends X3DProps {
}

/**
 * The metadata provided by this node is contained in the metadata nodes of the value field.
 * @see https://doc.x3dom.org/author/Core/MetadataSet.html
 */
export const metadataset: ElementHelper<MetadataSetProps>;

export interface MetadataStringProps extends X3DProps {
  value?: string | string[];
}

/**
 * The metadata provided by this node is contained in the strings of the value field.
 * @see https://doc.x3dom.org/author/Core/MetadataString.html
 */
export const metadatastring: ElementHelper<MetadataStringProps>;

export interface FieldProps extends X3DProps {
  name?: string;
  type?: string;
  value?: string;
}

/**
 * Class represents a field of a node containing name, type and value
 * @see https://doc.x3dom.org/author/Core/Field.html
 */
export const field: ElementHelper<FieldProps>;

export interface WorldInfoProps extends X3DProps {
  info?: string | string[];
  title?: string;
}

/**
 * The WorldInfo node contains information about the world. This node is strictly for documentation
 * purposes and has no effect on the visual appearance or behaviour of the world.
 * @see https://doc.x3dom.org/author/Core/WorldInfo.html
 */
export const worldinfo: ElementHelper<WorldInfoProps>;

export interface ParamProps extends X3DProps {
}

/**
 * <param> node (X3DOM Core component).
 *
 * Exported as `x3dparam` to avoid colliding with the HTML/SVG `param` helper.
 * @see https://doc.x3dom.org/author/Core/Param.html
 */
export const x3dparam: ElementHelper<ParamProps>;

export interface SwitchProps extends X3DProps {
  whichChoice?: X3DNumber;
}

/**
 * The Switch grouping node traverses zero or one of the nodes specified in the children field.
 * All nodes under a Switch continue to receive and send events regardless of the value of whichChoice.
 * For example, if an active TimeSensor is contained within an inactive choice of an Switch, the TimeSensor sends events regardless of the Switch's state.
 *
 * Exported as `x3dswitch` to avoid colliding with the HTML/SVG `switch` helper.
 * @see https://doc.x3dom.org/author/Grouping/Switch.html
 */
export const x3dswitch: ElementHelper<SwitchProps>;

export interface TransformProps extends X3DProps {
  center?: X3DVec3;
  translation?: X3DVec3;
  rotation?: X3DRotation;
  scale?: X3DVec3;
  scaleOrientation?: X3DRotation;
}

/**
 * The Transform node is a grouping node that defines a coordinate system for its children that is relative to the coordinate systems of its ancestors.
 * The translation, rotation, scale, scaleOrientation and center fields define a geometric 3D transformation.
 * @see https://doc.x3dom.org/author/Grouping/Transform.html
 */
export const transform: ElementHelper<TransformProps>;

export interface MatrixTransformProps extends X3DProps {
  matrix?: X3DMatrix4;
}

/**
 * The MatrixTransform node is a grouping node that defines a coordinate system for its children that is relative to the coordinate systems of its ancestors.
 * The transformation is given as a matrix.
 * @see https://doc.x3dom.org/author/Grouping/MatrixTransform.html
 */
export const matrixtransform: ElementHelper<MatrixTransformProps>;

export interface GroupProps extends X3DProps {
}

/**
 * A Group node contains children nodes without introducing a new transformation.
 * It is equivalent to a Transform node containing an identity transform.
 * @see https://doc.x3dom.org/author/Grouping/Group.html
 */
export const group: ElementHelper<GroupProps>;

export interface BlockProps extends X3DProps {
  nameSpaceName?: string | string[];
}

/**
 * <block> node (X3DOM Grouping component).
 * @see https://doc.x3dom.org/author/Grouping/Block.html
 */
export const block: ElementHelper<BlockProps>;

export interface StaticGroupProps extends X3DProps {
  debug?: X3DBool;
  showDebugBoxVolumes?: X3DBool;
  bvhType?: string;
  maxObjectsPerNode?: X3DNumber;
  maxDepth?: X3DNumber;
  minRelativeBBoxSize?: X3DNumber;
}

/**
 * The StaticGroup node contains children nodes which cannot be modified.
 * StaticGroup children are guaranteed to not change, send events, receive events or contain any USE references outside the StaticGroup.
 * This allows the browser to optimize this content for faster rendering and less memory usage.
 * @see https://doc.x3dom.org/author/Grouping/StaticGroup.html
 */
export const staticgroup: ElementHelper<StaticGroupProps>;

export interface RemoteSelectionGroupProps extends X3DProps {
  url?: string | string[];
  label?: string | string[];
  maxRenderedIds?: X3DNumber;
  reconnect?: X3DBool;
  scaleRenderedIdsOnMove?: X3DNumber;
  enableCulling?: X3DBool;
  invisibleNodes?: string | string[];
}

/**
 * The RemoteSelectionGroup node uses a WebSocket connection to request the results of a a  side
 *  culling.
 * @see https://doc.x3dom.org/author/Grouping/RemoteSelectionGroup.html
 */
export const remoteselectiongroup: ElementHelper<RemoteSelectionGroupProps>;

export interface SceneProps extends X3DProps {
  pickMode?: string;
  doPickPass?: X3DBool;
  shadowObjectIdMapping?: string;
}

/**
 * The scene node wraps the x3d scene.
 * @see https://doc.x3dom.org/author/Grouping/Scene.html
 */
export const scene: ElementHelper<SceneProps>;

export interface MeshProps extends X3DProps {
  primType?: string;
  index?: string | X3DNumber[];
}

/**
 * This is an experimental WebSG geo node
 * @see https://doc.x3dom.org/author/Rendering/Mesh.html
 */
export const mesh: ElementHelper<MeshProps>;

export interface PointSetProps extends X3DProps {
}

/**
 * PointSet is a node that contains a set of colored 3D points, represented by contained Color and Coordinate nodes.
 * Color values or a Material emissiveColor is used to draw lines and points. Hint: use a different color (or emissiveColor) than the background color.
 * Hint: insert a Shape node before adding geometry or Appearance. You can also substitute a type-matched ProtoInstance for content.
 * @see https://doc.x3dom.org/author/Rendering/PointSet.html
 */
export const pointset: ElementHelper<PointSetProps>;

export interface LineSetProps extends X3DProps {
  vertexCount?: string | X3DNumber[];
}

/**
 * LineSet is a geometry node that can contain a Color node and a Coordinate node.
 * Color values or a Material emissiveColor is used to draw lines and points.
 * Lines are not lit, are not texture-mapped, and do not participate in collision detection.
 * Hint: use a different color (or emissiveColor) than the background color.
 * Hint: if rendering Coordinate points originally defined for an IndexedFaceSet, index values may need to repeat each initial vertex to close each polygon outline.
 * Hint: insert a Shape node before adding geometry or Appearance.
 * @see https://doc.x3dom.org/author/Rendering/LineSet.html
 */
export const lineset: ElementHelper<LineSetProps>;

export interface IndexedLineSetProps extends X3DProps {
  colorPerVertex?: X3DBool;
  coordIndex?: string | X3DNumber[];
  colorIndex?: string | X3DNumber[];
}

/**
 * IndexedLineSet is a geometry node that can contain a Color node and a Coordinate node.
 * Color values or a Material emissiveColor is used to draw lines and points. Lines are not lit, are not texture-mapped, and do not participate in collision detection.
 * Hint: use a different color (or emissiveColor) than the background color.
 * Hint: if rendering Coordinate points originally defined for an IndexedFaceSet, index values may need to repeat each initial vertex to close each polygon outline.
 * Hint: insert a Shape node before adding geometry or Appearance. You can also substitute a type-matched ProtoInstance for content.
 * @see https://doc.x3dom.org/author/Rendering/IndexedLineSet.html
 */
export const indexedlineset: ElementHelper<IndexedLineSetProps>;

export interface IndexedTriangleSetProps extends X3DProps {
  index?: string | X3DNumber[];
}

/**
 * IndexedTriangleSet is a geometry node that can contain a Color, Coordinate, Normal and TextureCoordinate node.
 * Hint: insert a Shape node before adding geometry or Appearance.
 * You can also substitute a type-matched ProtoInstance for content.
 * @see https://doc.x3dom.org/author/Rendering/IndexedTriangleSet.html
 */
export const indexedtriangleset: ElementHelper<IndexedTriangleSetProps>;

export interface IndexedTriangleStripSetProps extends X3DProps {
  index?: string | X3DNumber[];
}

/**
 * IndexedTriangleStripSet is a geometry node that can contain a Color, Coordinate, Normal and TextureCoordinate node.
 * Hint: insert a Shape node before adding geometry or Appearance. You can also substitute a type-matched ProtoInstance for content.
 * @see https://doc.x3dom.org/author/Rendering/IndexedTriangleStripSet.html
 */
export const indexedtrianglestripset: ElementHelper<IndexedTriangleStripSetProps>;

export interface TriangleSetProps extends X3DProps {
}

/**
 * TriangleSet is a geometry node that can contain a Color, Coordinate, Normal and TextureCoordinate node.
 * Hint: insert a Shape node before adding geometry or Appearance.
 * You can also substitute a type-matched ProtoInstance for content.
 * @see https://doc.x3dom.org/author/Rendering/TriangleSet.html
 */
export const triangleset: ElementHelper<TriangleSetProps>;

export interface CoordinateProps extends X3DProps {
  point?: string | X3DVec3[];
}

/**
 * Coordinate builds geometry using a set of 3D coordinates.
 * Coordinate is used by IndexedFaceSet, IndexedLineSet, LineSet and PointSet.
 * @see https://doc.x3dom.org/author/Rendering/Coordinate.html
 */
export const coordinate: ElementHelper<CoordinateProps>;

export interface CoordinateDoubleProps extends X3DProps {
  point?: any;
}

/**
 * Coordinate builds geometry using a set of double precision 3D coordinates.
 * X3DCoordinateNode is used by IndexedFaceSet, IndexedLineSet, LineSet and PointSet.
 * @see https://doc.x3dom.org/author/Nurbs/CoordinateDouble.html
 */
export const coordinatedouble: ElementHelper<CoordinateDoubleProps>;

export interface NormalProps extends X3DProps {
  vector?: string | X3DVec3[];
}

/**
 * Normal is a set of 3D surface-normal vectors Normal values are optional perpendicular directions, used per-polygon or per-vertex for lighting and shading.
 * Hint: used by IndexedFaceSet and ElevationGrid.
 * @see https://doc.x3dom.org/author/Rendering/Normal.html
 */
export const normal: ElementHelper<NormalProps>;

export interface ColorProps extends X3DProps {
  color?: string | X3DColor[];
}

/**
 * This node defines a set of RGB colors to be used in the fields of another node.
 * Color nodes are only used to specify multiple colours for a single geometric shape, such as colours for the faces or vertices of an IndexedFaceSet.
 * A Material node is used to specify the overall material parameters of lit geometry.
 * If both a Material node and a Color node are specified for a geometric shape, the colours shall replace the diffuse component of the material.
 * RGB or RGBA textures take precedence over colours; specifying both an RGB or RGBA texture and a Color node for geometric shape will result in the Color node being ignored.
 * @see https://doc.x3dom.org/author/Rendering/Color.html
 */
export const color: ElementHelper<ColorProps>;

export interface ColorRGBAProps extends X3DProps {
  color?: string | X3DColorRGBA[];
}

/**
 * This node defines a set of RGBA colours to be used in the fields of another node.
 * RGBA color nodes are only used to specify multiple colours with alpha for a single geometric shape, such as colours for the faces or vertices of an IndexedFaceSet.
 * A Material node is used to specify the overall material parameters of lit geometry.
 * If both a Material node and a ColorRGBA node are specified for a geometric shape, the colours shall replace the diffuse and transparency components of the material.
 * RGB or RGBA textures take precedence over colours; specifying both an RGB or RGBA texture and a ColorRGBA node for geometric shape will result in the ColorRGBA node being ignored.
 * @see https://doc.x3dom.org/author/Rendering/ColorRGBA.html
 */
export const colorrgba: ElementHelper<ColorRGBAProps>;

export interface ParticleSetProps extends X3DProps {
  mode?: string;
  drawOrder?: string;
  size?: string | X3DVec3[];
  index?: string | X3DNumber[];
  textureZ?: string | X3DNumber[];
}

/**
 * The ParticleSet is a geometry node used in combination with a ParticleSystem node.
 *  Attention: So far this is only a stub.
 * @see https://doc.x3dom.org/author/Rendering/ParticleSet.html
 */
export const particleset: ElementHelper<ParticleSetProps>;

export interface ClipPlaneProps extends X3DProps {
  enabled?: X3DBool;
  plane?: X3DVec4;
  cappingStrength?: X3DNumber;
  cappingColor?: X3DColor;
  on?: X3DBool;
}

/**
 * A clip plane is defined as a plane that generates two half-spaces. The effected geometry in the
 * half-space that is defined as being outside the plane is removed from the rendered image as a result of a
 * clipping operation.
 * @see https://doc.x3dom.org/author/Rendering/ClipPlane.html
 */
export const clipplane: ElementHelper<ClipPlaneProps>;

export interface AppearanceProps extends X3DProps {
  sortType?: string;
  sortKey?: X3DNumber;
  alphaClipThreshold?: X3DNumber;
}

/**
 * The Appearance node specifies the visual properties of geometry.
 * The value for each of the fields in this node may be NULL.
 * However, if the field is non-NULL, it shall contain one node of the appropriate type.
 * @see https://doc.x3dom.org/author/Shape/Appearance.html
 */
export const appearance: ElementHelper<AppearanceProps>;

export interface BlendModeProps extends X3DProps {
  srcFactor?: string;
  destFactor?: string;
  color?: X3DColor;
  colorTransparency?: X3DNumber;
  alphaFunc?: string;
  alphaFuncValue?: X3DNumber;
  equation?: string;
}

/**
 * The BlendMode controls blending and alpha test.
 * Pixels can be drawn using a function that blends the incoming (source) RGBA values with the RGBA values that are already in the frame buffer (the destination values).
 * @see https://doc.x3dom.org/author/Shape/BlendMode.html
 */
export const blendmode: ElementHelper<BlendModeProps>;

export interface DepthModeProps extends X3DProps {
  enableDepthTest?: X3DBool;
  depthFunc?: string;
  readOnly?: X3DBool;
  zNearRange?: X3DNumber;
  zFarRange?: X3DNumber;
}

/**
 * The depth mode contains the parameters that are specific for depth control, like the value used for depth buffer comparisons.
 * @see https://doc.x3dom.org/author/Shape/DepthMode.html
 */
export const depthmode: ElementHelper<DepthModeProps>;

export interface ColorMaskModeProps extends X3DProps {
  maskR?: X3DBool;
  maskG?: X3DBool;
  maskB?: X3DBool;
  maskA?: X3DBool;
}

/**
 * The ColorMaskMode node affects drawing in RGBA mode. The 4 masks control whether the corresponding component is written.
 * @see https://doc.x3dom.org/author/Shape/ColorMaskMode.html
 */
export const colormaskmode: ElementHelper<ColorMaskModeProps>;

export interface LinePropertiesProps extends X3DProps {
  applied?: X3DBool;
  linetype?: X3DNumber;
  linewidthScaleFactor?: X3DNumber;
}

/**
 * The LineProperties node specifies additional properties to be applied to all line geometry. The colour of the line is specified by the associated Material node.
 * @see https://doc.x3dom.org/author/Shape/LineProperties.html
 */
export const lineproperties: ElementHelper<LinePropertiesProps>;

export interface PointPropertiesProps extends X3DProps {
  pointSizeScaleFactor?: X3DNumber;
  pointSizeMinValue?: X3DNumber;
  pointSizeMaxValue?: X3DNumber;
  attenuation?: X3DVec3;
}

/**
 * The PointProperties node specifies additional properties to be applied to all point geometry.
 * @see https://doc.x3dom.org/author/Shape/PointProperties.html
 */
export const pointproperties: ElementHelper<PointPropertiesProps>;

export interface MaterialProps extends X3DProps {
  ambientIntensity?: X3DNumber;
  diffuseColor?: X3DColor;
  emissiveColor?: X3DColor;
  shininess?: X3DNumber;
  specularColor?: X3DColor;
  transparency?: X3DNumber;
}

/**
 * The Material node specifies surface material properties for associated geometry nodes and is used by the X3D lighting equations during rendering.
 * All of the fields in the Material node range from 0.0 to 1.0.
 * @see https://doc.x3dom.org/author/Shape/Material.html
 */
export const material: ElementHelper<MaterialProps>;

export interface TwoSidedMaterialProps extends X3DProps {
  backAmbientIntensity?: X3DNumber;
  backDiffuseColor?: X3DColor;
  backEmissiveColor?: X3DColor;
  backShininess?: X3DNumber;
  backSpecularColor?: X3DColor;
  backTransparency?: X3DNumber;
  separateBackColor?: X3DBool;
}

/**
 * This node defines material properties that can effect both the front and back side of a polygon individually.
 * These materials are used for both the front and back side of the geometry whenever the X3D lighting model is active.
 * @see https://doc.x3dom.org/author/Shape/TwoSidedMaterial.html
 */
export const twosidedmaterial: ElementHelper<TwoSidedMaterialProps>;

export interface PhysicalMaterialProps extends X3DProps {
  model?: string;
  baseColorFactor?: X3DColorRGBA;
  metallicFactor?: X3DNumber;
  roughnessFactor?: X3DNumber;
  diffuseFactor?: X3DColorRGBA;
  specularFactor?: X3DColor;
  glossinessFactor?: X3DNumber;
  emissiveFactor?: X3DColor;
  normalSpace?: string;
  alphaMode?: string;
  alphaCutoff?: X3DNumber;
  normalBias?: X3DVec3;
  normalScale?: X3DNumber;
  unlit?: X3DBool;
}

/**
 * This is the base node type for all Material nodes.
 * @see https://doc.x3dom.org/author/Shape/PhysicalMaterial.html
 */
export const physicalmaterial: ElementHelper<PhysicalMaterialProps>;

export interface ShapeProps extends X3DProps {
}

/**
 * The Shape node has two fields, appearance and geometry, that are used to create rendered objects in the world.
 * The appearance field contains an Appearance node that specifies the visual attributes (e.g., material and texture) to be applied to the geometry.
 * The geometry field contains a geometry node. The specified geometry node is rendered with the specified appearance nodes applied.
 * @see https://doc.x3dom.org/author/Shape/Shape.html
 */
export const shape: ElementHelper<ShapeProps>;

export interface DirectionalLightProps extends X3DProps {
  direction?: X3DVec3;
  shadowCascades?: X3DNumber;
  shadowSplitFactor?: X3DNumber;
  shadowSplitOffset?: X3DNumber;
}

/**
 * The DirectionalLight node defines a directional light source that illuminates along rays parallel to a given 3-dimensional vector.
 * A directional light source illuminates only the objects in its enclosing parent group.
 * The light may illuminate everything within this coordinate system, including all children and descendants of its parent group.
 * The accumulated transformations of the parent nodes affect the light.
 * DirectionalLight nodes do not attenuate with distance.
 * @see https://doc.x3dom.org/author/Lighting/DirectionalLight.html
 */
export const directionallight: ElementHelper<DirectionalLightProps>;

export interface PointLightProps extends X3DProps {
  attenuation?: X3DVec3;
  location?: X3DVec3;
  radius?: X3DNumber;
}

/**
 * The PointLight node specifies a point light source at a 3D location in the local coordinate system.
 * A point light source emits light equally in all directions; that is, it is omnidirectional.
 * PointLight nodes are specified in the local coordinate system and are affected by ancestor transformations.
 * @see https://doc.x3dom.org/author/Lighting/PointLight.html
 */
export const pointlight: ElementHelper<PointLightProps>;

export interface SpotLightProps extends X3DProps {
  direction?: X3DVec3;
  attenuation?: X3DVec3;
  location?: X3DVec3;
  radius?: X3DNumber;
  beamWidth?: X3DNumber;
  cutOffAngle?: X3DNumber;
  shadowCascades?: X3DNumber;
  shadowSplitFactor?: X3DNumber;
  shadowSplitOffset?: X3DNumber;
}

/**
 * The SpotLight node defines a light source that emits light from a specific point along a specific direction vector and constrained within a solid angle.
 * Spotlights may illuminate geometry nodes that respond to light sources and intersect the solid angle defined by the SpotLight.
 * Spotlight nodes are specified in the local coordinate system and are affected by ancestors' transformations.
 * @see https://doc.x3dom.org/author/Lighting/SpotLight.html
 */
export const spotlight: ElementHelper<SpotLightProps>;

export interface PhysicalEnvironmentLightProps extends X3DProps {
  direction?: X3DVec3;
  diffuse?: string;
  specular?: string;
  shadowCascades?: X3DNumber;
  shadowSplitFactor?: X3DNumber;
  shadowSplitOffset?: X3DNumber;
}

/**
 * <physicalenvironmentlight> node (X3DOM Lighting component).
 * @see https://doc.x3dom.org/author/Lighting/PhysicalEnvironmentLight.html
 */
export const physicalenvironmentlight: ElementHelper<PhysicalEnvironmentLightProps>;

export interface ColorChaserProps extends X3DProps {
  initialDestination?: X3DColor;
  initialValue?: X3DColor;
  value?: X3DColor;
  destination?: X3DColor;
}

/**
 * The ColorChaser animates transitions for single color values. Whenever the set_destination
 *  field receives a floating point number, the value_changed creates a transition from its current value to
 *  the newly set number. It creates a smooth transition that ends duration seconds after the last number has
 *  been received.
 * @see https://doc.x3dom.org/author/Followers/ColorChaser.html
 */
export const colorchaser: ElementHelper<ColorChaserProps>;

export interface ColorDamperProps extends X3DProps {
  initialDestination?: X3DColor;
  initialValue?: X3DColor;
  value?: X3DColor;
  destination?: X3DColor;
}

/**
 * The ColorDamper animates color values. Whenever the it receives a color, the ColorDamper node
 *  creates a transition from the current color to the newly set color. The transition created approaches the
 *  newly set position asymptotically during a time period of approximately three to four times the value of
 *  the field tau depending on the desired accuracy and the value of order. The order field specifies the
 *  smoothness of the transition.
 * @see https://doc.x3dom.org/author/Followers/ColorDamper.html
 */
export const colordamper: ElementHelper<ColorDamperProps>;

export interface OrientationChaserProps extends X3DProps {
  initialDestination?: X3DRotation;
  initialValue?: X3DRotation;
  value?: X3DRotation;
  destination?: X3DRotation;
}

/**
 * The OrientationChaser animates transitions for orientations. If it is routed to a rotation field
 *  of a Transform node that contains an object, whenever the set_destination field receives an orientation, the
 *  OrientationChaser node rotates the object from its current orientation to the newly set orientation.
 *  It creates a smooth transition that ends duration seconds after the last orientation has been received.
 * @see https://doc.x3dom.org/author/Followers/OrientationChaser.html
 */
export const orientationchaser: ElementHelper<OrientationChaserProps>;

export interface OrientationDamperProps extends X3DProps {
  initialDestination?: X3DRotation;
  initialValue?: X3DRotation;
  value?: X3DRotation;
  destination?: X3DRotation;
}

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
export const orientationdamper: ElementHelper<OrientationDamperProps>;

export interface PositionChaserProps extends X3DProps {
  initialDestination?: X3DVec3;
  initialValue?: X3DVec3;
  value?: X3DVec3;
  destination?: X3DVec3;
}

/**
 * The PositionChaser animates transitions for 3D vectors. If its value field is routed to a
 *  translation field of a Transform node that contains an object, then, whenever the destination field
 *  receives a 3D position, the PositionChaser node moves the object from its current position to the newly set
 *  position. It creates a smooth transition that ends duration seconds after the last position has been
 *  received.
 * @see https://doc.x3dom.org/author/Followers/PositionChaser.html
 */
export const positionchaser: ElementHelper<PositionChaserProps>;

export interface PositionChaser2DProps extends X3DProps {
  initialDestination?: X3DVec2;
  initialValue?: X3DVec2;
  value?: X3DVec2;
  destination?: X3DVec2;
}

/**
 * The PositionChaser2D animates transitions for 2D vectors. Whenever its destination field receives
 *  a 2D vector it creates a transition from its current 2D vector value to the newly set value. It creates a
 *  smooth transition that ends duration seconds after the last 2D vector has been received.
 * @see https://doc.x3dom.org/author/Followers/PositionChaser2D.html
 */
export const positionchaser2d: ElementHelper<PositionChaser2DProps>;

export interface PositionDamperProps extends X3DProps {
  initialDestination?: X3DVec3;
  initialValue?: X3DVec3;
  value?: X3DVec3;
  destination?: X3DVec3;
}

/**
 * The PositionDamper animates transitions for 3D vectors. If its value field is routed to a
 *  translation field of a Transform node that contains an object, then, whenever the destination field receives
 *  a 3D position, the PositionDamper node moves the object from its current position to the newly set position.
 * @see https://doc.x3dom.org/author/Followers/PositionDamper.html
 */
export const positiondamper: ElementHelper<PositionDamperProps>;

export interface PositionDamper2DProps extends X3DProps {
  initialDestination?: X3DVec2;
  initialValue?: X3DVec2;
  value?: X3DVec2;
  destination?: X3DVec2;
}

/**
 * The PositionDamper2D animates transitions for 2D vectors. Whenever the destination field receives
 * a 2D vector, it creates a transition from its current 2D vector value to the newly set value.
 * @see https://doc.x3dom.org/author/Followers/PositionDamper2D.html
 */
export const positiondamper2d: ElementHelper<PositionDamper2DProps>;

export interface ScalarChaserProps extends X3DProps {
  initialDestination?: X3DNumber;
  initialValue?: X3DNumber;
  value?: X3DNumber;
  destination?: X3DNumber;
}

/**
 * The ScalarChaser animates transitions for single float values. Whenever the destination field
 *  receives a floating point number, it creates a transition from its current value to the newly set number.
 *  It creates a smooth transition that ends duration seconds after the last number has been received.
 * @see https://doc.x3dom.org/author/Followers/ScalarChaser.html
 */
export const scalarchaser: ElementHelper<ScalarChaserProps>;

export interface ScalarDamperProps extends X3DProps {
  initialDestination?: X3DNumber;
  initialValue?: X3DNumber;
  value?: X3DNumber;
  destination?: X3DNumber;
}

/**
 * The ScalarDamper animates transitions for single float values. If the value field is routed to a
 *  transparency field of a Material node, then, whenever the destination field receives a single float value,
 *  the ScalarDamper node creates a transition from its current value to the newly set value.
 * @see https://doc.x3dom.org/author/Followers/ScalarDamper.html
 */
export const scalardamper: ElementHelper<ScalarDamperProps>;

export interface CoordinateDamperProps extends X3DProps {
  initialDestination?: string | X3DVec3[];
  initialValue?: string | X3DVec3[];
  value?: string | X3DVec3[];
  destination?: string | X3DVec3[];
}

/**
 * The CoordinateChaser animates transitions for array of 3D vectors (e.g., the coordinates of a
 *  mesh). Whenever it receives an array of 3D vectors, the value_changed creates a transition from its
 *  current value to the newly set number. It creates a smooth transition that ends duration seconds after the
 *  last number has been received.
 * @see https://doc.x3dom.org/author/Followers/CoordinateDamper.html
 */
export const coordinatedamper: ElementHelper<CoordinateDamperProps>;

export interface TexCoordDamper2DProps extends X3DProps {
  initialDestination?: string | X3DVec2[];
  initialValue?: string | X3DVec2[];
  value?: string | X3DVec2[];
  destination?: string | X3DVec2[];
}

/**
 * The TexCoordDamper2D node animates transitions for an array of 2D vectors (e.g., the texture
 *  coordinates of a mesh). Whenever the destination field receives an array of 2D vectors, value begins
 *  sending an array of the same length, where each element moves from its current value towards the value at
 *  the same position in the array received.
 * @see https://doc.x3dom.org/author/Followers/TexCoordDamper2D.html
 */
export const texcoorddamper2d: ElementHelper<TexCoordDamper2DProps>;

export interface OrientationInterpolatorProps extends X3DProps {
  keyValue?: string | X3DRotation[];
}

/**
 * The OrientationInterpolator node interpolates among a list of rotation values specified in the keyValue field to produce an SFRotation value_changed event.
 * These rotations are absolute in object space and therefore are not cumulative.
 * The keyValue field shall contain exactly as many rotations as there are key frames in the key field.
 * An orientation represents the final position of an object after a rotation has been applied.
 * An OrientationInterpolator interpolates between two orientations by computing the shortest path on the unit sphere between the two orientations.
 * The interpolation is linear in arc length along this path. The results are undefined if the two orientations are diagonally opposite.
 * @see https://doc.x3dom.org/author/Interpolation/OrientationInterpolator.html
 */
export const orientationinterpolator: ElementHelper<OrientationInterpolatorProps>;

export interface PositionInterpolatorProps extends X3DProps {
  keyValue?: string | X3DVec3[];
}

/**
 * The PositionInterpolator node linearly interpolates among a list of 3D vectors to produce an SFVec3f value_changed event. The keyValue field shall contain exactly as many values as in the key field.
 * @see https://doc.x3dom.org/author/Interpolation/PositionInterpolator.html
 */
export const positioninterpolator: ElementHelper<PositionInterpolatorProps>;

export interface PositionInterpolator2DProps extends X3DProps {
  keyValue?: string | X3DVec2[];
}

/**
 * The PositionInterpolator2D node linearly interpolates among a list of 2D vectors to produce an SFVec2f value_changed event. The keyValue field shall contain exactly as many values as in the key field.
 * @see https://doc.x3dom.org/author/Interpolation/PositionInterpolator2D.html
 */
export const positioninterpolator2d: ElementHelper<PositionInterpolator2DProps>;

export interface NormalInterpolatorProps extends X3DProps {
  keyValue?: string | X3DVec3[];
}

/**
 * The NormalInterpolator node interpolates among a list of normal vector sets specified by the keyValue field to produce an MFVec3f value_changed event.
 * The output vector, value_changed, shall be a set of normalized vectors.
 * Values in the keyValue field shall be of unit length.
 * The number of normals in the keyValue field shall be an integer multiple of the number of key frames in the key field.
 * That integer multiple defines how many normals will be contained in the value_changed events.
 * @see https://doc.x3dom.org/author/Interpolation/NormalInterpolator.html
 */
export const normalinterpolator: ElementHelper<NormalInterpolatorProps>;

export interface ColorInterpolatorProps extends X3DProps {
  keyValue?: string | X3DColor[];
  RGB?: X3DBool;
}

/**
 * The ColorInterpolator node interpolates among a list of MFColor key values to produce an SFColor (RGB) value_changed event.
 * The number of colours in the keyValue field shall be equal to the number of key frames in the key field.
 * A linear interpolation using the value of set_fraction as input is performed in HSV space.
 * The results are undefined when interpolating between two consecutive keys with complementary hues.
 * @see https://doc.x3dom.org/author/Interpolation/ColorInterpolator.html
 */
export const colorinterpolator: ElementHelper<ColorInterpolatorProps>;

export interface ScalarInterpolatorProps extends X3DProps {
  keyValue?: string | X3DNumber[];
}

/**
 * The ScalarInterpolator node linearly interpolates among a list of SFFloat values to produce an SFFloat value_changed event.
 * This interpolator is appropriate for any parameter defined using a single floating point value.
 * @see https://doc.x3dom.org/author/Interpolation/ScalarInterpolator.html
 */
export const scalarinterpolator: ElementHelper<ScalarInterpolatorProps>;

export interface CoordinateInterpolatorProps extends X3DProps {
  keyValue?: string | X3DVec3[];
}

/**
 * The CoordinateInterpolator node linearly interpolates among a list of MFVec3f values to produce an MFVec3f value_changed event.
 * The number of coordinates in the keyValue field shall be an integer multiple of the number of key frames in the key field.
 * That integer multiple defines how many coordinates will be contained in the value_changed events.
 * @see https://doc.x3dom.org/author/Interpolation/CoordinateInterpolator.html
 */
export const coordinateinterpolator: ElementHelper<CoordinateInterpolatorProps>;

export interface SplinePositionInterpolatorProps extends X3DProps {
  keyValue?: string | X3DVec3[];
  keyVelocity?: string | X3DVec3[];
  closed?: X3DBool;
  normalizeVelocity?: X3DBool;
}

/**
 * The SplinePositionInterpolator node non-linearly interpolates among a list of 3D vectors to produce an SFVec3f value_changed event. The keyValue, keyVelocity, and key fields shall each have the same number of values.
 * @see https://doc.x3dom.org/author/Interpolation/SplinePositionInterpolator.html
 */
export const splinepositioninterpolator: ElementHelper<SplinePositionInterpolatorProps>;

export interface TimeSensorProps extends X3DProps {
  cycleInterval?: X3DNumber;
  loop?: X3DBool;
  startTime?: X3DNumber;
  stopTime?: X3DNumber;
  pauseTime?: X3DNumber;
  resumeTime?: X3DNumber;
  cycleTime?: X3DNumber;
  elapsedTime?: X3DNumber;
  fraction_changed?: X3DNumber;
  isActive?: X3DBool;
  isPaused?: X3DBool;
  time?: X3DNumber;
  first?: X3DBool;
  firstCycle?: X3DNumber;
}

/**
 * TimeSensor nodes generate events as time passes.
 * @see https://doc.x3dom.org/author/Time/TimeSensor.html
 */
export const timesensor: ElementHelper<TimeSensorProps>;

export interface AnchorProps extends X3DProps {
  url?: string | string[];
  parameter?: string | string[];
  description?: string;
}

/**
 * Anchor is a Grouping node that can contain most nodes. Clicking Anchored geometry loads content specified by the url field.
 * Loaded content completely replaces current content, if parameter is same window.
 * Hint: insert a Shape node before adding geometry or Appearance.
 * @see https://doc.x3dom.org/author/Networking/Anchor.html
 */
export const anchor: ElementHelper<AnchorProps>;

export interface InlineProps extends X3DProps {
  url?: string | string[];
  load?: X3DBool;
  description?: string;
  nameSpaceName?: string | string[];
  contentType?: string;
  mapDEFToID?: X3DBool;
}

/**
 * Inline is a Grouping node that can load nodes from another X3D scene via url.
 * @see https://doc.x3dom.org/author/Networking/Inline.html
 */
export const inline: ElementHelper<InlineProps>;

export interface FogProps extends X3DProps {
}

/**
 * The Fog node provides a way to simulate atmospheric effects by blending objects with the colour
 * specified by the color field based on the distances of the various objects from the viewer. The distances
 * are calculated in the coordinate space of the Fog node.
 * @see https://doc.x3dom.org/author/EnvironmentalEffects/Fog.html
 */
export const fog: ElementHelper<FogProps>;

export interface BackgroundProps extends X3DProps {
  backUrl?: string | string[];
  bottomUrl?: string | string[];
  frontUrl?: string | string[];
  leftUrl?: string | string[];
  rightUrl?: string | string[];
  topUrl?: string | string[];
  scaling?: X3DBool;
}

/**
 * A background node that uses six static images to compose the backdrop.  For the backUrl,
 * bottomUrl, frontUrl, leftUrl, rightUrl, topUrl fields, browsers shall support the JPEG and PNG
 * (see ISO/IEC 15948) image file formats.
 * @see https://doc.x3dom.org/author/EnvironmentalEffects/Background.html
 */
export const background: ElementHelper<BackgroundProps>;

export interface EnvironmentProps extends X3DProps {
  sortTrans?: X3DBool;
  shadowExcludeTransparentObjects?: X3DBool;
  gammaCorrectionDefault?: string;
  tonemapping?: string;
  frustumCulling?: X3DBool;
  smallFeatureCulling?: X3DBool;
  smallFeatureThreshold?: X3DNumber;
  occlusionCulling?: X3DBool;
  occlusionVisibilityThreshold?: X3DNumber;
  lowPriorityCulling?: X3DBool;
  lowPriorityThreshold?: X3DNumber;
  tessellationDetailCulling?: X3DBool;
  tessellationErrorThreshold?: X3DNumber;
  enableARC?: X3DBool;
  minFrameRate?: X3DNumber;
  maxFrameRate?: X3DNumber;
  userDataFactor?: X3DNumber;
  smallFeatureFactor?: X3DNumber;
  occlusionVisibilityFactor?: X3DNumber;
  lowPriorityFactor?: X3DNumber;
  tessellationErrorFactor?: X3DNumber;
  SSAO?: X3DBool;
  SSAOradius?: X3DNumber;
  SSAOamount?: X3DNumber;
  SSAOrandomTextureSize?: X3DNumber;
  SSAOblurDepthTreshold?: X3DNumber;
}

/**
 * Bindable node to setup rendering and culling parameters
 * @see https://doc.x3dom.org/author/EnvironmentalEffects/Environment.html
 */
export const environment: ElementHelper<EnvironmentProps>;

export interface ViewpointProps extends X3DProps {
  fieldOfView?: X3DNumber;
  position?: X3DVec3;
  orientation?: X3DRotation;
  centerOfRotation?: X3DVec3;
  zNear?: X3DNumber;
  zFar?: X3DNumber;
}

/**
 * Viewpoint provides a specific location and direction where the user may view the scene.
 * The principalPoint extention allows to set asymmetric frustums.
 * @see https://doc.x3dom.org/author/Navigation/Viewpoint.html
 */
export const viewpoint: ElementHelper<ViewpointProps>;

export interface OrthoViewpointProps extends X3DProps {
  fieldOfView?: string | X3DNumber[];
  position?: X3DVec3;
  orientation?: X3DRotation;
  centerOfRotation?: X3DVec3;
  zNear?: X3DNumber;
  zFar?: X3DNumber;
}

/**
 * The OrthoViewpoint node defines a viewpoint that provides an orthographic view of the scene.
 * An orthographic view is one in which all projectors are parallel to the projector from centerOfRotation to position.
 * @see https://doc.x3dom.org/author/Navigation/OrthoViewpoint.html
 */
export const orthoviewpoint: ElementHelper<OrthoViewpointProps>;

export interface ViewfrustumProps extends X3DProps {
  modelview?: X3DMatrix4;
  projection?: X3DMatrix4;
}

/**
 * The Viewfrustum node allows to define a camera position and projection utilizing a standard OpenGL projection/modelview pair.
 * @see https://doc.x3dom.org/author/Navigation/Viewfrustum.html
 */
export const viewfrustum: ElementHelper<ViewfrustumProps>;

export interface NavigationInfoProps extends X3DProps {
  headlight?: X3DBool;
  reverseScroll?: X3DBool;
  type?: string | string[];
  typeParams?: string | X3DNumber[];
  explorationMode?: string;
  avatarSize?: string | X3DNumber[];
  walkDamping?: X3DNumber;
  visibilityLimit?: X3DNumber;
  speed?: X3DNumber;
  transitionTime?: X3DNumber;
  transitionType?: string | string[];
}

/**
 * NavigationInfo describes the viewing model and physical characteristics of the viewer's avatar.
 * Hint: for inspection of simple objects, usability often improves with type='EXAMINE' 'ANY' Hint: NavigationInfo types ''WALK' 'FLY'' support camera-to-object collision detection.
 * Background, Fog, NavigationInfo, TextureBackground and Viewpoint are bindable nodes.
 * @see https://doc.x3dom.org/author/Navigation/NavigationInfo.html
 */
export const navigationinfo: ElementHelper<NavigationInfoProps>;

export interface BillboardProps extends X3DProps {
  axisOfRotation?: X3DVec3;
}

/**
 * Billboard is a Grouping node that can contain most nodes.
 * Content faces the user, rotating about the specified axis. Set axisOfRotation=0 0 0 to fully face the user's camera.
 * Hint: Put Billboard as close to the geometry as possible, nested inside Transform for local coordinate system.
 * Hint: don't put Viewpoint inside a Billboard.
 * Hint: insert a Shape node before adding geometry or Appearance.
 * @see https://doc.x3dom.org/author/Navigation/Billboard.html
 */
export const billboard: ElementHelper<BillboardProps>;

export interface CollisionProps extends X3DProps {
  enabled?: X3DBool;
  collideTime?: X3DNumber;
  isActive?: X3DBool;
}

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
export const collision: ElementHelper<CollisionProps>;

export interface LODProps extends X3DProps {
  range?: string | X3DNumber[];
  level_changed?: X3DNumber;
}

/**
 * LOD (Level Of Detail) uses camera-to-object distance to switch among contained child levels.
 * (Contained nodes are now called 'children' rather than 'level', for consistent naming among all GroupingNodeType nodes.)
 * LOD range values go from near to far (as child geometry gets simpler for better performance).
 * For n range values, you must have n+1 children levels! Only the currently selected children level is rendered, but all levels continue to send/receive events.
 * @see https://doc.x3dom.org/author/Navigation/LOD.html
 */
export const lod: ElementHelper<LODProps>;

export interface DynamicLODProps extends X3DProps {
  subScale?: X3DNumber;
  size?: X3DVec2;
  subdivision?: X3DVec2;
  urlHead?: string;
  urlCenter?: string;
  urlTail?: string;
}

/**
 * <dynamiclod> node (X3DOM Navigation component).
 * @see https://doc.x3dom.org/author/Navigation/DynamicLOD.html
 */
export const dynamiclod: ElementHelper<DynamicLODProps>;

export interface FontStyleProps extends X3DProps {
  family?: string | string[];
  horizontal?: X3DBool;
  justify?: string | string[];
  language?: string;
  leftToRight?: X3DBool;
  size?: X3DNumber;
  spacing?: X3DNumber;
  style?: string;
  topToBottom?: X3DBool;
  quality?: X3DNumber;
}

/**
 * The FontStyle node defines the size, family, and style used for Text nodes, as well as the direction of the text strings and any language-specific rendering techniques used for non-English text.
 * @see https://doc.x3dom.org/author/Text/FontStyle.html
 */
export const fontstyle: ElementHelper<FontStyleProps>;

export interface TextProps extends X3DProps {
  string?: string | string[];
  length?: string | X3DNumber[];
  maxExtent?: X3DNumber;
}

/**
 * The Text node specifies a two-sided, flat text string object positioned in the Z=0 plane of the local coordinate system based on values defined in the fontStyle field.
 * Text nodes may contain multiple text strings specified using the UTF-8 encoding.
 * The text strings are stored in the order in which the text mode characters are to be produced as defined by the parameters in the FontStyle node.
 *
 * Exported as `x3dtext` to avoid colliding with the HTML/SVG `text` helper.
 * @see https://doc.x3dom.org/author/Text/Text.html
 */
export const x3dtext: ElementHelper<TextProps>;

export interface SoundProps extends X3DProps {
}

/**
 * The Sound node specifies the spatial presentation of a sound in a X3D scene.
 * @see https://doc.x3dom.org/author/Sound/Sound.html
 */
export const sound: ElementHelper<SoundProps>;

export interface AudioClipProps extends X3DProps {
  url?: string | string[];
  enabled?: X3DBool;
  loop?: X3DBool;
}

/**
 * An AudioClip node specifies audio data that can be referenced by Sound nodes.
 * @see https://doc.x3dom.org/author/Sound/AudioClip.html
 */
export const audioclip: ElementHelper<AudioClipProps>;

export interface TextureTransformProps extends X3DProps {
  center?: X3DVec2;
  rotation?: X3DNumber;
  scale?: X3DVec2;
  translation?: X3DVec2;
}

/**
 * The TextureTransform node defines a 2D transformation that is applied to texture coordinates. This node affects the way textures coordinates are applied to the geometric surface. The transformation consists of (in order):
 * a translation; a rotation about the centre point; a non-uniform scale about the centre point.
 * @see https://doc.x3dom.org/author/Texturing/TextureTransform.html
 */
export const texturetransform: ElementHelper<TextureTransformProps>;

export interface MatrixTextureTransformProps extends X3DProps {
  matrix?: X3DMatrix4;
}

/**
 * The MatrixTextureTransform node defines a 2D transformation as a 4x4 matrix that is applied to texture coordinates.
 * This node affects the way textures coordinates are applied to the geometric surface.
 * @see https://doc.x3dom.org/author/Texturing/MatrixTextureTransform.html
 */
export const matrixtexturetransform: ElementHelper<MatrixTextureTransformProps>;

export interface TexturePropertiesProps extends X3DProps {
  anisotropicDegree?: X3DNumber;
  borderColor?: X3DColorRGBA;
  borderWidth?: X3DNumber;
  boundaryModeS?: string;
  boundaryModeT?: string;
  boundaryModeR?: string;
  magnificationFilter?: string;
  minificationFilter?: string;
  textureCompression?: string;
  texturePriority?: X3DNumber;
  generateMipMaps?: X3DBool;
}

/**
 * TextureProperties allows fine control over a texture's application.
 * This node can be used to set the texture properties for a node with a textureProperties field.
 * A texture with a TextureProperties node will ignore the repeatS and repeatT fields on the texture.
 * @see https://doc.x3dom.org/author/Texturing/TextureProperties.html
 */
export const textureproperties: ElementHelper<TexturePropertiesProps>;

export interface MultiTextureProps extends X3DProps {
}

/**
 * The MultiTexture node specifies the application of several individual textures to a 3D object to achieve a more complex visual effect.
 * MultiTexture can be used as a value for the texture field in an Appearance node.
 * @see https://doc.x3dom.org/author/Texturing/MultiTexture.html
 */
export const multitexture: ElementHelper<MultiTextureProps>;

export interface TextureProps extends X3DProps {
  hideChildren?: X3DBool;
}

/**
 * (Abstract) class for 2D Textures.
 * @see https://doc.x3dom.org/author/Texturing/Texture.html
 */
export const texture: ElementHelper<TextureProps>;

export interface RenderedTextureProps extends X3DProps {
  dimensions?: string | X3DNumber[];
  update?: string;
  showNormals?: X3DBool;
  stereoMode?: string;
  interpupillaryDistance?: X3DNumber;
  eyeToScreenDistance?: X3DNumber;
  vScreenSize?: X3DNumber;
  lensCenter?: X3DVec3;
  depthMap?: X3DBool;
  oculusRiftVersion?: X3DBool;
}

/**
 * This extension provides the ability to dynamically render a partial scenegraph to an offscreen texture that can then be used on the geometry of a node.
 * This can be used in many different ways such as creating mirror effects, inputs to shaders etc.
 * The purpose of this component is to provide for extended visual effects, but not the complete form of offscreen rendering and buffers that would be available to lower-level rendering APIs.
 * @see https://doc.x3dom.org/author/Texturing/RenderedTexture.html
 */
export const renderedtexture: ElementHelper<RenderedTextureProps>;

export interface RefinementTextureProps extends X3DProps {
  stamp0?: string;
  stamp1?: string;
  autoRefinement?: X3DBool;
  format?: string;
  iterations?: X3DNumber;
  maxLevel?: X3DNumber;
}

/**
 * <refinementtexture> node (X3DOM Texturing component).
 * @see https://doc.x3dom.org/author/Texturing/RefinementTexture.html
 */
export const refinementtexture: ElementHelper<RefinementTextureProps>;

export interface PixelTextureProps extends X3DProps {
  image?: string | X3DNumber[];
}

/**
 * The PixelTexture node defines a 2D image-based texture map as an explicit array of pixel values (image field) and parameters controlling tiling repetition of the texture onto geometry.
 * @see https://doc.x3dom.org/author/Texturing/PixelTexture.html
 */
export const pixeltexture: ElementHelper<PixelTextureProps>;

export interface ImageTextureProps extends X3DProps {
}

/**
 * ImageTexture maps a 2D-image file onto a geometric shape.
 * Texture maps have a 2D coordinate system (s, t) horizontal and vertical, with (s, t) values in range [0.0, 1.0] for opposite corners of the image.
 * @see https://doc.x3dom.org/author/Texturing/ImageTexture.html
 */
export const imagetexture: ElementHelper<ImageTextureProps>;

export interface MovieTextureProps extends X3DProps {
  loop?: X3DBool;
  speed?: X3DNumber;
  pauseTime?: X3DNumber;
  pitch?: X3DNumber;
  resumeTime?: X3DNumber;
  startTime?: X3DNumber;
  stopTime?: X3DNumber;
}

/**
 * The MovieTexture node defines a time dependent texture map (contained in a movie file) and parameters for controlling the movie and the texture mapping.
 * @see https://doc.x3dom.org/author/Texturing/MovieTexture.html
 */
export const movietexture: ElementHelper<MovieTextureProps>;

export interface TextureCoordinateProps extends X3DProps {
  point?: string | X3DVec2[];
}

/**
 * The TextureCoordinate node is a geometry property node that specifies a set of 2D texture coordinates used by vertex-based geometry nodes (EXAMPLE  IndexedFaceSet and ElevationGrid) to map textures to vertices.
 * @see https://doc.x3dom.org/author/Texturing/TextureCoordinate.html
 */
export const texturecoordinate: ElementHelper<TextureCoordinateProps>;

export interface TextureCoordinateGeneratorProps extends X3DProps {
  mode?: string;
  parameter?: string | X3DNumber[];
}

/**
 * TextureCoordinateGenerator supports the automatic generation of texture coordinates for geometric shapes.
 * @see https://doc.x3dom.org/author/Texturing/TextureCoordinateGenerator.html
 */
export const texturecoordinategenerator: ElementHelper<TextureCoordinateGeneratorProps>;

export interface MultiTextureCoordinateProps extends X3DProps {
}

/**
 * MultiTextureCoordinate supplies multiple texture coordinates per vertex. This node can be used to set the texture coordinates for the different texture channels.
 * @see https://doc.x3dom.org/author/Texturing/MultiTextureCoordinate.html
 */
export const multitexturecoordinate: ElementHelper<MultiTextureCoordinateProps>;

export interface ImageTextureAtlasProps extends X3DProps {
  numberOfSlices?: X3DNumber;
  slicesOverX?: X3DNumber;
  slicesOverY?: X3DNumber;
}

/**
 * This is a special helper node to represent tiles for volume rendering.
 * @see https://doc.x3dom.org/author/Texturing/ImageTextureAtlas.html
 */
export const imagetextureatlas: ElementHelper<ImageTextureAtlasProps>;

export interface ComposedCubeMapTextureProps extends X3DProps {
}

/**
 * The ComposedCubeMapTexture node defines a cubic environment map source as an explicit set of
 * images drawn from individual 2D texture nodes.
 * @see https://doc.x3dom.org/author/CubeMapTexturing/ComposedCubeMapTexture.html
 */
export const composedcubemaptexture: ElementHelper<ComposedCubeMapTextureProps>;

export interface GeneratedCubeMapTextureProps extends X3DProps {
  size?: X3DNumber;
  update?: string;
}

/**
 * The GeneratedCubeMapTexture node defines a cubic environment map that sources its data from
 * internally generated images, rendered from a virtual situated perspective in the scene.
 * @see https://doc.x3dom.org/author/CubeMapTexturing/GeneratedCubeMapTexture.html
 */
export const generatedcubemaptexture: ElementHelper<GeneratedCubeMapTextureProps>;

export interface UniformProps extends X3DProps {
}

/**
 * Node representing a uniform.
 * @see https://doc.x3dom.org/author/Shaders/Uniform.html
 */
export const uniform: ElementHelper<UniformProps>;

export interface SurfaceShaderTextureProps extends X3DProps {
  textureCoordinatesId?: X3DNumber;
  channelMask?: string;
  isSRGB?: X3DBool;
}

/**
 * A texture reference that can be used as a child of SurfaceShader.
 * @see https://doc.x3dom.org/author/Shaders/SurfaceShaderTexture.html
 */
export const surfaceshadertexture: ElementHelper<SurfaceShaderTextureProps>;

export interface CommonSurfaceShaderProps extends X3DProps {
  tangentTextureCoordinatesId?: X3DNumber;
  binormalTextureCoordinatesId?: X3DNumber;
  emissiveFactor?: X3DVec3;
  emissiveTextureId?: X3DNumber;
  emissiveTextureCoordinatesId?: X3DNumber;
  emissiveTextureChannelMask?: string;
  ambientFactor?: X3DVec3;
  ambientTextureId?: X3DNumber;
  ambientTextureCoordinatesId?: X3DNumber;
  ambientTextureChannelMask?: string;
  diffuseFactor?: X3DVec3;
  diffuseTextureId?: X3DNumber;
  diffuseTextureCoordinatesId?: X3DNumber;
  diffuseTextureChannelMask?: string;
  specularFactor?: X3DVec3;
  specularTextureId?: X3DNumber;
  specularTextureCoordinatesId?: X3DNumber;
  specularTextureChannelMask?: string;
  shininessFactor?: X3DNumber;
  shininessTextureId?: X3DNumber;
  shininessTextureCoordinatesId?: X3DNumber;
  shininessTextureChannelMask?: string;
  normalFormat?: string;
  normalSpace?: string;
  normalTextureId?: X3DNumber;
  normalTextureCoordinatesId?: X3DNumber;
  normalTextureChannelMask?: string;
  reflectionFactor?: X3DVec3;
  reflectionTextureId?: X3DNumber;
  reflectionTextureCoordinatesId?: X3DNumber;
  reflectionTextureChannelMask?: string;
  transmissionFactor?: X3DVec3;
  transmissionTextureId?: X3DNumber;
  transmissionTextureCoordinatesId?: X3DNumber;
  transmissionTextureChannelMask?: string;
  environmentFactor?: X3DVec3;
  environmentTextureId?: X3DNumber;
  environmentTextureCoordinatesId?: X3DNumber;
  environmentTextureChannelMask?: string;
  relativeIndexOfRefraction?: X3DNumber;
  fresnelBlend?: X3DNumber;
  displacementAxis?: string;
  displacementFactor?: X3DNumber;
  displacementTextureId?: X3DNumber;
  displacementTextureCoordinatesId?: X3DNumber;
  normalScale?: X3DVec3;
  normalBias?: X3DVec3;
  alphaFactor?: X3DNumber;
  invertAlphaTexture?: X3DBool;
  alphaTextureId?: X3DNumber;
  alphaTextureCoordinatesId?: X3DNumber;
  alphaTextureChannelMask?: string;
}

/**
 * Implements the Blinn-Phong BRDF with normal mapping and a perfect specular component.
 * @see https://doc.x3dom.org/author/Shaders/CommonSurfaceShader.html
 */
export const commonsurfaceshader: ElementHelper<CommonSurfaceShaderProps>;

export interface ComposedShaderProps extends X3DProps {
}

/**
 * The ComposedShader node defines a shader where the individual source files are not individually
 *  programmable. All access to the shading capabilities is defined through a single interface that applies to
 *  all parts.
 * @see https://doc.x3dom.org/author/Shaders/ComposedShader.html
 */
export const composedshader: ElementHelper<ComposedShaderProps>;

export interface ShaderPartProps extends X3DProps {
  url?: string | string[];
  type?: string;
}

/**
 * The ShaderPart node defines the source for a single object to be used by a ComposedShader node.
 *  The source is not required to be a complete shader for all of the vertex/fragment processing.
 * @see https://doc.x3dom.org/author/Shaders/ShaderPart.html
 */
export const shaderpart: ElementHelper<ShaderPartProps>;

export interface FloatVertexAttributeProps extends X3DProps {
  numComponents?: X3DNumber;
  value?: string | X3DNumber[];
}

/**
 * The FloatVertexAttribute node defines a set of per-vertex single-precision floating point
 *  attributes.
 * @see https://doc.x3dom.org/author/Shaders/FloatVertexAttribute.html
 */
export const floatvertexattribute: ElementHelper<FloatVertexAttributeProps>;

export interface PlaneProps extends X3DProps {
  size?: X3DVec2;
  subdivision?: X3DVec2;
  center?: X3DVec3;
  primType?: string | string[];
}

/**
 * <plane> node (X3DOM Geometry3D component).
 * @see https://doc.x3dom.org/author/Geometry3D/Plane.html
 */
export const plane: ElementHelper<PlaneProps>;

export interface BoxProps extends X3DProps {
  size?: X3DVec3;
  hasHelperColors?: X3DBool;
}

/**
 * The Box node specifies a rectangular parallelepiped box centred at (0, 0, 0) in the local coordinate system and aligned with the local coordinate axes. By default, the box measures 2 units in each dimension, from -1 to +1.
 * @see https://doc.x3dom.org/author/Geometry3D/Box.html
 */
export const box: ElementHelper<BoxProps>;

export interface SphereProps extends X3DProps {
  radius?: X3DNumber;
  subdivision?: X3DVec2;
}

/**
 * The Sphere node specifies a sphere centred at (0, 0, 0) in the local coordinate system.
 * @see https://doc.x3dom.org/author/Geometry3D/Sphere.html
 */
export const sphere: ElementHelper<SphereProps>;

export interface TorusProps extends X3DProps {
  innerRadius?: X3DNumber;
  outerRadius?: X3DNumber;
  angle?: X3DNumber;
  caps?: X3DBool;
  subdivision?: X3DVec2;
  insideOutsideRadius?: X3DBool;
}

/**
 * The Torus node specifies a torus shape centred at (0, 0, 0) in the local coordinate system.
 * @see https://doc.x3dom.org/author/Geometry3D/Torus.html
 */
export const torus: ElementHelper<TorusProps>;

export interface ConeProps extends X3DProps {
  bottomRadius?: X3DNumber;
  topRadius?: X3DNumber;
  height?: X3DNumber;
  bottom?: X3DBool;
  side?: X3DBool;
  top?: X3DBool;
  subdivision?: X3DNumber;
}

/**
 * The Cone node specifies a cone which is centred in the local coordinate system and whose central axis is aligned with the local Y-axis.
 * By default, the cone has a radius of 1.0 at the bottom and a height of 2.0
 * @see https://doc.x3dom.org/author/Geometry3D/Cone.html
 */
export const cone: ElementHelper<ConeProps>;

export interface CylinderProps extends X3DProps {
  radius?: X3DNumber;
  height?: X3DNumber;
  bottom?: X3DBool;
  top?: X3DBool;
  subdivision?: X3DNumber;
  side?: X3DBool;
}

/**
 * The Cylinder node specifies a capped cylinder centred at (0,0,0) in the local coordinate system and with a central axis oriented along the local Y-axis.
 * By default, the cylinder is sized at "-1" to "+1" in all three dimensions.
 * @see https://doc.x3dom.org/author/Geometry3D/Cylinder.html
 */
export const cylinder: ElementHelper<CylinderProps>;

export interface BinaryGeometryProps extends X3DProps {
  index?: string;
  coord?: string;
  normal?: string;
  texCoord?: string;
  color?: string;
  tangent?: string;
  binormal?: string;
  indexType?: string;
  coordType?: string;
  normalType?: string;
  texCoordType?: string;
  colorType?: string;
  tangentType?: string;
  binormalType?: string;
  normalAsSphericalCoordinates?: X3DBool;
  rgbaColors?: X3DBool;
  numTexCoordComponents?: X3DNumber;
  normalPerVertex?: X3DBool;
  idsPerVertex?: X3DBool;
  compressed?: X3DBool;
}

/**
 * The BinaryGeometry node can load binary data exported by AOPT.
 * @see https://doc.x3dom.org/author/Geometry3D/BinaryGeometry.html
 */
export const binarygeometry: ElementHelper<BinaryGeometryProps>;

export interface PopGeometryLevelProps extends X3DProps {
  src?: string;
  numIndices?: X3DNumber;
  vertexDataBufferOffset?: X3DNumber;
}

/**
 * The PopGeometryLevel node holds data of one refinement level for the PopGeometry node.
 * @see https://doc.x3dom.org/author/Geometry3D/PopGeometryLevel.html
 */
export const popgeometrylevel: ElementHelper<PopGeometryLevelProps>;

export interface PopGeometryProps extends X3DProps {
  tightSize?: X3DVec3;
  maxBBSize?: X3DVec3;
  bbMinModF?: X3DVec3;
  bbMaxModF?: X3DVec3;
  bbMin?: X3DVec3;
  bbShiftVec?: X3DVec3;
  attributeStride?: X3DNumber;
  positionOffset?: X3DNumber;
  normalOffset?: X3DNumber;
  texcoordOffset?: X3DNumber;
  colorOffset?: X3DNumber;
  numAnchorVertices?: X3DNumber;
  positionPrecision?: X3DNumber;
  normalPrecision?: X3DNumber;
  texcoordPrecision?: X3DNumber;
  colorPrecision?: X3DNumber;
  minPrecisionLevel?: X3DNumber;
  maxPrecisionLevel?: X3DNumber;
  precisionFactor?: X3DNumber;
  coordType?: string;
  normalType?: string;
  texCoordType?: string;
  colorType?: string;
  vertexBufferSize?: X3DNumber;
  indexedRendering?: X3DBool;
  sphericalNormals?: X3DBool;
  originalVertexCount?: string | X3DNumber[];
}

/**
 * The PopGeometry node provides a first, experimental implementation of the POP Buffer algorithm for progressive streaming of triangular mesh data.
 * @see https://doc.x3dom.org/author/Geometry3D/PopGeometry.html
 */
export const popgeometry: ElementHelper<PopGeometryProps>;

export interface IndexedFaceSetProps extends X3DProps {
  creaseAngle?: X3DNumber;
  convex?: X3DBool;
  coordIndex?: string | X3DNumber[];
  normalIndex?: string | X3DNumber[];
  colorIndex?: string | X3DNumber[];
  texCoordIndex?: string | X3DNumber[];
}

/**
 * <indexedfaceset> node (X3DOM Geometry3D component).
 * @see https://doc.x3dom.org/author/Geometry3D/IndexedFaceSet.html
 */
export const indexedfaceset: ElementHelper<IndexedFaceSetProps>;

export interface BufferGeometryProps extends X3DProps {
  buffer?: string;
  draco?: X3DBool;
}

/**
 * The BufferGeometry node can load binary data like glTF buffer.
 * @see https://doc.x3dom.org/author/Geometry3D/BufferGeometry.html
 */
export const buffergeometry: ElementHelper<BufferGeometryProps>;

export interface BufferViewProps extends X3DProps {
  target?: X3DNumber;
  byteOffset?: X3DNumber;
  byteStride?: X3DNumber;
  byteLength?: X3DNumber;
  idx?: X3DNumber;
  dracoId?: X3DNumber;
}

/**
 * The BufferAccessor node is experimental.
 * @see https://doc.x3dom.org/author/Geometry3D/BufferView.html
 */
export const bufferview: ElementHelper<BufferViewProps>;

export interface BufferAccessorProps extends X3DProps {
  bufferType?: string;
  view?: X3DNumber;
  byteOffset?: X3DNumber;
  byteStride?: X3DNumber;
  components?: X3DNumber;
  componentType?: X3DNumber;
  count?: X3DNumber;
  normalized?: X3DBool;
}

/**
 * The BufferAccessor node is experimental.
 * @see https://doc.x3dom.org/author/Geometry3D/BufferAccessor.html
 */
export const bufferaccessor: ElementHelper<BufferAccessorProps>;

export interface ComposedTexture3DProps extends X3DProps {
}

/**
 * The ComposedTexture3D node defines a 3D image-based texture map as a collection of 2D texture sources at various depths and parameters controlling tiling repetition of the texture onto geometry.
 * @see https://doc.x3dom.org/author/Texturing3D/ComposedTexture3D.html
 */
export const composedtexture3d: ElementHelper<ComposedTexture3DProps>;

export interface ImageTexture3DProps extends X3DProps {
}

/**
 * The ImageTexture3D node defines a texture map by specifying a single image file that contains complete 3D data and general parameters for mapping texels to geometry.
 * The texture is read from the URL specified by the url field. When the url field contains no values ([]), texturing is disabled.
 * @see https://doc.x3dom.org/author/Texturing3D/ImageTexture3D.html
 */
export const imagetexture3d: ElementHelper<ImageTexture3DProps>;

export interface PixelTexture3DProps extends X3DProps {
}

/**
 * The PixelTexture3D node defines a 3D image-based texture map as an explicit array of pixel values (image field) and parameters controlling tiling repetition of the texture onto geometry.
 * @see https://doc.x3dom.org/author/Texturing3D/PixelTexture3D.html
 */
export const pixeltexture3d: ElementHelper<PixelTexture3DProps>;

export interface TextureCoordinate3DProps extends X3DProps {
  point?: string | X3DVec3[];
}

/**
 * The TextureCoordinate3D node is a geometry property node that specifies a set of 3D texture coordinates used by vertex-based geometry nodes (e.g., IndexedFaceSet and ElevationGrid) to map 3D textures to vertices.
 * @see https://doc.x3dom.org/author/Texturing3D/TextureCoordinate3D.html
 */
export const texturecoordinate3d: ElementHelper<TextureCoordinate3DProps>;

export interface TextureTransform3DProps extends X3DProps {
  center?: X3DVec3;
  rotation?: X3DRotation;
  scale?: X3DVec3;
  translation?: X3DVec3;
  scaleOrientation?: X3DRotation;
}

/**
 * <texturetransform3d> node (X3DOM Texturing3D component).
 * @see https://doc.x3dom.org/author/Texturing3D/TextureTransform3D.html
 */
export const texturetransform3d: ElementHelper<TextureTransform3DProps>;

export interface TextureTransformMatrix3DProps extends X3DProps {
  matrix?: X3DMatrix4;
}

/**
 * The TextureTransform3D node specifies a 3D transformation that is applied to texture coordinates.
 * This node affects the way texture coordinates are applied to the geometric surface.
 * The transformation consists of a transformation matrix.
 * @see https://doc.x3dom.org/author/Texturing3D/TextureTransformMatrix3D.html
 */
export const texturetransformmatrix3d: ElementHelper<TextureTransformMatrix3DProps>;

export interface TouchSensorProps extends X3DProps {
}

/**
 * TouchSensor tracks location and state of the pointing device, and detects when user points at
 * geometry. Hint: X3DOM, running in an HTML environment, you actually don't need this node, as you can
 * simply use HTML events (like onclick) on your nodes. However, this node is implemented to complete the
 * pointing device sensor component, and it may be useful to ensure compatibility with older X3D scene content.
 * @see https://doc.x3dom.org/author/PointingDeviceSensor/TouchSensor.html
 */
export const touchsensor: ElementHelper<TouchSensorProps>;

export interface PlaneSensorProps extends X3DProps {
  axisRotation?: X3DRotation;
  minPosition?: X3DVec2;
  maxPosition?: X3DVec2;
  offset?: X3DVec3;
  planeOrientation?: string;
}

/**
 * PlaneSensor converts pointing device motion into 2D translation, parallel to the local Z=0 plane.
 * Hint: You can constrain translation output to one axis by setting the respective minPosition and  maxPosition
 * members to equal values for that axis.
 * @see https://doc.x3dom.org/author/PointingDeviceSensor/PlaneSensor.html
 */
export const planesensor: ElementHelper<PlaneSensorProps>;

export interface SphereSensorProps extends X3DProps {
  offset?: X3DRotation;
}

/**
 * SphereSensor converts pointing device motion into a spherical rotation around the origin of the
 * local coordinate system.
 * @see https://doc.x3dom.org/author/PointingDeviceSensor/SphereSensor.html
 */
export const spheresensor: ElementHelper<SphereSensorProps>;

export interface CylinderSensorProps extends X3DProps {
  offset?: X3DNumber;
  axisRotation?: X3DRotation;
  diskAngle?: X3DNumber;
  minAngle?: X3DNumber;
  maxAngle?: X3DNumber;
}

/**
 * The CylinderSensor node converts pointer motion (for example, from a mouse) into rotation values,
 * using an invisible cylinder of infinite height, aligned with local Y-axis.
 * @see https://doc.x3dom.org/author/PointingDeviceSensor/CylinderSensor.html
 */
export const cylindersensor: ElementHelper<CylinderSensorProps>;

export interface BooleanFilterProps extends X3DProps {
  set_boolean?: X3DBool;
  inputFalse?: X3DBool;
  inputTrue?: X3DBool;
  inputNegate?: X3DBool;
}

/**
 * filters Boolean events, allowing for selective routing of TRUE or FALSE values and negation.
 * @see https://doc.x3dom.org/author/EventUtilities/BooleanFilter.html
 */
export const booleanfilter: ElementHelper<BooleanFilterProps>;

export interface BooleanSequencerProps extends X3DProps {
  keyValue?: any;
}

/**
 * BooleanSequencer generates sequential value_changed events selected from the keyValue field when driven from a TimeSensor clock. Among other actions, it can enable/disable lights and sensors, or bind/unbind viewpoints and other X3DBindableNode nodes using set_bind events.
 * @see https://doc.x3dom.org/author/EventUtilities/BooleanSequencer.html
 */
export const booleansequencer: ElementHelper<BooleanSequencerProps>;

export interface BooleanToggleProps extends X3DProps {
  set_boolean?: X3DBool;
  toggle?: X3DBool;
}

/**
 * stores and toggles boolean value
 * @see https://doc.x3dom.org/author/EventUtilities/BooleanToggle.html
 */
export const booleantoggle: ElementHelper<BooleanToggleProps>;

export interface BooleanTriggerProps extends X3DProps {
  set_triggerTime?: X3DNumber;
}

/**
 * generates true Boolean events upon receiving time events
 * @see https://doc.x3dom.org/author/EventUtilities/BooleanTrigger.html
 */
export const booleantrigger: ElementHelper<BooleanTriggerProps>;

export interface IntegerSequencerProps extends X3DProps {
  keyValue?: string | X3DNumber[];
}

/**
 * The IntegerSequencer node generates sequential discrete value_changed events selected from the keyValue field in response to each set_fraction, next, or previous event.
 * @see https://doc.x3dom.org/author/EventUtilities/IntegerSequencer.html
 */
export const integersequencer: ElementHelper<IntegerSequencerProps>;

export interface IntegerTriggerProps extends X3DProps {
  set_boolean?: X3DBool;
  integerKey?: X3DNumber;
}

/**
 * generates Integer events upon receiving Boolean events
 * @see https://doc.x3dom.org/author/EventUtilities/IntegerTrigger.html
 */
export const integertrigger: ElementHelper<IntegerTriggerProps>;

export interface TimeTriggerProps extends X3DProps {
  set_boolean?: X3DBool;
}

/**
 * generates Time events upon receiving Boolean events
 * @see https://doc.x3dom.org/author/EventUtilities/TimeTrigger.html
 */
export const timetrigger: ElementHelper<TimeTriggerProps>;

export interface GeoCoordinateProps extends X3DProps {
  point?: string | X3DVec3[];
  geoSystem?: string | string[];
}

/**
 * The GeoCoordinate node specifies a list of coordinates in a spatial reference frame.
 * It is used in the coord field of vertex-based geometry nodes including IndexedFaceSet, IndexedLineSet, and PointSet.
 * @see https://doc.x3dom.org/author/Geospatial/GeoCoordinate.html
 */
export const geocoordinate: ElementHelper<GeoCoordinateProps>;

export interface GeoElevationGridProps extends X3DProps {
  geoSystem?: string | string[];
  geoGridOrigin?: X3DVec3;
  height?: string | X3DNumber[];
  ccw?: X3DBool;
  creaseAngle?: X3DNumber;
  xDimension?: X3DNumber;
  xSpacing?: X3DNumber;
  yScale?: X3DNumber;
  zDimension?: X3DNumber;
  zSpacing?: X3DNumber;
  lit?: X3DBool;
}

/**
 * The GeoElevationGrid node specifies a uniform grid of elevation values within some spatial reference frame.
 * These are then transparently transformed into a geocentric, curved-earth representation.
 * @see https://doc.x3dom.org/author/Geospatial/GeoElevationGrid.html
 */
export const geoelevationgrid: ElementHelper<GeoElevationGridProps>;

export interface GeoLODProps extends X3DProps {
  geoSystem?: string | string[];
  rootUrl?: string | string[];
  child1Url?: string | string[];
  child2Url?: string | string[];
  child3Url?: string | string[];
  child4Url?: string | string[];
  range?: X3DNumber;
  level_changed?: X3DNumber;
  referenceBindableDescription?: string;
  center?: X3DVec3;
}

/**
 * The GeoLOD node provides a terrain-specialized form of the LOD node.
 * It is a grouping node that specifies two different levels of detail for an object using a tree structure, where 0 to 4 children can be specified, and also efficiently manages the loading and unloading of these levels of detail.
 * @see https://doc.x3dom.org/author/Geospatial/GeoLOD.html
 */
export const geolod: ElementHelper<GeoLODProps>;

export interface GeoLocationProps extends X3DProps {
  geoSystem?: string | string[];
  geoCoords?: any;
}

/**
 * The GeoLocation node provides the ability to geo-reference any standard X3D model.
 * That is, to take an ordinary X3D model, contained within the children of the node, and to specify its geospatial location.
 * This node is a grouping node that can be thought of as a Transform node.
 * However, the GeoLocation node specifies an absolute location, not a relative one, so content developers should not nest GeoLocation nodes within each other.
 * @see https://doc.x3dom.org/author/Geospatial/GeoLocation.html
 */
export const geolocation: ElementHelper<GeoLocationProps>;

export interface GeoMetadataProps extends X3DProps {
  url?: string | string[];
  summary?: string | string[];
}

/**
 * The GeoMetadata node supports the specification of metadata describing any number of geospatial nodes.
 * This is similar to a WorldInfo node, but specifically for describing geospatial information.
 * @see https://doc.x3dom.org/author/Geospatial/GeoMetadata.html
 */
export const geometadata: ElementHelper<GeoMetadataProps>;

export interface GeoOriginProps extends X3DProps {
  geoSystem?: string | string[];
  geoCoords?: any;
  rotateYUp?: X3DBool;
}

/**
 * The GeoOrigin node defines an absolute geospatial location and an implicit local coordinate frame against which geometry is referenced.
 * This node is used to translate from geographical coordinates into a local Cartesian coordinate system which can be managed by the X3D browser. This node is deprecated as of X3D 3.3
 * @see https://doc.x3dom.org/author/Geospatial/GeoOrigin.html
 */
export const geoorigin: ElementHelper<GeoOriginProps>;

export interface GeoPositionInterpolatorProps extends X3DProps {
  geoSystem?: string | string[];
  keyValue?: string | X3DVec3[];
  onGreatCircle?: X3DBool;
}

/**
 * The GeoPositionInterpolator node provides an interpolator capability where key values are specified in geographic coordinates and the interpolation is performed within the specified spatial reference frame.
 * @see https://doc.x3dom.org/author/Geospatial/GeoPositionInterpolator.html
 */
export const geopositioninterpolator: ElementHelper<GeoPositionInterpolatorProps>;

export interface GeoTransformProps extends X3DProps {
  geoCenter?: any;
  rotation?: X3DRotation;
  scale?: X3DVec3;
  scaleOrientation?: X3DRotation;
  translation?: X3DVec3;
  geoSystem?: string | string[];
  globalGeoOrigin?: X3DBool;
}

/**
 * The GeoTransform node is a grouping node that defines a coordinate system for its children to support the translation and orientation of geometry built using GeoCoordinate nodes within the local world coordinate system.
 * The X-Z plane of a GeoTransform coordinate system is tangent to the ellipsoid of the spatial reference frame at the location specified by the geoCenter field.
 * @see https://doc.x3dom.org/author/Geospatial/GeoTransform.html
 */
export const geotransform: ElementHelper<GeoTransformProps>;

export interface GeoViewpointProps extends X3DProps {
  geoSystem?: string | string[];
  fieldOfView?: X3DNumber;
  orientation?: X3DRotation;
  centerOfRotation?: X3DVec3;
  position?: any;
  headlight?: X3DBool;
  navType?: string | string[];
  speedFactor?: X3DNumber;
  zNear?: X3DNumber;
  zFar?: X3DNumber;
  elevationScaling?: X3DBool;
}

/**
 * The GeoViewpoint node allows the specification of a viewpoint in terms of a geospatial coordinate.
 * This node can be used wherever a Viewpoint node can be used and can be combined with Viewpoint nodes in the same scene.
 * @see https://doc.x3dom.org/author/Geospatial/GeoViewpoint.html
 */
export const geoviewpoint: ElementHelper<GeoViewpointProps>;

export interface ScreenGroupProps extends X3DProps {
}

/**
 * Add a class description here.
 * @see https://doc.x3dom.org/author/Layout/ScreenGroup.html
 */
export const screengroup: ElementHelper<ScreenGroupProps>;

export interface Arc2DProps extends X3DProps {
  radius?: X3DNumber;
  startAngle?: X3DNumber;
  endAngle?: X3DNumber;
  subdivision?: X3DNumber;
}

/**
 * The Arc node specifies a linear circular arc whose center is at (0,0) and whose angles are
 *  measured starting at the positive x-axis and sweeping towards the positive y-axis.
 * @see https://doc.x3dom.org/author/Geometry2D/Arc2D.html
 */
export const arc2d: ElementHelper<Arc2DProps>;

export interface ArcClose2DProps extends X3DProps {
  closureType?: string;
  radius?: X3DNumber;
  startAngle?: X3DNumber;
  endAngle?: X3DNumber;
  subdivision?: X3DNumber;
}

/**
 * The ArcClose node specifies a portion of a circle whose center is at (0,0) and whose angles are
 *  measured starting at the positive x-axis and sweeping towards the positive y-axis.
 * @see https://doc.x3dom.org/author/Geometry2D/ArcClose2D.html
 */
export const arcclose2d: ElementHelper<ArcClose2DProps>;

export interface Circle2DProps extends X3DProps {
  radius?: X3DNumber;
  subdivision?: X3DNumber;
}

/**
 * The Circle2D node specifies a circle centred at (0,0) in the local 2D coordinate system.
 * @see https://doc.x3dom.org/author/Geometry2D/Circle2D.html
 */
export const circle2d: ElementHelper<Circle2DProps>;

export interface Disk2DProps extends X3DProps {
  innerRadius?: X3DNumber;
  outerRadius?: X3DNumber;
  subdivision?: X3DNumber;
}

/**
 * The Disk2D node specifies a circular disk which is centred at (0, 0) in the local coordinate
 *  system. If innerRadius is equal to outerRadius, a solid circular line shall be drawn using the current line
 *  properties. If innerRadius is zero, the Disk2D is completely filled. Otherwise, the area within the
 *  innerRadius forms a hole in the Disk2D.
 * @see https://doc.x3dom.org/author/Geometry2D/Disk2D.html
 */
export const disk2d: ElementHelper<Disk2DProps>;

export interface Polyline2DProps extends X3DProps {
  lineSegments?: string | X3DVec2[];
}

/**
 * The Polyline2D node specifies a series of contiguous line segments in the local 2D coordinate
 *  system connecting the specified vertices.
 * @see https://doc.x3dom.org/author/Geometry2D/Polyline2D.html
 */
export const polyline2d: ElementHelper<Polyline2DProps>;

export interface Polypoint2DProps extends X3DProps {
  point?: string | X3DVec2[];
}

/**
 * The Polyline2D node specifies a set of vertices in the local 2D coordinate system at each of which
 *  is displayed a point.
 * @see https://doc.x3dom.org/author/Geometry2D/Polypoint2D.html
 */
export const polypoint2d: ElementHelper<Polypoint2DProps>;

export interface Rectangle2DProps extends X3DProps {
  size?: X3DVec2;
  subdivision?: X3DVec2;
}

/**
 * The Rectangle2D node specifies a rectangle centred at (0, 0) in the current local 2D coordinate
 *  system and aligned with the local coordinate axes. By default, the box measures 2 units in each dimension,
 *  from -1 to +1.
 * @see https://doc.x3dom.org/author/Geometry2D/Rectangle2D.html
 */
export const rectangle2d: ElementHelper<Rectangle2DProps>;

export interface TriangleSet2DProps extends X3DProps {
  vertices?: string | X3DVec2[];
}

/**
 * The TriangleSet2D node specifies a set of triangles in the local 2D coordinate system.
 * @see https://doc.x3dom.org/author/Geometry2D/TriangleSet2D.html
 */
export const triangleset2d: ElementHelper<TriangleSet2DProps>;

export interface BlendedVolumeStyleProps extends X3DProps {
  weightConstant1?: X3DNumber;
  weightConstant2?: X3DNumber;
  weightFunction1?: string;
  weightFunction2?: string;
}

/**
 * The BlendedVolumeStyle node allows to blend the parent volume data with a second specified volume data using a weight function.
 * @see https://doc.x3dom.org/author/VolumeRendering/BlendedVolumeStyle.html
 */
export const blendedvolumestyle: ElementHelper<BlendedVolumeStyleProps>;

export interface BoundaryEnhancementVolumeStyleProps extends X3DProps {
  retainedOpacity?: X3DNumber;
  boundaryOpacity?: X3DNumber;
  opacityFactor?: X3DNumber;
}

/**
 * The BoundaryEnhancementVolumeStyle node specifies that the boundaries of the volume data shall be enhanced. The rendering is performed based on the gradient magnitude.
 * Areas where density varies are made more visible than areas of constant density.
 * @see https://doc.x3dom.org/author/VolumeRendering/BoundaryEnhancementVolumeStyle.html
 */
export const boundaryenhancementvolumestyle: ElementHelper<BoundaryEnhancementVolumeStyleProps>;

export interface CartoonVolumeStyleProps extends X3DProps {
  parallelColor?: X3DColor;
  orthogonalColor?: X3DColor;
  colorSteps?: X3DNumber;
}

/**
 * The CartoonVolumeStyle node specifies that the associated volume data shall be rendered with a cartoon style non-photorealistic rendering.
 * The cartoon styles uses two colors the rendering will depend on the local surface normals and the view direction.
 * @see https://doc.x3dom.org/author/VolumeRendering/CartoonVolumeStyle.html
 */
export const cartoonvolumestyle: ElementHelper<CartoonVolumeStyleProps>;

export interface ComposedVolumeStyleProps extends X3DProps {
}

/**
 * The ComposedVolumeStyle node is used to compose multiple rendering styles into a single-rendering pass.
 * The styles are applied in the same order they are defined on the scene tree.
 * @see https://doc.x3dom.org/author/VolumeRendering/ComposedVolumeStyle.html
 */
export const composedvolumestyle: ElementHelper<ComposedVolumeStyleProps>;

export interface EdgeEnhancementVolumeStyleProps extends X3DProps {
  edgeColor?: X3DColor;
  gradientThreshold?: X3DNumber;
}

/**
 * <edgeenhancementvolumestyle> node (X3DOM VolumeRendering component).
 * @see https://doc.x3dom.org/author/VolumeRendering/EdgeEnhancementVolumeStyle.html
 */
export const edgeenhancementvolumestyle: ElementHelper<EdgeEnhancementVolumeStyleProps>;

export interface IsoSurfaceVolumeDataProps extends X3DProps {
  surfaceValues?: string | X3DNumber[];
  contourStepSize?: X3DNumber;
  surfaceTolerance?: X3DNumber;
}

/**
 * The IsoSurfaceVolumeData node specifies one or more surfaces to be extracted from the volume data.
 * @see https://doc.x3dom.org/author/VolumeRendering/IsoSurfaceVolumeData.html
 */
export const isosurfacevolumedata: ElementHelper<IsoSurfaceVolumeDataProps>;

export interface MPRVolumeStyleProps extends X3DProps {
  forceOpaque?: X3DBool;
}

/**
 * The MPRVolumeStyle node renders a multiplanar reconstruction of the assocciated volume data.
 * @see https://doc.x3dom.org/author/VolumeRendering/MPRVolumeStyle.html
 */
export const mprvolumestyle: ElementHelper<MPRVolumeStyleProps>;

export interface MPRPlaneProps extends X3DProps {
  enabled?: X3DBool;
  normal?: X3DVec3;
  position?: X3DNumber;
}

/**
 * class for defining an arbitrary plane for the MPRVolumeStyle.
 * @see https://doc.x3dom.org/author/VolumeRendering/MPRPlane.html
 */
export const mprplane: ElementHelper<MPRPlaneProps>;

export interface OpacityMapVolumeStyleProps extends X3DProps {
  type?: string;
  opacityFactor?: X3DNumber;
  lightFactor?: X3DNumber;
}

/**
 * <opacitymapvolumestyle> node (X3DOM VolumeRendering component).
 * @see https://doc.x3dom.org/author/VolumeRendering/OpacityMapVolumeStyle.html
 */
export const opacitymapvolumestyle: ElementHelper<OpacityMapVolumeStyleProps>;

export interface ProjectionVolumeStyleProps extends X3DProps {
  intensityThreshold?: X3DNumber;
  type?: string;
}

/**
 * The ProjectionVolumeStyle node generates an output color based on the voxel data values traversed by a ray following the view direction.
 * @see https://doc.x3dom.org/author/VolumeRendering/ProjectionVolumeStyle.html
 */
export const projectionvolumestyle: ElementHelper<ProjectionVolumeStyleProps>;

export interface SegmentedVolumeDataProps extends X3DProps {
  numberOfMaxSegments?: X3DNumber;
}

/**
 * The SegmentedVolumeData node specifies a segmented volume data set. Each segment can be rendered with a different volume rendering style.
 * @see https://doc.x3dom.org/author/VolumeRendering/SegmentedVolumeData.html
 */
export const segmentedvolumedata: ElementHelper<SegmentedVolumeDataProps>;

export interface ShadedVolumeStyleProps extends X3DProps {
  lighting?: X3DBool;
  shadows?: X3DBool;
  phaseFunction?: string;
}

/**
 * The ShadedVolumeStyle node applies the Blinn-Phong illumination model to the assocciated volume data.
 * The light and fog parameters are obtained from the parent Appearence node.
 * @see https://doc.x3dom.org/author/VolumeRendering/ShadedVolumeStyle.html
 */
export const shadedvolumestyle: ElementHelper<ShadedVolumeStyleProps>;

export interface SilhouetteEnhancementVolumeStyleProps extends X3DProps {
  silhouetteBoundaryOpacity?: X3DNumber;
  silhouetteRetainedOpacity?: X3DNumber;
  silhouetteSharpness?: X3DNumber;
}

/**
 * The SilhouetteEnhancementVolumeStyle node specifies that silhouettes of the assocciated volume data are going to be enhanced.
 * Voxels opacity are modified based on their normals orientation relative to the view direction. When the normal orientation is perpendicular towards the view direction,
 * voxels are darkened, whereas when it is parallel towards the view direction, the opacity is not enhanced.
 * @see https://doc.x3dom.org/author/VolumeRendering/SilhouetteEnhancementVolumeStyle.html
 */
export const silhouetteenhancementvolumestyle: ElementHelper<SilhouetteEnhancementVolumeStyleProps>;

export interface StippleVolumeStyleProps extends X3DProps {
  distanceFactor?: X3DNumber;
  interiorFactor?: X3DNumber;
  lightingFactor?: X3DNumber;
  gradientThreshold?: X3DNumber;
  gradientRetainedOpacity?: X3DNumber;
  gradientBoundaryOpacity?: X3DNumber;
  gradientOpacityFactor?: X3DNumber;
  silhouetteRetainedOpacity?: X3DNumber;
  silhouetteBoundaryOpacity?: X3DNumber;
  silhouetteOpacityFactor?: X3DNumber;
  resolutionFactor?: X3DNumber;
}

/**
 * NYI!!
 * @see https://doc.x3dom.org/author/VolumeRendering/StippleVolumeStyle.html
 */
export const stipplevolumestyle: ElementHelper<StippleVolumeStyleProps>;

export interface ToneMappedVolumeStyleProps extends X3DProps {
  coolColor?: X3DColor;
  warmColor?: X3DColor;
}

/**
 * The ToneMappedVolumeStyle node specifies that the associated volume rendering data is going to be rendered following the Gooch et. al. shading model.
 * Two colors are used: warm and cool to shade the volume data based on the light direction.
 * @see https://doc.x3dom.org/author/VolumeRendering/ToneMappedVolumeStyle.html
 */
export const tonemappedvolumestyle: ElementHelper<ToneMappedVolumeStyleProps>;

export interface RadarVolumeStyleProps extends X3DProps {
  type?: string;
  opacityFactor?: X3DNumber;
  lightFactor?: X3DNumber;
}

/**
 * <radarvolumestyle> node (X3DOM VolumeRendering component).
 * @see https://doc.x3dom.org/author/VolumeRendering/RadarVolumeStyle.html
 */
export const radarvolumestyle: ElementHelper<RadarVolumeStyleProps>;

export interface VolumeDataProps extends X3DProps {
}

/**
 * The VolumeData node specifies a non-segmented volume data to be rendered with a volume rendering style.
 * @see https://doc.x3dom.org/author/VolumeRendering/VolumeData.html
 */
export const volumedata: ElementHelper<VolumeDataProps>;

export interface IndexedQuadSetProps extends X3DProps {
  index?: string | X3DNumber[];
}

/**
 * The IndexedQuadSet node represents a 3D shape composed of a collection of individual
 * quadrilaterals (quads).
 * @see https://doc.x3dom.org/author/CADGeometry/IndexedQuadSet.html
 */
export const indexedquadset: ElementHelper<IndexedQuadSetProps>;

export interface QuadSetProps extends X3DProps {
}

/**
 * The QuadSet node represents a 3D shape that represents a collection of individual planar
 * quadrilaterals.
 * @see https://doc.x3dom.org/author/CADGeometry/QuadSet.html
 */
export const quadset: ElementHelper<QuadSetProps>;

export interface CADLayerProps extends X3DProps {
  name?: string;
}

/**
 * The CADLayer node defines a hierarchy of nodes used for showing layer structure for the CAD model.
 * @see https://doc.x3dom.org/author/CADGeometry/CADLayer.html
 */
export const cadlayer: ElementHelper<CADLayerProps>;

export interface CADAssemblyProps extends X3DProps {
  name?: string;
}

/**
 * The CADAssembly node holds a set of assemblies or parts grouped together.
 * @see https://doc.x3dom.org/author/CADGeometry/CADAssembly.html
 */
export const cadassembly: ElementHelper<CADAssemblyProps>;

export interface CADPartProps extends X3DProps {
  name?: string;
}

/**
 * The CADPart node is a grouping node that defines a coordinate system for its children that is
 * relative to the coordinate systems of its ancestors.
 * @see https://doc.x3dom.org/author/CADGeometry/CADPart.html
 */
export const cadpart: ElementHelper<CADPartProps>;

export interface CADFaceProps extends X3DProps {
  name?: string;
}

/**
 * The CADFace node holds the geometry representing a face of a part.
 * @see https://doc.x3dom.org/author/CADGeometry/CADFace.html
 */
export const cadface: ElementHelper<CADFaceProps>;

export interface PatchProps extends X3DProps {
  size?: X3DVec2;
  subdivision?: X3DVec2;
  center?: X3DVec3;
  primType?: string | string[];
}

/**
 * The Patch node is used by the BVHRefiner.
 * @see https://doc.x3dom.org/author/BVHRefiner/Patch.html
 */
export const patch: ElementHelper<PatchProps>;

export interface BVHRefinerProps extends X3DProps {
  factor?: X3DNumber;
  maxDepth?: X3DNumber;
  minDepth?: X3DNumber;
  smoothLoading?: X3DNumber;
  interactionDepth?: X3DNumber;
  size?: X3DVec2;
  octSize?: X3DVec3;
  subdivision?: X3DVec2;
  url?: string;
  elevationUrl?: string;
  textureUrl?: string;
  normalUrl?: string;
  mode?: string;
  subMode?: string;
  elevationFormat?: string;
  textureFormat?: string;
  normalFormat?: string;
  maxElevation?: X3DNumber;
  useNormals?: X3DBool;
  lit?: X3DBool;
  bvhCount?: X3DNumber;
}

/**
 * The node handles wmts conform datasets like e.g. terrain-data, city-data, point-clouds etc.
 * @see https://doc.x3dom.org/author/BVHRefiner/BVHRefiner.html
 */
export const bvhrefiner: ElementHelper<BVHRefinerProps>;

export interface SnoutProps extends X3DProps {
  dbottom?: X3DNumber;
  dtop?: X3DNumber;
  height?: X3DNumber;
  xoff?: X3DNumber;
  yoff?: X3DNumber;
  bottom?: X3DBool;
  top?: X3DBool;
  subdivision?: X3DNumber;
}

/**
 * Describes a snout shape
 * @see https://doc.x3dom.org/author/Geometry3DExt/Snout.html
 */
export const snout: ElementHelper<SnoutProps>;

export interface DishProps extends X3DProps {
  diameter?: X3DNumber;
  height?: X3DNumber;
  radius?: X3DNumber;
  bottom?: X3DBool;
  subdivision?: X3DVec2;
}

/**
 * <dish> node (X3DOM Geometry3DExt component).
 * @see https://doc.x3dom.org/author/Geometry3DExt/Dish.html
 */
export const dish: ElementHelper<DishProps>;

export interface PyramidProps extends X3DProps {
  xbottom?: X3DNumber;
  ybottom?: X3DNumber;
  xtop?: X3DNumber;
  ytop?: X3DNumber;
  height?: X3DNumber;
  xoff?: X3DNumber;
  yoff?: X3DNumber;
}

/**
 * Describes a pyramid shape.
 * @see https://doc.x3dom.org/author/Geometry3DExt/Pyramid.html
 */
export const pyramid: ElementHelper<PyramidProps>;

export interface RectangularTorusProps extends X3DProps {
  innerRadius?: X3DNumber;
  outerRadius?: X3DNumber;
  height?: X3DNumber;
  angle?: X3DNumber;
  caps?: X3DBool;
  subdivision?: X3DNumber;
}

/**
 * Describes a rectangular torus shape.
 * @see https://doc.x3dom.org/author/Geometry3DExt/RectangularTorus.html
 */
export const rectangulartorus: ElementHelper<RectangularTorusProps>;

export interface SlopedCylinderProps extends X3DProps {
  radius?: X3DNumber;
  height?: X3DNumber;
  bottom?: X3DBool;
  top?: X3DBool;
  xtshear?: X3DNumber;
  ytshear?: X3DNumber;
  xbshear?: X3DNumber;
  ybshear?: X3DNumber;
  subdivision?: X3DNumber;
}

/**
 * Describes a sloped cylinder shape
 * @see https://doc.x3dom.org/author/Geometry3DExt/SlopedCylinder.html
 */
export const slopedcylinder: ElementHelper<SlopedCylinderProps>;

export interface NozzleProps extends X3DProps {
  nozzleHeight?: X3DNumber;
  nozzleRadius?: X3DNumber;
  height?: X3DNumber;
  outerRadius?: X3DNumber;
  innerRadius?: X3DNumber;
  subdivision?: X3DNumber;
}

/**
 * This node describes a nozzle shape for a pipe.
 * @see https://doc.x3dom.org/author/Geometry3DExt/Nozzle.html
 */
export const nozzle: ElementHelper<NozzleProps>;

export interface SolidOfRevolutionProps extends X3DProps {
  creaseAngle?: X3DNumber;
  crossSection?: string | X3DVec2[];
  angle?: X3DNumber;
  caps?: X3DBool;
  subdivision?: X3DNumber;
}

/**
 * Describes a SolidOfRevolution shape.
 * @see https://doc.x3dom.org/author/Geometry3DExt/SolidOfRevolution.html
 */
export const solidofrevolution: ElementHelper<SolidOfRevolutionProps>;

export interface SphereSegmentProps extends X3DProps {
  radius?: X3DNumber;
  longitude?: string | X3DNumber[];
  latitude?: string | X3DNumber[];
  stepSize?: X3DVec2;
}

/**
 * Describes a sphere segment shape.
 * @see https://doc.x3dom.org/author/Geometry3DExt/SphereSegment.html
 */
export const spheresegment: ElementHelper<SphereSegmentProps>;

export interface ElevationGridProps extends X3DProps {
  colorPerVertex?: X3DBool;
  normalPerVertex?: X3DBool;
  creaseAngle?: X3DNumber;
  height?: string | X3DNumber[];
  xDimension?: X3DNumber;
  xSpacing?: X3DNumber;
  zDimension?: X3DNumber;
  zSpacing?: X3DNumber;
}

/**
 * The ElevationGrid node specifies a uniform rectangular grid of varying height in the Y=0 plane of the local coordinate system.
 * The geometry is described by a scalar array of height values that specify the height of a surface above each point of the grid.
 * The xDimension and zDimension fields indicate the number of elements of the grid height array in the X and Z directions.
 * Both xDimension and zDimension shall be greater than or equal to zero.
 * If either the xDimension or the zDimension is less than two, the ElevationGrid contains no quadrilaterals.
 * The vertex locations for the rectangles are defined by the height field and the xSpacing and zSpacing fields
 * @see https://doc.x3dom.org/author/Geometry3DExt/ElevationGrid.html
 */
export const elevationgrid: ElementHelper<ElevationGridProps>;

export interface ExtrusionProps extends X3DProps {
  beginCap?: X3DBool;
  endCap?: X3DBool;
  convex?: X3DBool;
  creaseAngle?: X3DNumber;
  crossSection?: string | X3DVec2[];
  orientation?: string | X3DRotation[];
  scale?: string | X3DVec2[];
  spine?: string | X3DVec3[];
  height?: X3DNumber;
}

/**
 * The Extrusion node specifies geometric shapes based on a two dimensional cross-section extruded along a three dimensional spine in the local coordinate system. The cross-section can be scaled and rotated at each spine point to produce a wide variety of shapes.
 * @see https://doc.x3dom.org/author/Geometry3DExt/Extrusion.html
 */
export const extrusion: ElementHelper<ExtrusionProps>;

export interface HAnimDisplacerProps extends X3DProps {
  name?: string;
  weight?: X3DNumber;
  coordIndex?: string | X3DNumber[];
  displacements?: string | X3DVec3[];
}

/**
 * In some cases, the application may need to be able to identify specific groups of vertices within an HAnimSegment.
 * It may also require "hints" as to the direction in which each vertex should move. That information is stored in a node called an HAnimDisplacer.
 * The HAnimDisplacers for a particular HAnimSegment are stored in the displacers field of that HAnimSegment.
 * @see https://doc.x3dom.org/author/H-Anim/HAnimDisplacer.html
 */
export const hanimdisplacer: ElementHelper<HAnimDisplacerProps>;

export interface HAnimJointProps extends X3DProps {
  name?: string;
  limitOrientation?: X3DRotation;
  llimit?: string | X3DNumber[];
  ulimit?: string | X3DNumber[];
  skinCoordIndex?: string | X3DNumber[];
  skinCoordWeight?: string | X3DNumber[];
  stiffness?: string | X3DNumber[];
}

/**
 * Each joint in the body is represented by an HAnimJoint node, which is used to define the relationship of each body segment to its immediate parent.
 * An HAnimJoint may only be a child of another HAnimJoint node or a child within the skeleton field in the case of the HAnimJoint used as a humanoid root (i.e., an HAnimJoint may not be a child of an HAnimSegment).
 * The HAnimJoint node is also used to store other joint-specific information. In particular, a joint name is provided so that applications can identify each HAnimJoint node at run-time.
 * The HAnimJoint node may contain hints for inverse-kinematics systems that wish to control the H-Anim figure.
 * These hints include the upper and lower joint limits, the orientation of the joint limits, and a stiffness/resistance value.
 * @see https://doc.x3dom.org/author/H-Anim/HAnimJoint.html
 */
export const hanimjoint: ElementHelper<HAnimJointProps>;

export interface HAnimSegmentProps extends X3DProps {
  name?: string;
  centerOfMass?: X3DVec3;
  mass?: X3DNumber;
  momentsOfInertia?: string | X3DNumber[];
}

/**
 * Each body segment is stored in an HAnimSegment node.
 * The HAnimSegment node is a grouping node that will typically contain either a number of Shape nodes or perhaps Transform nodes that position the body part within its coordinate system.
 * @see https://doc.x3dom.org/author/H-Anim/HAnimSegment.html
 */
export const hanimsegment: ElementHelper<HAnimSegmentProps>;

export interface HAnimSiteProps extends X3DProps {
  name?: string;
}

/**
 * An HAnimSite node serves three purposes. The first is to define an "end effecter" location that can be used by an inverse kinematics system.
 * The second is to define an attachment point for accessories such as jewelry and clothing.
 * The third is to define a location for a virtual camera in the reference frame of an HAnimSegment (such as a view "through the eyes" of the humanoid for use in multi-user worlds).
 * @see https://doc.x3dom.org/author/H-Anim/HAnimSite.html
 */
export const hanimsite: ElementHelper<HAnimSiteProps>;

export interface HAnimHumanoidProps extends X3DProps {
  name?: string;
  version?: string;
  info?: string | string[];
  skeletalConfiguration?: string;
  jointBindingPositions?: string | X3DVec3[];
  jointBindingRotations?: string | X3DRotation[];
  jointBindingScales?: string | X3DVec3[];
  skinBindingCoords?: string | X3DVec3[];
  skinBindingNormals?: string | X3DVec3[];
}

/**
 * The HAnimHumanoid node is used to store human-readable data such as author and copyright information, as well as to store references to the HAnimJoint, HAnimSegment, and HAnimSite nodes in addition to serving as a container for the entire humanoid.
 * Thus, it serves as a central node for moving the humanoid through its environment.
 * @see https://doc.x3dom.org/author/H-Anim/HAnimHumanoid.html
 */
export const hanimhumanoid: ElementHelper<HAnimHumanoidProps>;

export interface NurbsPatchSurfaceProps extends X3DProps {
}

/**
 * The NurbsPatchSurface node is a contiguous NURBS surface patch.
 * @see https://doc.x3dom.org/author/NURBS/NurbsPatchSurface.html
 */
export const nurbspatchsurface: ElementHelper<NurbsPatchSurfaceProps>;

export interface NurbsCurveProps extends X3DProps {
  order?: X3DNumber;
  knot?: string | X3DNumber[];
  weight?: string | X3DNumber[];
  tessellation?: X3DNumber;
  closed?: X3DBool;
}

/**
 * The NurbsCurve node is a geometry node defining a parametric curve in 3D space.
 * @see https://doc.x3dom.org/author/NURBS/NurbsCurve.html
 */
export const nurbscurve: ElementHelper<NurbsCurveProps>;

export interface NurbsPositionInterpolatorProps extends X3DProps {
  order?: X3DNumber;
  knot?: string | X3DNumber[];
  weight?: string | X3DNumber[];
  set_fraction?: X3DNumber;
}

/**
 * NurbsPositionInterpolator describes a 3D NURBS curve.
 * @see https://doc.x3dom.org/author/NURBS/NurbsPositionInterpolator.html
 */
export const nurbspositioninterpolator: ElementHelper<NurbsPositionInterpolatorProps>;

export interface NurbsOrientationInterpolatorProps extends X3DProps {
  order?: X3DNumber;
  knot?: string | X3DNumber[];
  weight?: string | X3DNumber[];
  set_fraction?: X3DNumber;
}

/**
 * NurbsOrientationInterpolator describes a 3D NURBS curve.
 * @see https://doc.x3dom.org/author/NURBS/NurbsOrientationInterpolator.html
 */
export const nurbsorientationinterpolator: ElementHelper<NurbsOrientationInterpolatorProps>;

export interface NurbsSurfaceInterpolatorProps extends X3DProps {
  uDimension?: X3DNumber;
  vDimension?: X3DNumber;
  uKnot?: string | X3DNumber[];
  vKnot?: string | X3DNumber[];
  uOrder?: X3DNumber;
  vOrder?: X3DNumber;
  weight?: string | X3DNumber[];
  set_fraction?: X3DVec2;
}

/**
 * NurbsPositionInterpolator describes a 3D NURBS curve.
 * @see https://doc.x3dom.org/author/NURBS/NurbsSurfaceInterpolator.html
 */
export const nurbssurfaceinterpolator: ElementHelper<NurbsSurfaceInterpolatorProps>;

export interface NurbsCurve2DProps extends X3DProps {
  order?: X3DNumber;
  knot?: string | X3DNumber[];
  controlPoint?: string | X3DVec2[];
  weight?: string | X3DNumber[];
  closed?: X3DBool;
}

/**
 * The NurbsCurve2D node defines a trimming segment that is part of a trimming contour
 *  in the u,v domain of the surface. NurbsCurve2D nodes are used as children of the Contour2D group.
 * @see https://doc.x3dom.org/author/NURBS/NurbsCurve2D.html
 */
export const nurbscurve2d: ElementHelper<NurbsCurve2DProps>;

export interface NurbsTrimmedSurfaceProps extends X3DProps {
}

/**
 * The NurbsTrimmedSurface node defines a NURBS surface that is trimmed by a set of trimming loops.
 * @see https://doc.x3dom.org/author/NURBS/NurbsTrimmedSurface.html
 */
export const nurbstrimmedsurface: ElementHelper<NurbsTrimmedSurfaceProps>;

export interface ContourPolyline2DProps extends X3DProps {
  controlPoint?: string | X3DVec2[];
}

/**
 * The ContourPolyline2D node defines a piecewise linear curve segment as a part of a
 *  trimming contour in the u,v domain of a surface.
 * @see https://doc.x3dom.org/author/NURBS/ContourPolyline2D.html
 */
export const contourpolyline2d: ElementHelper<ContourPolyline2DProps>;

export interface Contour2DProps extends X3DProps {
}

/**
 * The Contour2D node groups a set of curve segments to a composite contour. The children form a closed loop.
 *  The 2D coordinates used by the node shall be interpreted to lie in the (u, v) coordinate space defined by the NURBS surface.
 * @see https://doc.x3dom.org/author/NURBS/Contour2D.html
 */
export const contour2d: ElementHelper<Contour2DProps>;
