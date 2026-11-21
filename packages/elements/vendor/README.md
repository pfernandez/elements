# Vendored X3DOM artifacts

This folder contains vendored build artifacts from the upstream X3DOM project.
They are included so that `@pfern/elements/3d` can:

- Provide comprehensive X3D tag helpers (core + full node sets).
- Lazy-load X3DOM at runtime without requiring consumers to import `x3dom`
  themselves.
- Work reliably across bundlers, including workspace-linked dev setups (e.g.
  Vite), where absolute filesystem URLs may be blocked.

## Files

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
   - `dist/x3dom-full.js` → `packages/elements/vendor/x3dom-full.js`
   - `dist/x3dom.css` → `packages/elements/vendor/x3dom.css`
   - `LICENSE.md` → `packages/elements/vendor/LICENSE.md`

The `src/x3dom.js` loader expects the engine and stylesheet to remain present and in
sync with one another.

## Regenerating helpers/types

After replacing the engine, run these commands from the repository root.

```sh
npm run -s fetch:x3dom-src
npm run -s build:types
```

The refresh reads the matching upstream revision and writes node descriptions,
field types, and inheritance to `scripts/x3dom-nodes.json` in the Elements
package. Commit that file with the engine update. Ordinary builds and npm
packing read the checked-in data offline. The tarball includes the resulting
declarations and the [upstream license](./LICENSE.md).
