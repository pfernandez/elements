# Vendored X3DOM artifacts

This folder contains vendored build artifacts from the upstream X3DOM project.
They are included so that `@pfern/elements` can:

- Provide comprehensive X3D tag helpers (core + full node sets).
- Lazy-load X3DOM at runtime without requiring consumers to import `x3dom`
  themselves.
- Work reliably across bundlers, including workspace-linked dev setups (e.g.
  Vite), where absolute filesystem URLs may be blocked.

## Files

- `vendor/x3dom.js` — “core/basic” bundle.
- `vendor/x3dom-full.js` — “full” bundle that includes additional components
  (e.g. Geometry2D, Geospatial, VolumeRendering, etc.).
- `vendor/x3dom.css` — X3DOM CSS.

## How these are produced

These files are built from the upstream source repo tag matching the vendored
version, using the upstream build script:

1. Clone X3DOM source at the pinned tag (example for `1.8.3`):
   - `git clone --depth 1 --branch 1.8.3 https://github.com/x3dom/x3dom.git elements/.cache/x3dom-src-1.8.3`
2. Install build deps:
   - `cd elements/.cache/x3dom-src-1.8.3 && npm install`
3. Run build:
   - `node build/src-builder.js`
4. Copy outputs from `dist/`:
   - `dist/x3dom.js` → `elements/vendor/x3dom.js`
   - `dist/x3dom-full.js` → `elements/vendor/x3dom-full.js`
   - `dist/x3dom.css` → `elements/vendor/x3dom.css`

The generated `src/3d.js` loader expects these files to remain present and in
sync with one another.

## Regenerating helpers/types

After updating the vendored artifacts (or changing X3DOM versions), regenerate
the runtime helpers and type definitions:

- `npm run -s gen:x3d`

