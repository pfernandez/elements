import { elements } from './core/elements.js'

/**
 * SVG tag helpers.
 *
 * Like `src/html.js`, this module stays intentionally “flat”: one named export
 * per SVG element with a short description for editor-first documentation.
 */

/**
 * The <animate> SVG element provides a way to animate an attribute of an element over time.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/animate
 *
 */
export const animate = elements.animate

/**
 * The <animateMotion> SVG element provides a way to define how an element moves along a motion path.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/animateMotion
 *
 */
export const animateMotion = elements.animateMotion

/**
 * The <animateTransform> SVG element animates a transformation attribute on its target element, thereby allowing animations to control translation, scaling, rotation, and/or skewing.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/animateTransform
 *
 */
export const animateTransform = elements.animateTransform

/**
 * The <mpath> SVG sub-element for the <animateMotion> element provides the ability to reference an external <path> element as the definition of a motion path.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/mpath
 *
 */
export const mpath = elements.mpath

/**
 * The <set> SVG element provides a method of setting the value of an attribute for a specified duration.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/set
 *
 */
export const set = elements.set

/**
 * The <circle> SVG element is an SVG basic shape, used to draw circles based on a center point and a radius.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/circle
 *
 */
export const circle = elements.circle

/**
 * The <ellipse> SVG element is an SVG basic shape, used to create ellipses based on a center coordinate, and both their x and y radius.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/ellipse
 *
 */
export const ellipse = elements.ellipse

/**
 * The <line> SVG element is an SVG basic shape used to create a line connecting two points.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/line
 *
 */
export const line = elements.line

/**
 * The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/path
 *
 */
export const path = elements.path

/**
 * The <polygon> SVG element defines a closed shape consisting of a set of connected straight line segments. The last point is connected to the first point.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/polygon
 *
 */
export const polygon = elements.polygon

/**
 * The <polyline> SVG element is an SVG basic shape that creates straight lines connecting several points. Typically a polyline is used to create open shapes as the last point doesn't have to be connected to the first point. For closed shapes see the <polygon> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/polyline
 *
 */
export const polyline = elements.polyline

/**
 * The <rect> SVG element is a basic SVG shape that draws rectangles, defined by their position, width, and height. The rectangles may have their corners rounded.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/rect
 *
 */
export const rect = elements.rect

/**
 * The <defs> SVG element is used to store graphical objects that will be used at a later time. Objects created inside a <defs> element are not rendered directly. To display them you have to reference them (with a <use> element for example).
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/defs
 *
 */
export const defs = elements.defs

/**
 * The <g> SVG element is a container used to group other SVG elements.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/g
 *
 */
export const g = elements.g

/**
 * The <marker> SVG element defines a graphic used for drawing arrowheads or polymarkers on a given <path>, <line>, <polyline> or <polygon> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/marker
 *
 */
export const marker = elements.marker

/**
 * The <mask> SVG element defines a mask for compositing the current object into the background. A mask is used/referenced using the mask property and CSS mask-image property.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/mask
 *
 */
export const mask = elements.mask

/**
 * The <pattern> SVG element defines a graphics object which can be redrawn at repeated x- and y-coordinate intervals ("tiled") to cover an area.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/pattern
 *
 */
export const pattern = elements.pattern

/**
 * The <svg> SVG element is a container that defines a new coordinate system and viewport. It is used as the outermost element of SVG documents, but it can also be used to embed an SVG fragment inside an SVG or HTML document.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/svg
 *
 */
export const svg = elements.svg

/**
 * The <switch> SVG element evaluates any requiredFeatures, requiredExtensions and systemLanguage attributes on its direct child elements in order, and then renders the first child where these attributes evaluate to true.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/switch
 *
 */
export const svgswitch = elements.switch

/**
 * The <symbol> SVG element is used to define graphical template objects which can be instantiated by a <use> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/symbol
 *
 */
export const symbol = elements.symbol

/**
 * The <use> element takes nodes from within an SVG document, and duplicates them somewhere else. The effect is the same as if the nodes were deeply cloned into a non-exposed DOM, then pasted where the <use> element is, much like cloned <template> elements.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/use
 *
 */
export const use = elements.use

/**
 * The <desc> SVG element provides an accessible, long-text description of any SVG container element or graphics element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/desc
 *
 */
export const desc = elements.desc

/**
 * The <metadata> SVG element adds metadata to SVG content. Metadata is structured information about data. The contents of <metadata> should be elements from other XML namespaces such as RDF, FOAF, etc.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/metadata
 *
 */
export const metadata = elements.metadata

/**
 * The <filter> SVG element defines a custom filter effect by grouping atomic filter primitives. It is never rendered itself, but must be used by the filter attribute on SVG elements, or the filter CSS property for SVG/HTML elements.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/filter
 *
 */
export const filter = elements.filter

/**
 * The <feBlend> SVG filter primitive composes two objects together ruled by a certain blending mode. This is similar to what is known from image editing software when blending two layers. The mode is defined by the mode attribute.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feBlend
 *
 */
export const feBlend = elements.feBlend

/**
 * The <feColorMatrix> SVG filter element changes colors based on a transformation matrix. Every pixel's color value [R,G,B,A] is matrix multiplied by a 5 by 5 color matrix to create new color [R',G',B',A'].
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feColorMatrix
 *
 */
export const feColorMatrix = elements.feColorMatrix

/**
 * The <feComponentTransfer> SVG filter primitive performs color-component-wise remapping of data for each pixel. It allows operations like brightness adjustment, contrast adjustment, color balance or thresholding.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feComponentTransfer
 *
 */
export const feComponentTransfer = elements.feComponentTransfer

/**
 * The <feComposite> SVG filter primitive performs the combination of two input images pixel-wise in image space using one of the Porter-Duff compositing operations: over, in, atop, out, xor, lighter, or arithmetic.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feComposite
 *
 */
export const feComposite = elements.feComposite

/**
 * The <feConvolveMatrix> SVG filter primitive applies a matrix convolution filter effect. A convolution combines pixels in the input image with neighboring pixels to produce a resulting image. A wide variety of imaging operations can be achieved through convolutions, including blurring, edge detection, sharpening, embossing and beveling.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feConvolveMatrix
 *
 */
export const feConvolveMatrix = elements.feConvolveMatrix

/**
 * The <feDiffuseLighting> SVG filter primitive lights an image using the alpha channel as a bump map. The resulting image, which is an RGBA opaque image, depends on the light color, light position and surface geometry of the input bump map.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDiffuseLighting
 *
 */
export const feDiffuseLighting = elements.feDiffuseLighting

/**
 * The <feDisplacementMap> SVG filter primitive uses the pixel values from the image from in2 to spatially displace the image from in.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDisplacementMap
 *
 */
export const feDisplacementMap = elements.feDisplacementMap

/**
 * The <feDistantLight> SVG filter primitive defines a distant light source that can be used within a lighting filter primitive: <feDiffuseLighting> or <feSpecularLighting>.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDistantLight
 *
 */
export const feDistantLight = elements.feDistantLight

/**
 * The <feDropShadow> SVG filter primitive creates a drop shadow of the input image. It can only be used inside a <filter> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDropShadow
 *
 */
export const feDropShadow = elements.feDropShadow

/**
 * The <feFlood> SVG filter primitive fills the filter subregion with the color and opacity defined by flood-color and flood-opacity.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feFlood
 *
 */
export const feFlood = elements.feFlood

/**
 * The <feFuncA> SVG filter primitive defines the transfer function for the alpha component of the input graphic of its parent <feComponentTransfer> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feFuncA
 *
 */
export const feFuncA = elements.feFuncA

/**
 * The <feFuncB> SVG filter primitive defines the transfer function for the blue component of the input graphic of its parent <feComponentTransfer> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feFuncB
 *
 */
export const feFuncB = elements.feFuncB

/**
 * The <feFuncG> SVG filter primitive defines the transfer function for the green component of the input graphic of its parent <feComponentTransfer> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feFuncG
 *
 */
export const feFuncG = elements.feFuncG

/**
 * The <feFuncR> SVG filter primitive defines the transfer function for the red component of the input graphic of its parent <feComponentTransfer> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feFuncR
 *
 */
export const feFuncR = elements.feFuncR

/**
 * The <feGaussianBlur> SVG filter primitive blurs the input image by the amount specified in stdDeviation, which defines the bell-curve.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feGaussianBlur
 *
 */
export const feGaussianBlur = elements.feGaussianBlur

/**
 * The <feImage> SVG filter primitive fetches image data from an external source and provides the pixel data as output (meaning if the external source is an SVG image, it is rasterized.)
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feImage
 *
 */
export const feImage = elements.feImage

/**
 * The <feMerge> SVG element allows filter effects to be applied concurrently instead of sequentially. This is achieved by other filters storing their output via the result attribute and then accessing it in a <feMergeNode> child.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feMerge
 *
 */
export const feMerge = elements.feMerge

/**
 * The <feMergeNode> SVG takes the result of another filter to be processed by its parent <feMerge>.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feMergeNode
 *
 */
export const feMergeNode = elements.feMergeNode

/**
 * The <feMorphology> SVG filter primitive is used to erode or dilate the input image. Its usefulness lies especially in fattening or thinning effects.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feMorphology
 *
 */
export const feMorphology = elements.feMorphology

/**
 * The <feOffset> SVG filter primitive enables offsetting an input image relative to its current position. The input image as a whole is offset by the values specified in the dx and dy attributes.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feOffset
 *
 */
export const feOffset = elements.feOffset

/**
 * The <fePointLight> SVG filter primitive defines a light source which allows to create a point light effect. It that can be used within a lighting filter primitive: <feDiffuseLighting> or <feSpecularLighting>.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/fePointLight
 *
 */
export const fePointLight = elements.fePointLight

/**
 * The <feSpecularLighting> SVG filter primitive lights a source graphic using the alpha channel as a bump map. The resulting image is an RGBA image based on the light color. The lighting calculation follows the standard specular component of the Phong lighting model. The resulting image depends on the light color, light position and surface geometry of the input bump map. The result of the lighting calculation is added. The filter primitive assumes that the viewer is at infinity in the z direction.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feSpecularLighting
 *
 */
export const feSpecularLighting = elements.feSpecularLighting

/**
 * The <feSpotLight> SVG filter primitive defines a light source that can be used to create a spotlight effect. It is used within a lighting filter primitive: <feDiffuseLighting> or <feSpecularLighting>.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feSpotLight
 *
 */
export const feSpotLight = elements.feSpotLight

/**
 * The <feTile> SVG filter primitive allows to fill a target rectangle with a repeated, tiled pattern of an input image. The effect is similar to the one of a <pattern>.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTile
 *
 */
export const feTile = elements.feTile

/**
 * The <feTurbulence> SVG filter primitive creates an image using the Perlin turbulence function. It allows the synthesis of artificial textures like clouds or marble. The resulting image will fill the entire filter primitive subregion.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTurbulence
 *
 */
export const feTurbulence = elements.feTurbulence

/**
 * The <linearGradient> SVG element lets authors define linear gradients to apply to other SVG elements.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/linearGradient
 *
 */
export const linearGradient = elements.linearGradient

/**
 * The <radialGradient> SVG element lets authors define radial gradients that can be applied to fill or stroke of graphical elements.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/radialGradient
 *
 */
export const radialGradient = elements.radialGradient

/**
 * The <stop> SVG element defines a color and its position to use on a gradient. This element is always a child of a <linearGradient> or <radialGradient> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/stop
 *
 */
export const stop = elements.stop

/**
 * The <foreignObject> SVG element includes elements from a different XML namespace. In the context of a browser, it is most likely (X)HTML.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/foreignObject
 *
 */
export const foreignObject = elements.foreignObject

/**
 * The <text> SVG element draws a graphics element consisting of text. It's possible to apply a gradient, pattern, clipping path, mask, or filter to <text>, like any other SVG graphics element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/text
 *
 */
export const text = elements.text

/**
 * The <textPath> SVG element is used to render text along the shape of a <path> element. The text must be enclosed in the <textPath> element and its href attribute is used to reference the desired <path>.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/textPath
 *
 */
export const textPath = elements.textPath

/**
 * The <tspan> SVG element defines a subtext within a <text> element or another <tspan> element. It allows for adjustment of the style and/or position of that subtext as needed.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/tspan
 *
 */
export const tspan = elements.tspan

/**
 * The <view> SVG element defines a particular view of an SVG document. A specific view can be displayed by referencing the <view> element's id as the target fragment of a URL.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/view
 *
 */
export const view = elements.view
