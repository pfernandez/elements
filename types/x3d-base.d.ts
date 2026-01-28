/**
 * Abstract base types for X3D nodes (not tag helpers).
 */

type X3DBaseNode = [tag: string, props: Record<string, any>, ...children: any[]];

/**
 * Abstract base type that all concrete X3D nodes derive from.
 * https://doc.x3dom.org/author/Core/X3D.html
 */
export type X3DNode = X3DBaseNode;

/**
 * Abstract base type for nodes that can be bound to a stack (e.g., Background, Fog, NavigationInfo, Viewpoint).
 * https://www.web3d.org/specifications/X3Dv4/ISO-IEC19775-1v4-IS/Part01/components/core.html
 */
export type X3DBindableNode = X3DBaseNode;

/**
 * Abstract base type for nodes that can appear as children of grouping nodes.
 * https://doc.x3dom.org/author/Core/X3DChildNode.html
 */
export type X3DChildNode = X3DBaseNode;

/**
 * Abstract base type for nodes that group other nodes.
 * https://doc.x3dom.org/author/Grouping/X3DGroupingNode.html
 */
export type X3DGroupingNode = X3DBaseNode;

/**
 * Abstract base type for nodes that apply transform operations to children.
 * https://doc.x3dom.org/author/Grouping/X3DTransformNode.html
 */
export type X3DTransformNode = X3DBaseNode;

/**
 * Abstract base type for background nodes.
 * https://doc.x3dom.org/author/EnvironmentalEffects/X3DBackgroundNode.html
 */
export type X3DBackgroundNode = X3DBaseNode;

/**
 * Abstract base type for viewpoint nodes.
 * https://doc.x3dom.org/author/Navigation/X3DViewpointNode.html
 */
export type X3DViewpointNode = X3DBaseNode;

/**
 * Abstract base type for light nodes.
 * https://doc.x3dom.org/author/Lighting/X3DLightNode.html
 */
export type X3DLightNode = X3DBaseNode;

/**
 * Abstract base type for shape nodes.
 * https://doc.x3dom.org/author/Shape/X3DShapeNode.html
 */
export type X3DShapeNode = X3DBaseNode;

/**
 * Abstract base type for nodes that define bounds.
 * https://doc.x3dom.org/author/Grouping/X3DBoundedObject.html
 */
export type X3DBoundedObject = X3DBaseNode;

/**
 * Abstract base type for metadata nodes.
 * https://doc.x3dom.org/author/Core/X3DMetadataObject.html
 */
export type X3DMetadataObject = X3DBaseNode;

/**
 * Abstract base type for navigation info nodes.
 * https://doc.x3dom.org/developer/x3dom/nodeTypes/X3DNavigationInfoNode.html
 */
export type X3DNavigationInfoNode = X3DBaseNode;

/**
 * Abstract base type for sensor nodes that can produce events.
 * https://doc.x3dom.org/author/Core/X3DSensorNode.html
 */
export type X3DSensorNode = X3DBaseNode;

/**
 * Abstract base type for sensors that react to pointing-device interaction.
 * https://www.web3d.org/specifications/X3dSchemaDocumentation3.0/x3d-3.0_X3DPointingDeviceSensorNode.html
 */
export type X3DPointingDeviceSensorNode = X3DBaseNode;

/**
 * Abstract base type for drag-style pointing-device sensors.
 * https://doc.x3dom.org/author/PointingDeviceSensor/X3DDragSensorNode.html
 */
export type X3DDragSensorNode = X3DBaseNode;

/**
 * Abstract base type for touch-style pointing-device sensors.
 * https://www.web3d.org/specifications/java/javadoc/org/web3d/x3d/sai/PointingDeviceSensor/TouchSensor.html
 */
export type X3DTouchSensorNode = X3DBaseNode;
