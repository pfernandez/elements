# Release validation — 2026-10-23

Runtime: `c60de2d`, following the leaf optimization in `9db6950` and the
[renderer review](./2026-10-22-renderer-review.md). All four planned steps are
complete: checkpoint, review/fixes, refreshed framework comparison, and
representative application checks in three browser engines.

Elements retains a substantial bundle-size and distant-swap advantage in this
fixture. React is faster for most ordinary interactions, particularly when all
row descriptions are rebuilt. Mounted-page memory is broadly comparable.
These results support a qualified comparison, not a general library ranking.

[Raw samples, bundle/source hashes, validation checks and application measurements](./2026-10-23-release-validation.json)
accompany this report. Reproduction commands are in the [benchmark guide](../README.md).

## Table interactions

Median total interaction milliseconds, including browser rendering. Each value
pools two passes: 20 samples per operation, 40 for selection. The second pass
reversed framework order. All samples are retained.

| Workload | Elements retained | Elements fresh | React memoized | React fresh |
| --- | ---: | ---: | ---: | ---: |
| Create 1,000 rows | 51.8 | 51.6 | 44.6 | 45.9 |
| Replace 1,000 rows | 62.3 | 58.7 | 54.4 | 53.4 |
| Update every tenth row | 34.3 | 65.4 | 27.1 | 39.4 |
| Select a row | 11.3 | 47.4 | 9.6 | 23.1 |
| Swap two distant rows | 34.1 | 71.6 | 166.4 | 177.2 |
| Remove a row | 25.0 | 45.1 | 21.1 | 29.0 |
| Create 10,000 rows | 571.8 | 565.5 | 619.8 | 592.6 |
| Append 1,000 rows | 60.7 | 67.9 | 52.0 | 56.0 |
| Clear 1,000 rows | 30.4 | 28.8 | 28.9 | 28.5 |

Elements retained reuses unchanged row vnodes. Elements fresh rebuilds every row
description on each application observation. React fresh removes the upstream
row `memo` wrapper; its header remains memoized. Both Elements adapters use one
application observer. Separate-observer behavior is exercised by the application
fixture below.

The fresh-description gap remains material: selection takes about twice React
fresh's time, and partial updates about 1.7 times. Both Elements variants retain
the efficient distant-swap behavior and are modestly faster on 10,000-row creation.
The runtime improvements have not eliminated the benefit of reusing descriptions.

## Memory, startup and size

Median page-memory estimates in MiB; three samples per state, using the pinned
harness's forced-GC procedure and `performance.measureUserAgentSpecificMemory()`.

| State | Elements retained | Elements fresh | React memoized | React fresh |
| --- | ---: | ---: | ---: | ---: |
| Ready | 0.66 | 0.66 | 1.18 | 1.18 |
| 1,000 rows mounted | 4.37 | 4.33 | 4.43 | 4.31 |
| After five create/clear cycles | 1.51 | 1.47 | 1.98 | 1.95 |

The earlier mounted-memory advantage is no longer present in these samples.
Retained Elements was 3.52 MiB in the earlier investigation; attributing the
increase requires a controlled runtime comparison. These short memory runs
cannot establish long-term leak freedom.

Startup uses Lighthouse 13.4.0's default mobile simulation with three fresh-browser
runs per variant. Entry-script gzip size includes the table application and its
dependencies, excluding shared harness CSS; it is not package size.

| Metric | Elements retained | Elements fresh | React memoized | React fresh |
| --- | ---: | ---: | ---: | ---: |
| Entry JavaScript gzip bytes | 7,356 | 7,328 | 61,343 | 61,314 |
| Script bootup, ms | 26.1 | 22.4 | 70.0 | 74.6 |
| Main-thread work, ms | 161.9 | 155.6 | 210.7 | 204.7 |
| Simulated interactive time, ms | 1,952.3 | 1,953.2 | 3,041.8 | 3,043.5 |

Startup is favorable in this fixture but remains a small sample. Simulated
interactive time includes the page/network model, not only library execution.

## Representative application

The production fixture has 500 independently observed forms, two projections of
one shared counter, navigation/history and an animation hook. All three engines
passed native typing, focus/caret preservation, submission, shared updates,
Back/Forward restoration, independent-update isolation, and animation
disconnection/reconnection checks.

Median synchronous milliseconds; five warmups and 15 samples. Input and shared
update samples average 20 operations; navigation samples measure one operation.

| Workload | Chrome 155 | Firefox 151 | WebKit 26.5 |
| --- | ---: | ---: | ---: |
| Edit one form | 0.015 | 0.1 | Below timer resolution |
| Update two shared projections | 0.015 | 0.1 | Below timer resolution |
| Leave the editor | 6.1 | 3 | 4 |
| Rebuild the editor | 181.7 | 13 | 8 |
| Plain-DOM form rebuild control | 211.7 | 4 | 3 |

Chrome's dense-form remount cost is also present in a plain-DOM control on a
fresh page. That control constructs the same form structure without Elements
or history snapshots; it is a diagnostic comparison, not an identical workload.
An unminified CPU profile also points to native insertion/attribute work. The
underlying browser cost remains a follow-up, rather than an established Elements
reconciliation defect.

After the interactions, the animation check sampled 60 frame intervals, with
medians around 16–17 ms. This verifies hook progress and reconnection in this
scenario; it does not measure input-to-paint latency, sustained animation under
concurrent input, or large numbers of tick hooks.

## Validation and methodology

- 174 core tests and seven X3DOM tests passed. Core coverage: 99.78% lines,
  94.57% branches.
- All 57 browser checks passed in Chrome, Firefox and Playwright WebKit,
  including real X3DOM. WebKit on Linux is not Safari on Apple hardware.
- Typechecks, declarations, packed consumers, built Pages tests and production
  dependency audit passed; the audit found no vulnerabilities.
- All four adapters passed keyed create/remove/swap checks. All interaction and
  memory runs completed with successful harness plausibility checks.

Table/memory/startup environment: Intel Core i7-1270P, Linux 7.0.0-34-generic,
Chrome 155.0.8059.84, Node 25.9.0, React 19.2.0. Pinned harness:
`3ab4ceaf5591771228f83fb5161b9fda7e15934d`. Upstream CPU throttling remains enabled:
4× for partial update, selection, swap and clear; 2× for removal; otherwise none.
Partial-update warmup count is three; other interaction warmups are five.
Memory/startup remain single three-sample batches. No builds or tests ran
concurrently with the recorded comparison; system noise was uncontrolled.

## Remaining work

Prioritize fresh-description update costs and a controlled check of mounted
memory. Keep notification coalescing separate: 500 fresh selections of one
shared observer still imply 250,000 notifications, and removing intermediate
selections would change observable behavior. The Chrome form-remount result
warrants browser-specific investigation. Broader devices, actual Safari, and
long-running application sessions remain outside this validation pass.
