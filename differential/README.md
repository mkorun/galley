# Differential and release checks

These tools are outside the package's published `files` list. Run them with Bun, Chromium and Python.

`./check.sh` checks the release tree, validates the equivalence list without running mutants, checks types and coverage
tests, compares the build with `dist/`, and checks secrets when gitleaks is present.
After a change to `compiler/`, `index.ts`, `types.ts` or `util.ts`, run `bun run build` and `git add dist` before `./check.sh`.
`python3 tests/mutate-context.py --list` generates mutants in the isolated copy and rejects invalid or stale equivalence
entries without running any tests. The campaign uses the same validation.

`python3 tests/mutate-context.py` always runs one fresh campaign in a copy of tracked inputs. Stage new inputs first.
It generates mutants in that copy, baselines both test commands, and prints the Bun version, every outcome and totals.
Only recognised test failures count as kills; full-suite fallback kills need a second failure, which may name another test.
Process, test and beforeEach/afterEach hook timeouts, malformed output, invalid mutants, failed baselines and passing confirmations abort the campaign.
Reviewed reasons live in `tests/support/mutation-equivalents.json`; stale entries and focused-test kills fail the campaign.
After adding or changing an entry, run `python3 tests/mutate-context.py --equivalents` (about a minute per entry).
It baselines both commands in the same isolated copy, then checks only the reviewed mutants against the full suite.
A kill found only by the full suite is caught by `--equivalents`.
The driver restores each mutant, bounds subprocesses, keeps the loop budget, and cleans up on SIGINT, SIGTERM and,
where the system has it, SIGHUP.

Commit the changes, then run `./check.sh --release` from a clean tree. It requires gitleaks, runs the ordinary checks,
then one complete campaign, and checks the tree again, including untracked files and ignored files under `dist/`.
Any unreviewed survivor or incomplete campaign blocks release. No mutation report or cache is written.
The existing growth timing probe can still be affected by contention; a passing run is not a proof of linear complexity.

Browser tools use `GALLEY_CHROMIUM` (default `chromium`) and fail on a broken selection without trying another browser.
Run `bun differential/run.ts` or `bun differential/strict-run.ts` for browser comparisons; the latter accepts `--smoke`.
Use `bun differential/run.ts --record` only to replace the recorded corpus result after review.

`run.ts` retains the lossless UTF-16 corpus codec, independently expected outputs and checkpoint attribution. Its
82 fixed cases and 920 generated cases cover seven URL attributes, both quotes, safe and forbidden neighbors, block
boundaries, snippets and foreign content. The seed is `0x20261117`. The numeric-reference family and decoder tables
are removed. Static references expect G3015; raw references carry an explicit undecided checkpoint. Chromium decodes
prefixes for the independent whole-prefix oracle. Pins are checked before execution; after reviewing fixture or
strict-source changes, deliberately update them with `bun tests/update-pins.ts`.

Tests and the default `run.ts` command validate without writing `RESULT.json`. Only `run.ts --record` replaces it;
the browser version in that historical result does not have to match the local installation.

`strict-run.ts` performs real compilation and rendering:

- `random.ts` retains the supplied prototype's mixed, foreign and tags productions, including its later narrow
  alphabets, and adds col/colgroup. Counts are 60,000 / 40,000 / 60,000; seeds are `0x5eed0001`–`0x5eed0003`. Each
  insertion is selected in turn for `javascript:M1=1 N1=2`; other insertions write `x=`. Both conditions run and
  metadata values are also rendered empty. Every distinct successfully rendered source/output/expected-place
  combination goes to Chromium. G5001 stops are counted; other render failures fail the run. Observed markers must
  agree with the reader's recorded `place`; Chromium-decoded URL attributes carrying markers must pass the independent
  whole-prefix rule.
- Foreign sequences enumerate lengths 1–4 from the committed 25-piece alphabet: 406,900 sources. Every source is
  appended with `<style><i data-galley-probe></i></style>`. A browser-created probe element must imply compile
  refusal. All sequences are submitted to compilation; refused cases satisfy that implication immediately. Accepted
  sequences without either foreign entry token in this closed alphabet cannot enter foreign content. Every remaining
  accepted candidate is observed in a fresh iframe; counts record both reductions. The original spec's alphabet is
  absent from the supplied files, so exact historical counts cannot be reproduced; the replacement alphabet is explicit
  in `strict-families.ts`.
- Every ordered pair of the 131 committed element names precedes each of the nine text owners: 154,449 sources.
  Accepted outputs must hold the literal probe as text in that owner. Self-closing text owners, foreign integration
  markup, frameset and template/col hazards are refused by the compiler.

`strict-browser.ts` also reports decoded marker-bearing `srcset` and `imagesrcset` values as `lists`; malformed or missing list readings fail transport validation.

`strict-browser.ts` creates and removes a fresh scripting-enabled iframe per case. CSP blocks script execution and
resource loads; links are never activated. Each Chromium invocation has a timeout and uses an argument array. A
failed batch is bisected until the failing case is named; no case is skipped. Generated HTML transport files live in
temporary directories. Full `strict-run.ts` writes `STRICT-RESULT.json`; smoke mode prints its report without writing it.
The committed `STRICT-RESULT.json` records the 0.5.0 compiler, including feature packages A, B and C.
The unreleased 0.6.0 compiler with mandatory brace syntax and parse-time number checks reproduced that full report
byte for byte: the strict families contain valid template tags, so the removed literal-brace path changes no totals.

The gate runs the corpus and smoke domains of the strict families; run the full families separately. Smoke mode uses
40 sources per random family, 650 foreign sequences (depths 1–2), and 144 text-owner sources (four element names).
Tests plant bad observations, misplaced markers, false refusals, missing URL stops, dropped output, attribution errors
and subprocess hangs.

The time-ratio probe in `tests/support/compile-growth.ts` compiles seventeen shapes at 4n and 64n in fresh processes,
takes the minimum of five samples independently at each size and fails at 32×. Alternating size order and using minima
reduces delays from competing work; it cannot eliminate contention or guarantee a pass on every machine. Warm-up uses
a different source from both timed sizes. Shapes include many snippets with JS blocks, constants followed by branches,
and constants each used. The metadata whitespace and nested-block shapes time 64 compiles per process to keep small
measurements above clock noise.

The gate sees total compile time, including native operations without a named work counter. A linear shape grows
about 16×; a dominant quadratic part grows toward 256×. A small quadratic component can still pass: it has to contribute
enough at 64n to push the total ratio over 32. Growth present in only some samples passes when a fast large sample
remains: the minimum intentionally discards sporadic slow paths as well as scheduler delays. This is a regression probe
at these sizes, not a proof of linear complexity or a render benchmark.

Benchmark probes live in `tests/bench/`. Extract `main` without switching branches, then run:

```sh
python3 tests/bench/extract-main.py /absolute/path/to/main
bun tests/bench/verify.ts /absolute/path/to/main
python3 tests/bench/measure.py /absolute/path/to/main /absolute/path/to/branch /absolute/path/to/results
```

The measurement runner verifies all four independent outputs in the baseline and candidate, runs main/main controls
before main/branch, and records eight AB/BA rounds per probe. It creates the supplied output directory and writes
commands, raw samples, verified outputs and tables there. Add `--rounds 4` for a shorter run. The extraction command
accepts an optional revision after the directory; `main` means the local ref, so select the intended baseline explicitly.

`bun differential/each-run.ts joins` and `bun differential/each-run.ts moved` run the each-else prototype's two
retained families against the shipped compiler. `--smoke` selects forty evenly spaced sources and runs in the gate.
The join domain has 8,960 sources. The moved domain pins the 3,733 indices that 0.4.0 refused with G2002 among the
160,000 random sources; its source digest is checked before execution. No old compiler is needed for replay.
Both empty and nonempty collections run, with metadata values empty and nonempty; moved also runs both conditions.
Every distinct source/output/expected-place combination reaches Chromium. Tests plant bad observations in the oracle.

`bun differential/attribute-run.ts pieces` runs the attribute-policy prototype's 8,320 list-piece sources with its
four payloads and both conditions. `--smoke` selects forty evenly spaced sources and runs in the gate. The source
generator and independent `srcset` candidate oracle are pinned with the other strict families. Every candidate in a
decoded marker-bearing list must pass the whole-prefix rule; placement and single-URL checks also apply. The smoke
test fails if the URL checker no longer restarts at a separator. This command prints results without writing a record.

Number restrictions are tested directly in `tests/literal-fixes.test.ts`: leading zeros, safe-integer bounds
(including decimals that round down to the bound), quoted controls, and exact diagnostic spans. Numbers are checked
as they are read; the recorded 0.5.0 error-order/literal-text comparison has been removed with the brace fallback.

`bun differential/rule17-run.ts` runs the rule 17 family: 448 cases across text owners, attributes, inline comments,
doctypes and text-owner end boundaries, with nine value/brace forms, four call paths (direct, snippet, partial
and each fallback), and both strip settings. Malformed braces expect G3019 in every context.
Escaped braces supply the literal controls, including script/style end boundaries.
Refusals retain their source offsets. It checks independent expected
bytes and diagnostics, then observes all accepted pages in Chromium. The complete family runs in the gate; its oracle
tests plant missing/misplaced markers, missing refusals and changed bytes.

`bun differential/hadley.ts` checks only the two public hadley themes, `hadley/themes/hems/templates` and
`hadley/themes/punch/templates`, against generated-code SHA-256 hashes verified against commit `2b3ee75`.
`HADLEY-TEMPLATES.json` contains their 31 source files and expected hashes, so the gate needs no external checkout.
Entry selection follows hadley: 16 direct `.chase` files and two `markup/heading.sort` files, with partials resolved
from their owning templates directory and no custom filters. The 18 entries reach 29 files and produce 18
compilations with default options. The test enforces the two-theme collection list.

For an unrecorded comparison, run `bun differential/hadley.ts /path/to/template-corpus /path/to/reference/index.ts`.
Export the reference compiler from `2b3ee75` outside this repository. The directory mode discovers `.chase` and
`.sort` files under `templates` directories, applies the same entry selection, and compares generated code from
both compilers. It reports counts without writing sources or hashes. The explicit reference module must export
the compiler as its default function; missing templates, compilation failures and code differences stop the check.

The public-theme corpus and synthetic code-generation checks also run in the focused mutation suite: extra
generated metadata state is observable even when rendered bytes are unchanged, so those mutants do not qualify
as equivalent.
