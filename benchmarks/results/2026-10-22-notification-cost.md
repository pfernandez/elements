# Reducing notification cost — 2026-10-22

Baseline: `8c30686`, including the synchronous reentry fix. CPU profiling of 500
shared projections identified sibling reconciliation as a large cost even when
each projection contains only one text node.

Empty leaves now return their existing child list directly. A single attached
text child in the same namespace uses the existing patch operation without
allocating sibling-matching or placement arrays. Changes in structure, namespace
or attachment use ordinary reconciliation. This retains native text edits when
the authored value is unchanged, updates the existing text node when it changes,
and restores a natively detached child as before.

Every selection still notifies synchronously, including intermediate selections
visible to custom elements. The observer and reentry machinery are unchanged.

## Measurements

The same production fixture ran in the order baseline, optimized, optimized,
baseline, with no concurrent build/test work. Each run used five warmups and
fifteen measured samples per case. Chrome 155.0.8059.84, Node 25.9.0, Linux,
Intel i7-1270P; no CPU throttling. Values are median milliseconds of synchronous
JS/DOM work, excluding browser layout and paint.

| Workload | Baseline, run 1 | Optimized, run 1 | Baseline, run 2 | Optimized, run 2 |
| --- | ---: | ---: | ---: | ---: |
| Fresh 1,000-row update | 7.0 | 5.5 | 6.4 | 5.9 |
| Fresh 10,000-row update | 64.0 | 56.0 | 64.3 | 53.7 |
| 100 shared projections, distinct fresh observations | 3.3 | 2.5 | 3.3 | 2.6 |
| 500 shared projections, distinct fresh observations | 68.2 | 50.0 | 71.8 | 53.1 |

The 500-projection case improved about 26–27%; the large fresh-table update
improved about 13–16%. Independent-counter medians remained around 0.008–0.010 ms
per click; sub-millisecond reused-observation timings were noisy. These local
diagnostics do not establish a new React comparison or release-wide speedup.

The expensive fan-out case still delivered **250,000 notifications**; reusing a
single observation delivered 500. This change reduces their cost, not their
number. All four runs passed lifetime checks: graph-only retention allowed the
removed DOM and subscriptions to be collected; retained DOM stayed live with
10,001 subscriptions.

[Raw samples, source hashes and CPU profile summaries](./2026-10-22-notification-cost.json)
record the comparison. Reproduce timings with `node benchmarks/diagnostics.mjs`,
using `--source-root` and `--output` for the baseline. Profile the shared-observer
case with `node benchmarks/diagnostics.mjs --profile --profile-case fanout`;
the full CPU profile is written as `fanout.cpuprofile` under the output directory.
Profiles use unminified code and are diagnostic, not timing comparisons.

Validation: 172 core tests, 55 browser checks, seven X3DOM tests, both package
typechecks, declaration generation, packed consumer checks and production build.
