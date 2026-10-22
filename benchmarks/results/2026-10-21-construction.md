# Construction optimization — 2026-10-21

Vnode construction now uses the existing namespace metadata instead of a
separate marker WeakSet. Child normalization appends directly into the new
vnode array, removing temporary arrays and repeated concatenation. Props and
authored child arrays remain untouched; the public API is unchanged.

[Raw samples, source hashes and runtime diff](./2026-10-21-construction.json)
preserve the before/after comparison and the intermediate metadata-only stage.
The baseline is `99bad11`; optimized sources are the accompanying working-tree
changes to `children.js` and `element.js`.

## Focused diagnostics

Median synchronous milliseconds, five warmups and fifteen samples per case:

| Workload | Before | Metadata only | Both changes |
| --- | ---: | ---: | ---: |
| Construct 1,000 rows | 2.9 | 2.2 | 1.6 |
| Construct and update 1,000 rows | 8.7 | 8.4 | 5.5 |
| Construct 10,000 rows | 45.8 | 30.9 | 11.2 |
| Construct and update 10,000 rows | 88.9 | 67.6 | 55.3 |

These diagnostics exclude subsequent layout and paint. The stages ran in the
listed order, using fresh pages and production builds. Allocation and GC make
construction variable: 10,000-row construction ranged from 26.0 to 125.2 ms
before, and 8.4 to 56.9 ms after. The median improvement is useful evidence,
not a guarantee for every update.

The lifetime assertions still pass: discarded DOM is collected despite a
retained graph, while retained detached DOM keeps its subscriptions. Shared
observer notification counts are unchanged: 500 fresh selections still cause
250,000 notifications. Notification coalescing remains a separate optimization
requiring ordering and reentrancy characterization.

## Full interactions

Median total interaction milliseconds, including browser rendering:

| Workload | Retained before | Retained after | Fresh before | Fresh after |
| --- | ---: | ---: | ---: | ---: |
| Update every tenth row | 34.50 | 31.20 | 85.45 | 65.45 |
| Select a row | 10.65 | 10.50 | 64.75 | 52.05 |
| Create 10,000 rows | 562.45 | 547.10 | 562.35 | 526.80 |

Fresh-row partial updates improve by about 23%, selection by 20%, and creation
by 6% in this run. Partial-update scripting falls from 63.35 to 43.25 ms;
creation scripting falls from 147.45 to 125.10 ms. Rendering costs limit the
total creation gain. Retained-row selection is approximately unchanged.
These changes reduce the cost of fresh descriptions but do not eliminate it.
Scripting and total medians are calculated separately.

Ten samples per workload, twenty for selection, retaining all samples. Upstream
warmups are three for partial update and five otherwise. Partial update and
selection use 4× CPU slowdown; creation is unthrottled. The baseline bundles
were checked against the preceding investigation's SHA-256 hashes before use.
React was not rerun in this comparison.

Execution order: optimized fresh, optimized retained, baseline fresh, baseline
retained. This is one fixed-order run on an Intel Core i7-1270P with Chrome
155.0.8059.84 headless and Node 25.9.0, using harness revision
`3ab4ceaf5591771228f83fb5161b9fda7e15934d`. No other benchmark/build/test jobs ran
concurrently; system noise was uncontrolled. Repeat runs before release claims.

## Validation and reproduction

The new characterization tests passed before and after the change. They cover
nested groups, empty/sparse groups, mixed arrays, frozen inputs, retained vnode
references, observers and custom/HTML/SVG/MathML namespace metadata. All 160 unit
tests, 44 real-browser checks, seven X3DOM tests, typechecking, generated types,
the production build and packed-package consumer checks passed. Both optimized
adapters passed the keyed create/remove/swap checks.
The interaction run passed the harness plausibility check; the production
dependency audit reported no vulnerabilities.

After the [harness setup](../README.md), build baseline adapters from a clean
`99bad11` checkout and optimized adapters from this working tree:

```sh
node benchmarks/build.mjs elements-retained /path/to/99bad11 retained
node benchmarks/build.mjs elements-fresh /path/to/99bad11 fresh
node benchmarks/build.mjs elements-construct-retained . retained
node benchmarks/build.mjs elements-construct-fresh . fresh
```

With the benchmark server running, from `webdriver-ts/`:

```sh
node dist/isKeyed.js --headless --chromeBinary /usr/bin/google-chrome --framework keyed/elements-construct-retained keyed/elements-construct-fresh
node dist/benchmarkRunner.js --headless --chromeBinary /usr/bin/google-chrome --framework keyed/elements-retained keyed/elements-fresh keyed/elements-construct-retained keyed/elements-construct-fresh --benchmark 03_ 04_ 07_ --count 10
```

Run `node benchmarks/diagnostics.mjs` from the repository root to repeat the
focused diagnostics; save each stage's result before running the next stage.
