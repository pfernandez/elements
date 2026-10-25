# Single-child traversal

Updates now read children directly from the authored vnode for empty leaves and
matched single children. The single-child path shares the existing matching rule,
publishes replacements before native callbacks, and restores a child moved by a
callback. Unmatched keys, changed namespace context and larger lists use the
existing general path. No API, observer-selection or notification rules changed.

[Raw evidence](./2026-10-24-single-child.json) includes source/bundle hashes,
repeated diagnostics, the production comparison and an actual selection profile.
Measured sources include formatting-only working edits excluded from the commit.

## Production comparison

Both adapters rebuild row descriptions on each observation. The baseline is
`372f40a`. Medians pool two opposite-order passes: 20 samples for partial update,
swap and removal; 40 for selection. Timings include layout/paint and the pinned
harness's default CPU throttling and warmups.

| Workload | Before | After |
| --- | ---: | ---: |
| Update every tenth row, ms | 65.20 | 61.10 |
| Select a row, ms | 49.10 | 46.10 |
| Swap two distant rows, ms | 72.40 | 68.65 |
| Remove a row, ms | 43.50 | 42.05 |
| Mounted page memory, MiB | 3.887 | 3.876 |

Partial updates and selection improved by about 6%, swaps by 5%, and removal by
3%. Partial updates and selection were faster in both passes. Page memory was
similar; the small difference does not establish a further memory improvement.

Page memory uses three forced-GC samples per adapter. Creation, startup and React
were not rerun. The comparison isolates this runtime change on one machine; it
does not establish general library rankings or an updated React comparison.

## Focused diagnostics

Median synchronous JS/DOM milliseconds, without layout/paint or throttling.
Two opposite-order passes each use five warmups and fifteen samples per case.

| Workload | Before | After |
| --- | ---: | ---: |
| Fresh update of all 1,000 rows | 5.20 | 4.80 |
| Fresh update of all 10,000 rows | 49.30 | 48.00 |
| Update one of 10,000 independent observers | 0.009 | 0.009 |
| Reuse one selection across 500 projections | 0.80 | 0.70 |
| Make 500 fresh selections of one observer | 56.20 | 49.25 |

All 250,000 notifications still occur in the last case. The shortcut reduces
work per update, without skipping intermediate observations. Short timings,
especially below one millisecond, remain sensitive to noise.

An early construction experiment reordered vnode classification checks. An
existing regression test showed that it inspected a retained vnode that should
remain opaque, so it was discarded. Construction is unchanged in the final patch.
The initial leaf-only timing trial had slower, more variable baseline timings;
those samples are retained separately and are not pooled with the final runs.

The final selection profile uses the actual fresh-row adapter with 1,000 rows,
20 warmups and 100 alternating synchronous selections. Element construction is
the largest anonymous callback; child traversal and GC remain substantial.
These unminified samples locate work and are not production timing measurements.
A useful next experiment is constructing empty and primitive-only elements
without the general child-normalization path, while preserving opacity for
retained vnode children.

## Validation

175 core tests, seven X3DOM tests and all 60 browser checks passed in each of
Chrome, Firefox and Playwright WebKit. New browser cases cover moving a matched
child during an attribute callback, synchronous selection during its reconnection,
and reading a single-child accessor once on both retention and replacement.
Typechecking, declaration generation, production build and packed-package
consumer checks passed. Both benchmark adapters passed keyed identity checks and
all measured operations passed the harness's plausibility checks. Lifetime probes
still collect unreferenced DOM and preserve explicitly retained projections.

Environment: Chrome 155.0.8059.84, Node 25.9.0, Intel Core i7-1270P, Linux
7.0.0-34-generic. Harness `3ab4ceaf5591771228f83fb5161b9fda7e15934d`.
Builds and tests completed before timing; other system noise was uncontrolled.
