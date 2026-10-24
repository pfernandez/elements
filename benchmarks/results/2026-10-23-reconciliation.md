# Fresh-description reconciliation

The renderer now skips unused removal tracking when every old child has a match,
reuses the result of each vocabulary namespace lookup, and uses positional
matching for plain unkeyed children when no retained reference moves. Reference,
key and observer matching priorities are unchanged. The shortcut examines the
whole sibling list before claiming positions, preserving references that occur
later in the list.

[Raw measurements](./2026-10-23-reconciliation.json) include source/bundle hashes,
profiling results, the initial positional trial and both final timing passes.

## Framework comparison

Both adapters construct fresh row descriptions on each observation. The baseline
is `1f480ed`; this change builds on its memory reduction. The table pools two
opposite-order passes, with 20 samples per workload and 40 for selection.
CPU values are median milliseconds, including layout/paint and the harness's
normal CPU throttling.

| Workload | Before | After |
| --- | ---: | ---: |
| Create 1,000 rows, ms | 51.00 | 51.40 |
| Update every tenth row, ms | 65.35 | 63.95 |
| Select a row, ms | 48.55 | 48.60 |
| Swap two distant rows, ms | 71.85 | 70.75 |
| Remove a row, ms | 46.70 | 44.35 |
| Mounted page memory, MiB | 3.887 | 3.890 |

Removal was about 5% faster in the pooled samples, and was faster in both
passes. Partial updates and swaps improved by about 2% and 1.5%; those small
changes need cautious interpretation. Creation and selection were essentially
unchanged. These are modest reductions in overhead, not a broad performance
breakthrough. The previous mounted-memory savings were preserved.

Mounted-page memory uses three forced-GC samples per adapter. React and startup
were not rerun. The earlier React comparison remains useful context, but these
results are a controlled before/after Elements comparison on one local machine.

## Focused diagnostics

Pooled medians from two opposite-order passes; five warmups and fifteen samples
per case per pass, without CPU throttling or layout/paint timing:

| Workload | Before, ms | After, ms |
| --- | ---: | ---: |
| Fresh update of all 1,000 rows | 5.20 | 4.65 |
| Fresh update of all 10,000 rows | 51.90 | 49.10 |
| Update one of 10,000 independent observers | 0.0095 | 0.0090 |
| Reuse one selection across 500 projections | 0.70 | 0.75 |
| Make 500 fresh selections of one observer | 55.30 | 56.40 |

The shared-observer workload remains expensive: 500 fresh selections still
produce 250,000 notifications. All intermediate selections are retained. The
small independent-observer and shared-projection timing differences do not
establish an improvement or regression beyond local noise.

The initial unminified CPU profile included construction, mounting, updates and
removal. It identified repeated matching and namespace work as candidates; its
sample counts are not production timing or an update-only cost breakdown.

A second profile uses the actual fresh-row selection workload after the change:
1,000 mounted rows, 20 warmups and 100 synchronous alternating selections of two
rows. The largest anonymous callbacks belong to element construction and the
child-patching traversal; named functions and GC samples also point to traversal
and allocation work. Property comparison remains a candidate, but this profile
does not establish it as the dominant cost. The reusable command is
`node benchmarks/profile-selection.mjs`, with the benchmark server running.

Selection showed no improvement in the production comparison, so this actual
workload is the next profiling target. Further experiments should separate
construction from traversal and allocation while retaining the current observer
and identity rules. No API or observation-model decision is needed for this patch.

## Validation

- 175 core tests and seven X3DOM tests passed, along with typechecking,
  declaration generation, the production build and both packed-package consumers.
- All 57 browser checks passed in each of Chrome, Firefox and Playwright WebKit,
  covering native reentry, focus, namespaces, parallel projections and history.
- Both benchmark adapters passed keyed create/remove/swap checks and every
  measured operation passed harness plausibility checks.
- A seeded scratch comparison matched the previous algorithm in 50,000 cases
  containing fresh/retained children, duplicate references, keys, primitives and
  shared/distinct observers. Focused regression tests cover the boundary cases.
- The existing removal probe still collects unreferenced DOM while preserving
  explicitly retained DOM; no persistent cache or mount-record field was added.

Environment: Chrome 155.0.8059.84, Node 25.9.0, Intel Core i7-1270P, Linux
7.0.0-34-generic. Harness `3ab4ceaf5591771228f83fb5161b9fda7e15934d`.
Builds and tests completed before timing; other system noise was uncontrolled.
