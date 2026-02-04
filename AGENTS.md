## Elements.js Agent Notes

This repository is intentionally JS-first and FP-forward. The goal is to
deliver an elegant, Lisp-like developer experience while encapsulating the
necessary imperative DOM boundary with care.

### Design Invariants

- **Single page-load mount:** typical apps call `render()` once at startup.
- **Declarative updates via events:** event handlers may return a vnode to
  replace the closest component boundary (replacement-based updates).
- **Explicit tick hook:** `ontick` is a hook (not a DOM event). It runs once per
  animation frame, waits for connection/readiness, and must be synchronous.
- **Attribute-first props:** most props are assigned via `setAttribute`. A small
  explicit set of **property exceptions** are assigned as DOM properties when
  present: `value`, `checked`, `selected`, `disabled`, `multiple`, `muted`,
  `volume`, `currentTime`, `playbackRate`, `open`, `indeterminate`.
- **No swallowed assignment errors:** DOM assignment errors should fall through
  to callers (don’t catch and ignore).

### Code Style

- Prefer **small, pure helpers** with clear names.
- Prefer **expressions over statements** (arrow functions without braces where
  reasonable).
- Prefer **one return** at the end when using blocks; avoid blocks when
  expressions suffice.
- Prefer **ternaries** over `if` blocks when it improves flow.
- Keep formatting **Lisp-y**: visually align nested calls, and “gather”
  closing parens so the shape of expressions is readable.

### Types-As-Docs

- TypeScript is **not required at runtime**; `.d.ts` output is for editor DX.
- JSDoc on package exports should be **human-readable** and provide a
  comprehensive reference experience in VSCode.
- Keep `/3d` exports separate, and treat X3DOM source refresh as a **manual**
  step (network access).

### Common Workflows

- Run tests: `npm test`
- Typecheck (JS via `tsc --checkJs`): `npm run -s typecheck`
- Regenerate types (includes X3D runtime + types generation):
  `npm run -s build:types`
- Refresh X3DOM source docs into `.cache/` (manual, networked):
  `npm run -s fetch:x3dom-src`

### CI Expectations

- GitHub Actions runs `typecheck`, `build:types`, `test`, `build`, and `npm
  audit` (fails on high/critical).
