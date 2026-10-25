# Constructor allocation experiment and React comparison

This experiment was **not adopted**. It reduced mounted-page memory by about 3%,
but slowed partial updates in both production passes, by about 5% in the pooled
samples. The runtime remains at `d3234db`; the new regression test and evidence
are retained. No API or observer-model change is proposed.

The candidate replaced `normalizeChildren(args, [tag, props])` in the shared
constructor with:

```js
!args.length ? [tag, props]
  : args.length === 1 && !Array.isArray(args[0]) ? [tag, props, args[0]]
    : normalizeChildren(args, [tag, props])
```

Array-valued children kept the existing normalization path, preserving mapped
groups, literal vnodes, namespaces and retained-child opacity. Props and explicit
empty child slots also kept their existing behavior.

[Raw samples and hashes](./2026-10-25-construction.json) include the production
comparison, diagnostics, heap summaries and final selection profile. Existing
formatting-only user edits were present during measurement and remain uncommitted.

## Production comparison

The baseline is `d3234db`. Both Elements adapters construct fresh row descriptions;
React is the same pinned React 19.2.0 fresh-row control used in the prior report,
with row memoization removed and header memoization retained. Bundle hashes verify
that the React control is unchanged.

Medians pool two passes in opposite framework order: 20 samples per workload and
40 for selection. Milliseconds include layout/paint and normal harness throttling.

| Workload | Current Elements | Rejected candidate | React fresh |
| --- | ---: | ---: | ---: |
| Create 1,000 rows, ms | 52.10 | 52.95 | 47.50 |
| Update every tenth row, ms | 61.40 | 64.25 | 39.25 |
| Select a row, ms | 46.40 | 47.15 | 23.90 |
| Append 1,000 rows, ms | 67.85 | 67.35 | 57.40 |
| Mounted page memory, MiB | 3.881 | 3.757 | 4.321 |

The allocation improvement did not carry over into a production speedup.
Partial updates slowed from 60.75 to 65.85 ms in the first pass; see the raw
samples for both passes. Creation and selection were also slightly slower in
the pooled results, while append was essentially unchanged. The measured memory
saving alone does not justify adopting this candidate for the current update-cost
investigation.

The current runtime uses about 10% less mounted-page memory than React fresh in
this fixture. React remains faster in all four measured CPU workloads: Elements
partial updates take about 1.6 times as long, and selection about 1.9 times as long.
These results support continued work on ordinary fresh-description updates.

Page memory uses three forced-GC samples per adapter. This is one table workload
on one machine. Retained-row adapters, 10,000-row creation, swaps, removal, clear and startup were not
rerun; the results do not establish a general library ranking.

## Construction and heap diagnostics

Pooled medians from two opposite-order passes, in milliseconds:

| Workload | Current runtime | Candidate |
| --- | ---: | ---: |
| Construct 1,000-row description | 1.40 | 1.10 |
| Update all 1,000 rows | 4.75 | 4.65 |
| Construct 10,000-row description | 13.30 | 10.10 |
| Update all 10,000 rows | 48.45 | 44.00 |
| Update one of 10,000 independent observers | 0.0095 | 0.0090 |
| Make 500 fresh selections of one observer | 52.80 | 53.30 |

These synchronous diagnostics exclude layout/paint and CPU throttling. Each pass
uses five warmups and fifteen samples, and the second pass reverses runtime order.
Construction times for fresh descriptions are separate from event/update times.

A separate forced-GC table fixture measured median additional JS heap of
1,981,420 bytes before and 1,710,820 bytes after: about 14% less. Heap snapshots
attribute most of this change to vnode array backing stores, whose shallow sizes
fell from 533,540 to 261,540 bytes. Direct array literals avoid the spare capacity
left by appending a child to the two-item prefix. Mount-record and mounted-child
array sizes were unchanged.

These heap measurements use a different fixture and metric from whole-page
memory above. Shape-based heap summaries also include V8 templates; they are not
dominator-tree retained sizes. Removal probes still collect unreferenced DOM
while preserving explicitly retained projections. Shared-observer notification
counts remain unchanged, including 250,000 notifications for 500 fresh selections.

The candidate's actual-selection profile still shows substantial construction,
child traversal and GC work. It uses an unminified build, 20 warmups and 100
alternating synchronous selections of two rows; its samples locate work rather
than establish production timing. The disagreement between the simpler diagnostic
fixture and the production adapter is a reason to gate further constructor
experiments on the actual selection workload earlier.

A possible next trial is direct construction for a single known vnode child as
well, using existing metadata to preserve opacity. That case occurs frequently
in the production adapter's nested cells and links. It remains untested.

## Validation

176 core tests, seven X3DOM tests and all 60 browser checks passed in each of
Chrome, Firefox and Playwright WebKit. The new construction test covers explicit
empty slots, fresh default props, retained frozen props and vocabulary namespaces.
Existing tests still cover opaque retained vnodes, nested/mixed/sparse groups,
native state and synchronous reentry. Typechecking, declaration generation,
production build and packed-package consumers passed. All three benchmark adapters
passed keyed checks and all measured operations passed harness plausibility checks.

Environment: Chrome 155.0.8059.84, Node 25.9.0, Intel Core i7-1270P, Linux
7.0.0-34-generic. Harness `3ab4ceaf5591771228f83fb5161b9fda7e15934d`.
Builds and tests completed before timing; other system noise was uncontrolled.
