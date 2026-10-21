# Keyed table benchmark

This adapter runs Elements in [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark),
alongside its React Hooks and vanilla JavaScript implementations. All three
preserve row identity. Elements retains unchanged row vnodes in a WeakMap;
React Hooks uses `memo` with the same item-reference and selection comparison.
Elements uses one application observer and delegates row clicks to the table.

The comparison measures these implementations of one table workload, including
browser layout and paint. It does not establish a general ranking of libraries.
Freshly constructing every row exercises more reconciliation work than this
adapter; test that pattern separately when profiling an application.

The [initial local comparison](./results/2026-10-20.md) includes before/after
results, React Hooks, vanilla JavaScript, and raw samples.

## Setup

From the repository root, with dependencies installed and Chrome available:

```sh
git clone --filter=blob:none --sparse https://github.com/krausest/js-framework-benchmark.git .cache/js-framework-benchmark
git -C .cache/js-framework-benchmark checkout 3ab4ceaf5591771228f83fb5161b9fda7e15934d
git -C .cache/js-framework-benchmark sparse-checkout set frameworks/keyed/react-hooks frameworks/keyed/vanillajs webdriver-ts server css cli
mkdir -p .cache/js-framework-benchmark/frameworks/non-keyed
npm --prefix .cache/js-framework-benchmark/webdriver-ts ci --ignore-scripts --no-audit --no-fund
npm --prefix .cache/js-framework-benchmark/server ci --ignore-scripts --no-audit --no-fund
npm --prefix .cache/js-framework-benchmark/frameworks/keyed/react-hooks ci --ignore-scripts --no-audit --no-fund
npm --prefix .cache/js-framework-benchmark/webdriver-ts run compile
npm --prefix .cache/js-framework-benchmark/frameworks/keyed/react-hooks run build-prod
node benchmarks/build.mjs
```

To build the same adapter against an older runtime, use a separate checkout:

```sh
git worktree add --detach /tmp/elements-baseline 2e494da
node benchmarks/build.mjs elements-baseline /tmp/elements-baseline
```

The builder writes production bundles and harness metadata under `.cache/`.
It does not modify the source checkout. Dirty package sources are labeled `working-tree`.
Keep the baseline bundle fixed while measuring changes.

## Run

Start the harness in another terminal:

```sh
npm --prefix .cache/js-framework-benchmark/server start
```

Then verify identity and collect measurements:

```sh
cd .cache/js-framework-benchmark/webdriver-ts
node dist/isKeyed.js --headless --chromeBinary /usr/bin/google-chrome --framework keyed/elements-baseline keyed/elements keyed/react-hooks keyed/vanillajs
node dist/benchmarkRunner.js --headless --chromeBinary /usr/bin/google-chrome --framework keyed/elements-baseline keyed/elements keyed/react-hooks keyed/vanillajs --benchmark 01_ 02_ 03_ 04_ 05_ 06_ 07_ 08_ 09_ --count 5
```

Check that all four frameworks appear and that each operation passes; the keyed
checker can exit successfully even when setup fails. Results and Chrome traces
are written to `webdriver-ts/results/` and `webdriver-ts/traces/`. Five samples
are a quick local comparison; the harness adds ten samples for selection. Its
default CPU throttling and warmups remain enabled. Keep the machine idle and
record the browser, machine, harness commit, runtime revisions and sample counts.
Use more samples and repeat runs before publishing release claims. Memory and
startup tests are separate from these nine interaction workloads.

The table fixture adapts Stefan Krause's js-framework-benchmark workload under
Apache-2.0; its license is included in `keyed/elements/LICENSE`.
