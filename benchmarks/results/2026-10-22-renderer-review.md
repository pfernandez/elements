# Renderer review — 2026-10-22

Reviewed the mounting/replacement paths, observer notification ordering,
reentrant cancellation, child placement, applied-property bookkeeping,
subscription release, namespaces, event returns, history and tick lifetime.
The leaf optimization was checkpointed as `9db6950`; fixes are in `c60de2d`.

## Findings and fixes

- **SVG `<text>` collided with the renderer's internal text-node kind.** It
  produced a native text node instead of an SVG element; an element named
  `empty` similarly became a comment. Internal kinds now use symbols. Unit and
  browser regressions cover standalone SVG text, insertion into an existing SVG,
  updates preserving identity, and transitions between text and elements.
- **Replacing a large fragment repeatedly shifted its retired-node array.**
  Retirement now uses the existing range-operation helper, eliminating that
  quadratic array work and sharing the same reentry handling as moves/removals.
  A native disconnection callback test replaces the new root again and verifies
  that no nodes from the retired fragment remain.

A focused error-recovery test also verifies that an invalid root replacement
throws and that a fresh corrected observation finishes replacement. Updates
still propagate assignment errors; this does not establish transactional rollback
of arbitrary native side effects. No API or selection-timing change was introduced.

## Cross-engine validation

All 57 browser checks passed in Chrome 155.0.8059.84, Firefox 151.0 and Playwright
WebKit 26.5, including real X3DOM, namespaces, native state, reentry, history,
fragments and targeted collection checks. This tests WebKit on Linux, not Safari
on Apple hardware.

Cross-engine execution required three test-harness corrections, rather than
runtime changes: passive synthetic submit checks use detached forms to avoid
Firefox's real navigation default; groups run in separate pages so their history
entries cannot interfere; the tick lifetime check keeps a callback pending
without continually dereferencing its WeakRef between explicit collections.
The production application fixture separately checks real animation pause/resume.

Validation also passed 174 core tests, seven X3DOM tests, both package typechecks,
declaration generation, strict packed consumers, production Pages build/tests,
and the production dependency audit (zero vulnerabilities). Core coverage was
99.78% lines and 94.57% branches.

This review found no further blocking issue in the paths examined. Notification
amplification, history snapshot cost, and heavy DOM remount costs remain performance
questions; this review makes no claim that every application or native callback
combination has been covered.
