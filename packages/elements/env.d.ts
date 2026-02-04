/**
 * Ambient type declarations for the build environment.
 *
 * This project is JS-first; these declarations exist solely to provide a
 * type-rich editor experience and to keep `tsc --checkJs` strict.
 */

declare module '*?raw' {
  const content: string
  export default content
}

interface ImportMetaEnv {
  readonly DEV?: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  x3dom?: any
}

