# Observer selection characterization — 2026-10-21

Original investigation at checkpoint `337cf11`, before changing the runtime.
The subsequent [synchronous reentry fix](./2026-10-22-reentrant-updates.md)
resolves the overwrite below and supersedes the serialization recommendation.
Five new passing unit tests and two real-browser checks characterize selection
ordering. One additional unit test records a known failure as an explicit TODO,
asserting the desired convergence rather than treating divergence as a contract.

## Observed ordering

- Fresh observations select in projection traversal order, not construction
  order. The last fresh observation encountered wins in the tested ordinary
  sibling and nested cases.
- Already-presented sources follow the current observation. Reusing an earlier
  source later in the graph does not reset its observer; returning that source
  from an event explicitly selects it again.
- A fresh zero-argument call can reset a counter advanced by events. Memoizing
  observer arguments would lose that distinction.
- Parallel parent projections converge after an ordinary update. A source first
  presented in one placement does not select again in the other placement.
- Custom-element `attributeChangedCallback` runs synchronously. Updating a graph
  containing observations `1` and `2` exposes both intermediate attribute values
  to the callback, even though all projections eventually show `2`.
- A callback can raise an event selecting another observer and read its updated
  DOM immediately after the nested event returns.

These observations describe the current implementation; the callback timing
checks are characterization tests, not a proposal to freeze every intermediate
DOM state as a public guarantee.

## Reentrant overwrite

A real custom element confirms a correctness defect when its attribute callback
raises an event selecting the **same** observer while that observer is being
patched. With two projections initially showing `0`:

| Point | First projection text | Second projection text |
| --- | ---: | ---: |
| Inside the callback, after its nested event selects `2` | 2 | 2 |
| After the outer event selecting `1` finishes | 1 | 2 |
| After returning the same previously selected `2` source again | 1 | 2 |
| After returning a fresh `2` observation | 2 | 2 |

After the outer event, both `data-state` attributes are `2`, so the first
projection is internally inconsistent as well. Its suspended outer patch writes
the old text after the inner patch completes. Replaying the same newer source
does not notify because the identity already holds that observation.

[Chrome evidence](./2026-10-21-observer-selection.json) records the complete
trace with no page errors. Reproduce it after the benchmark harness dependencies
are installed with `node benchmarks/observer-selection.mjs`; output is written
to `.cache/elements-diagnostics/observer-selection.json`.

## Original recommendation (superseded)

Fix reentrant consistency before attempting notification coalescing. The
recommended direction is to serialize nested updates and finish all pending
work before the outermost event returns. That changes what code immediately
after a nested click can read: its DOM update may still be pending.

Preserving immediate nested-event completion instead requires the active patch
to handle being superseded safely, including root replacement, removal and
exceptions. Coalescing distinct fresh observations is an additional timing
decision: skipping intermediate notifications would remove callback observations
that are demonstrably visible today. Serialization alone does not remove the
quadratic fan-out.

At this checkpoint, no queue, batching, argument memoization or notification
changes had been implemented. Validation: 165 unit tests pass, one explicit TODO reproduces the
defect, and all 46 browser checks pass.
