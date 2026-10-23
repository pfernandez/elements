# Mounted-memory investigation

The renderer now shares immutable empty bookkeeping for text/empty nodes and
compacts child arrays after mounting finishes. It still publishes children
incrementally so native callbacks can synchronously select another observation.
Vnode construction, observer selection and public APIs are unchanged.

The controlled comparison supports a memory improvement, with similar interaction
times. [Raw samples, source hashes and bundle hashes](./2026-10-23-allocation.json)
include the final comparison and exploratory variants.

## Framework benchmark

Both adapters rebuild row descriptions on every observation. The baseline is
the reviewed `c60de2d` runtime, unchanged in `109dbe0`. CPU medians pool two passes
in opposite framework order: 20 samples for creation/partial update and 40 for
selection, with the pinned harness's normal warmups and throttling.

| Workload | Before | After |
| --- | ---: | ---: |
| Create 1,000 rows, ms | 50.40 | 50.60 |
| Update every tenth row, ms | 64.35 | 62.45 |
| Select a row, ms | 48.70 | 48.45 |
| Mounted page memory, MiB | 4.33 | 3.89 |

Page memory is the median of three forced-GC samples using the harness's
`performance.measureUserAgentSpecificMemory()` procedure. The approximately 10%
reduction was consistent across these samples. The small timing differences do
not establish a general speed improvement. Both adapters passed keyed
create/remove/swap checks and all benchmark plausibility checks.

React was not rerun in this focused comparison. The substantial fresh-description
gap documented in the [release comparison](./2026-10-23-release-validation.md)
remains; these changes do not close it. Other interaction workloads, startup and
long-running memory behavior were not remeasured here.

## Heap attribution

A separate fixture mounts one observed table with 1,000 rows, 6,002 elements
and 4,000 text nodes. Three fresh-page samples force GC before and after mounting.
Median additional JavaScript heap, in bytes:

| Runtime | Mounted minus ready heap |
| --- | ---: |
| Earlier `99bad11` | 1,620,328 |
| Reviewed runtime | 2,530,496 |
| Selected change | 1,981,636 |

This is a 22% reduction from the reviewed runtime, but remains above the earlier
snapshot. It is a different fixture and metric from whole-page memory above.
Embedder-memory readings varied too much to attribute a separate improvement.

Chrome heap snapshots identify two recoverable sources: spare capacity in
incrementally published child arrays, and separate empty props/children objects
for primitive nodes. Shallow bytes for record-shaped objects and their stores:

| Category | Before | After |
| --- | ---: | ---: |
| Mount record objects | 520,156 | 520,156 |
| Child array objects | 160,048 | 96,048 |
| Child array backing stores | 461,240 | 88,020 |
| Primitive props objects | 112,028 | 56 |
| Vnode array backing stores | 533,540 | 533,540 |

These are property-shape matches, not dominator-tree retained sizes. V8 templates
also match the record shape, so counts include a small amount of engine bookkeeping.
The categories do not account for the entire heap. All removal samples collected
the DOM and returned subscriptions to zero while retaining the authored graph.

## Update diagnostics and rejected variants

Two opposite-order passes, each with five warmups and fifteen samples, measure
synchronous JS/DOM work separately from layout and paint. Pooled medians in ms:

| Workload | Before | After |
| --- | ---: | ---: |
| Construct fresh 1,000-row description | 1.20 | 1.20 |
| Update all 1,000 rows | 4.80 | 4.75 |
| Construct fresh 10,000-row description | 10.90 | 11.55 |
| Update all 10,000 rows | 52.50 | 47.35 |
| Update one of 10,000 independent observers | 0.010 | 0.009 |
| Reuse one selection across 500 projections | 0.80 | 0.80 |
| Make 500 fresh selections of one observer | 52.90 | 55.00 |

Construction is unchanged by the selected patch; its variation illustrates the
noise in these short local timings. The large-table diagnostic improvement did
not translate into a comparable interaction speedup in the harness.

Compacting vnode arrays as well recovered more heap, but copying, preallocation
and concatenation trials added construction or update cost. A lazy property-delta
trial also failed to establish a consistent improvement. Those changes were
discarded. The selected patch only changes renderer bookkeeping.

Shared-observer notification counts remain unchanged: 500 fresh selections still
produce 250,000 notifications. Reducing that count would require a separate
semantic decision. The next performance target remains ordinary fresh-description
updates, using profiling and isolated comparisons before changing reconciliation.

## Validation

174 core tests, seven X3DOM tests and all 57 browser checks passed in each of
Chrome, Firefox and Playwright WebKit. Typechecks, declaration generation,
production build and both packed-package consumer checks also passed.

Measurements used Chrome 155.0.8059.84, Node 25.9.0, Intel Core i7-1270P and Linux
7.0.0-34-generic. Harness revision: `3ab4ceaf5591771228f83fb5161b9fda7e15934d`.
No builds or tests ran concurrently with timing samples; other system noise was
uncontrolled. These results describe this machine and these workloads.
