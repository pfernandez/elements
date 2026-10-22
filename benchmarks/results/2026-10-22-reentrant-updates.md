# Synchronous reentrant updates — 2026-10-22

Nested events still update the DOM before returning. When a native callback
selects a newer observation, the suspended older patch stops instead of
overwriting that observation. This fixes the
[original two-projection failure](./2026-10-21-observer-selection.md) without
queuing event returns or coalescing distinct selections.

The renderer publishes its in-progress records before native callbacks, tracks
properties as they are applied, and cancels superseded patches at DOM boundaries.
Fragment moves/removals complete their current range operation before a nested
patch reads the sibling order. Interrupted reordering reconstructs that order
from the DOM; ordinary moves and bulk removals avoid quadratic bookkeeping.
Temporary placement references are cleared after mounting.

The original probe now reads `2, 2` inside the nested callback, after the outer
event, and after replaying the same newer source. Regression checks cover root
replacement and immediate focus, parent removal, insertion/disconnection
callbacks, style restoration, fragment movement/removal, and assignment errors.
Authored props remain unchanged, including frozen select props. Native assignment
errors continue to propagate.

## Local performance comparison

The same production diagnostic fixture ran sequentially against the committed
`337cf11` sources and the corrected working tree. Chrome 155.0.8059.84, Node
25.9.0, Linux, Intel i7-1270P; five warmups and fifteen samples per case, no CPU
throttling. Times below are medians in milliseconds for synchronous JS and DOM
work, excluding layout/paint. Independent-counter samples average 100 clicks.

| Workload | Before | After |
| --- | ---: | ---: |
| Fresh 1,000-row update | 6.0 | 6.6 |
| Fresh 10,000-row update | 53.9 | 63.7 |
| One counter among 1,000 independent observers | 0.008 | 0.010 |
| One counter among 10,000 independent observers | 0.009 | 0.010 |
| 100 shared projections, reused observation | 0.3 | 0.5 |
| 100 shared projections, distinct fresh observations | 3.2 | 3.4 |
| 500 shared projections, reused observation | 0.7 | 0.9 |
| 500 shared projections, distinct fresh observations | 68.3 | 73.5 |

This correctness change has a measurable cost: the large fresh-tree update was
about 18% slower in this run. Small sub-millisecond differences are noisy; these
are local diagnostics, not release claims or a new React comparison. The existing
quadratic fan-out remains: 500 distinct fresh observations delivered 250,000
notifications, versus 500 for a reused observation. Reducing work per notification
is a separate optimization; skipping observable selections would need a further
semantic decision.

Both lifetime probes passed. Retaining only the graph allowed the removed DOM
and all its subscriptions to be collected; retaining the DOM kept it live with
10,001 subscriptions. This is a targeted check, not a general leak guarantee.

[Raw samples, source hashes and callback trace](./2026-10-22-reentrant-updates.json)
record both variants. Reproduce with `node benchmarks/diagnostics.mjs`, using
`--source-root` and `--output` for a separate baseline, and
`node benchmarks/observer-selection.mjs` for the callback probe.

Validation: 171 core tests, 55 browser checks, seven X3DOM tests, both package
typechecks, declaration generation, packed consumer checks and production build
passed. Core coverage: 99.78% lines, 94.41% branches. Production dependency audit:
zero vulnerabilities.
