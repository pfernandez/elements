/**
 * Abstract base types for X3D nodes (not tag helpers).
 *
 * These are exported as `type` aliases to enable typing and documentation lookups,
 * without implying that each base type is a concrete tag helper.
 *
 * Descriptions are sourced from the X3DOM project’s node JSDoc (when available).
 */

type X3DBaseNode = [tag: string, props: Record<string, any>, ...children: any[]];

/**
 * This abstract node type is the base type for all nodes in the X3D system.
 * @see https://doc.x3dom.org/author/Core/X3DNode.html
 */
export type X3DNode = X3DBaseNode;

/**
 * This abstract interface is the basis for all metadata nodes. The interface is inherited by
 * all metadata nodes.
 * @see https://doc.x3dom.org/author/Core/X3DMetadataObject.html
 */
export type X3DMetadataObject = X3DNode;

/**
 * This abstract node type indicates that the concrete nodes that are instantiated based on it may
 * be used in children, addChildren, and removeChildren fields.
 * @see https://doc.x3dom.org/author/Core/X3DChildNode.html
 */
export type X3DChildNode = X3DNode;

/**
 * X3DBindableNode is the abstract base type for all bindable children nodes.
 * @see https://doc.x3dom.org/author/Core/X3DBindableNode.html
 */
export type X3DBindableNode = X3DNode;

/**
 * This is the base node type for all nodes that contain only information without visual semantics.
 * @see https://doc.x3dom.org/author/Core/X3DInfoNode.html
 */
export type X3DInfoNode = X3DNode;

/**
 * This abstract node type is the base type for all sensors.
 * @see https://doc.x3dom.org/author/Core/X3DSensorNode.html
 */
export type X3DSensorNode = X3DNode;

/**
 * This abstract node type is the basis for all node types that have bounds specified as part of
 * the definition. The bboxCenter and bboxSize fields specify a bounding box that encloses the grouping node's
 * children. This is a hint that may be used for optimization purposes.
 * @see https://doc.x3dom.org/author/Grouping/X3DBoundedObject.html
 */
export type X3DBoundedObject = X3DNode;

/**
 * This abstract node type indicates that concrete node types derived from it contain children nodes
 * and is the basis for all aggregation.
 * @see https://doc.x3dom.org/author/Grouping/X3DGroupingNode.html
 */
export type X3DGroupingNode = X3DNode;

/**
 * This abstract node type is the basis for all node types that group and transform their children.
 * @see https://doc.x3dom.org/author/Grouping/X3DTransformNode.html
 */
export type X3DTransformNode = X3DNode;

/**
 * This is the base node type for all geometry in X3D.
 * @see https://doc.x3dom.org/author/Rendering/X3DGeometryNode.html
 */
export type X3DGeometryNode = X3DNode;

/**
 * This is the base node type for all composed 3D geometry in X3D.
 * A composed geometry node type defines an abstract type that composes geometry from a set of nodes that define individual components.
 * Composed geometry may have color, coordinates, normal and texture coordinates supplied.
 * The rendered output of the combination of these is dependent on the concrete node definition.
 * @see https://doc.x3dom.org/author/Rendering/X3DComposedGeometryNode.html
 */
export type X3DComposedGeometryNode = X3DNode;

/**
 * This is the base node type for all geometric property node types defined in X3D.
 * @see https://doc.x3dom.org/author/Rendering/X3DGeometricPropertyNode.html
 */
export type X3DGeometricPropertyNode = X3DNode;

/**
 * This is the base node type for all coordinate node types in X3D.
 * All coordinates are specified in nodes derived from this abstract node type.
 * @see https://doc.x3dom.org/author/Rendering/X3DCoordinateNode.html
 */
export type X3DCoordinateNode = X3DNode;

/**
 * This is the base node type for color specifications in X3D.
 * @see https://doc.x3dom.org/author/Rendering/X3DColorNode.html
 */
export type X3DColorNode = X3DNode;

/**
 * This is the base node type for all Appearance nodes.
 * @see https://doc.x3dom.org/author/Shape/X3DAppearanceNode.html
 */
export type X3DAppearanceNode = X3DNode;

/**
 * This is the base node type for the child nodes of the X3DAppearanceNode type.
 * @see https://doc.x3dom.org/author/Shape/X3DAppearanceChildNode.html
 */
export type X3DAppearanceChildNode = X3DNode;

/**
 * This is the base node type for all Material nodes.
 * @see https://doc.x3dom.org/author/Shape/X3DMaterialNode.html
 */
export type X3DMaterialNode = X3DNode;

/**
 * This is the base node type for all Shape nodes.
 * @see https://doc.x3dom.org/author/Shape/X3DShapeNode.html
 */
export type X3DShapeNode = X3DNode;

/**
 * The X3DLightNode abstract node type is the base type from which all node types that serve as light sources are derived.
 * @see https://doc.x3dom.org/author/Lighting/X3DLightNode.html
 */
export type X3DLightNode = X3DNode;

/**
 * An X3DFollowerNode maintains an internal state that consists of a current value and a destination
 *  value. Both values are of the same data type into which the term [S|M]F<type> evaluatesfor a given
 *  specialization. It is the 'data type of the node'. In certain cases of usage, the terms input and output fit
 *  better for destination value and current value, respectively.
 *  Whenever the current value differs from the destination value, the current value gradually changes until it
 *  reaches the destination value producing a smooth transition. It generally moves towards the destination
 *  value but, if a transition triggered by a prevous destination value is still in progress, it may take a
 *  short while until the movement becomes a movement towards the new destination value.
 * @see https://doc.x3dom.org/author/Followers/X3DFollowerNode.html
 */
export type X3DFollowerNode = X3DNode;

/**
 * The X3DChaserNode abstract node type calculates the output on value_changed as a finite impulse
 *  response (FIR).
 * @see https://doc.x3dom.org/author/Followers/X3DChaserNode.html
 */
export type X3DChaserNode = X3DNode;

/**
 * The X3DDamperNode abstract node type creates an IIR response that approaches the destination
 *  value according to the shape of the e-function only asymptotically but very quickly. An X3DDamperNode node
 *  is parameterized by the tau, order and tolerance fields. Internally, it consists of a set of linear
 *  first-order filters each of which processes the output of the previous filter.
 * @see https://doc.x3dom.org/author/Followers/X3DDamperNode.html
 */
export type X3DDamperNode = X3DNode;

/**
 * The abstract node X3DInterpolatorNode forms the basis for all types of interpolators.
 * @see https://doc.x3dom.org/author/Interpolation/X3DInterpolatorNode.html
 */
export type X3DInterpolatorNode = X3DNode;

/**
 * This abstract node type is the base node type from which all time-dependent nodes are derived.
 * @see https://doc.x3dom.org/author/Time/X3DTimeDependentNode.html
 */
export type X3DTimeDependentNode = X3DNode;

/**
 * X3DBackgroundNode is the abstract type from which all backgrounds inherit. X3DBackgroundNode is a
 * bindable node that, when bound, defines the panoramic background for the scene.
 * @see https://doc.x3dom.org/author/EnvironmentalEffects/X3DBackgroundNode.html
 */
export type X3DBackgroundNode = X3DNode;

/**
 * X3DFogObject is the abstract type that describes a node that influences the lighting equation
 * through the use of fog semantics.
 * @see https://doc.x3dom.org/author/EnvironmentalEffects/X3DFogNode.html
 */
export type X3DFogNode = X3DNode;

/**
 * Base class for environment nodes
 * @see https://doc.x3dom.org/author/EnvironmentalEffects/X3DEnvironmentNode.html
 */
export type X3DEnvironmentNode = X3DNode;

/**
 * A node of node type X3DViewpointNode defines a specific location in the local coordinate system from which the user may view the scene.
 * @see https://doc.x3dom.org/author/Navigation/X3DViewpointNode.html
 */
export type X3DViewpointNode = X3DNode;

/**
 * Abstract base node type.
 * @see https://doc.x3dom.org/author/Navigation/X3DNavigationInfoNode.html
 */
export type X3DNavigationInfoNode = X3DNode;

/**
 * Abstract base node type.
 * @see https://doc.x3dom.org/author/Navigation/X3DLODNode.html
 */
export type X3DLODNode = X3DNode;

/**
 * This abstract node type is the base node type for all font style nodes.
 * @see https://doc.x3dom.org/author/Text/X3DFontStyleNode.html
 */
export type X3DFontStyleNode = X3DNode;

/**
 * Abstract base node type.
 * @see https://doc.x3dom.org/author/Sound/X3DSoundNode.html
 */
export type X3DSoundNode = X3DNode;

/**
 * This abstract node type is used to derive node types that can emit audio data.
 * @see https://doc.x3dom.org/author/Sound/X3DSoundSourceNode.html
 */
export type X3DSoundSourceNode = X3DNode;

/**
 * This abstract node type is the base type for all node types which specify a transformation of texture coordinates.
 * @see https://doc.x3dom.org/author/Texturing/X3DTextureTransformNode.html
 */
export type X3DTextureTransformNode = X3DNode;

/**
 * This abstract node type is the base type for all node types which specify sources for texture images.
 * @see https://doc.x3dom.org/author/Texturing/X3DTextureNode.html
 */
export type X3DTextureNode = X3DNode;

/**
 * This abstract node type is the base type for all node types which specify texture coordinates.
 * @see https://doc.x3dom.org/author/Texturing/X3DTextureCoordinateNode.html
 */
export type X3DTextureCoordinateNode = X3DNode;

/**
 * This abstract node type is the base type for all node types that specify cubic environment map sources for texture images.
 * @see https://doc.x3dom.org/author/CubeMapTexturing/X3DEnvironmentTextureNode.html
 */
export type X3DEnvironmentTextureNode = X3DNode;

/**
 * This abstract node type is the base type for all node types that specify a programmable shader.
 * @see https://doc.x3dom.org/author/Shaders/X3DShaderNode.html
 */
export type X3DShaderNode = X3DNode;

/**
 * This abstract node type is the base type for all node types that specify per-vertex attribute
 *  information to the shader.
 * @see https://doc.x3dom.org/author/Shaders/X3DVertexAttributeNode.html
 */
export type X3DVertexAttributeNode = X3DNode;

/**
 * This is the abstract node for spatial geometry nodes.
 * @see https://doc.x3dom.org/author/Geometry3D/X3DSpatialGeometryNode.html
 */
export type X3DSpatialGeometryNode = X3DNode;

/**
 * Abstract base node type.
 * @see https://doc.x3dom.org/author/Geometry3D/X3DBinaryContainerGeometryNode.html
 */
export type X3DBinaryContainerGeometryNode = X3DNode;

/**
 * This abstract node type is the base type for all node types that specify 3D sources for texture images.
 * @see https://doc.x3dom.org/author/Texturing3D/X3DTexture3DNode.html
 */
export type X3DTexture3DNode = X3DNode;

/**
 * An abstract base class for all pointing device sensor nodes.
 * @see https://doc.x3dom.org/author/PointingDeviceSensor/X3DPointingDeviceSensorNode.html
 */
export type X3DPointingDeviceSensorNode = X3DNode;

/**
 * An abstract base class for all sensors that are processing drag gestures of the pointer.
 * @see https://doc.x3dom.org/author/PointingDeviceSensor/X3DDragSensorNode.html
 */
export type X3DDragSensorNode = X3DNode;

/**
 * An abstract base class for all sensors that process touch events.
 * @see https://doc.x3dom.org/author/PointingDeviceSensor/X3DTouchSensorNode.html
 */
export type X3DTouchSensorNode = X3DNode;

/**
 * The abstract node X3DSequencerNode forms the basis for all types of sequencers.
 * @see https://doc.x3dom.org/author/EventUtilities/X3DSequencerNode.html
 */
export type X3DSequencerNode = X3DNode;

/**
 * This abstract node type is the base node type from which all trigger nodes are derived.
 * @see https://doc.x3dom.org/author/EventUtilities/X3DTriggerNode.html
 */
export type X3DTriggerNode = X3DNode;

/**
 * Abstract base node type.
 * @see https://doc.x3dom.org/author/Geometry2D/X3DPlanarGeometryNode.html
 */
export type X3DPlanarGeometryNode = X3DNode;

/**
 * (Abstract) class for volume data.
 * @see https://doc.x3dom.org/author/VolumeRendering/X3DVolumeDataNode.html
 */
export type X3DVolumeDataNode = X3DNode;

/**
 * (Abstract) class for volume rendering styles.
 * @see https://doc.x3dom.org/author/VolumeRendering/X3DVolumeRenderStyleNode.html
 */
export type X3DVolumeRenderStyleNode = X3DNode;

/**
 * (Abstract) class for composable volume rendering styles.
 * @see https://doc.x3dom.org/author/VolumeRendering/X3DComposableVolumeRenderStyleNode.html
 */
export type X3DComposableVolumeRenderStyleNode = X3DNode;

/**
 * The X3DParametricGeometryNode abstract node type is the base type for all geometry node types
 * that are created parametrically and use control points to describe the final shape of the surface. How the
 * control points are described and interpreted shall be a property of the individual node type.
 * @see https://doc.x3dom.org/author/NURBS/X3DParametricGeometryNode.html
 */
export type X3DParametricGeometryNode = X3DNode;

/**
 * The X3DNurbsSurfaceGeometryNode represents the abstract geometry type for all types of NURBS surfaces.
 * @see https://doc.x3dom.org/author/NURBS/X3DNurbsSurfaceGeometryNode.html
 */
export type X3DNurbsSurfaceGeometryNode = X3DNode;
