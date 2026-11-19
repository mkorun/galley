# Differential validation tools

Keep these tools local until release. They are outside the package's published `files` list.

Run with the VM's fetched Bun, Chromium and Python; no dependency installation is needed:

```sh
bun differential/run.ts
bun differential/strict-run.ts
# A small domain through the same CLI and browser transport:
bun differential/strict-run.ts --smoke
python3 tests/mutate-context.py
./check.sh
```

`run.ts` retains the lossless UTF-16 corpus codec, independently expected outputs and checkpoint attribution. Its
82 fixed cases and 920 generated cases cover seven URL attributes, both quotes, safe and forbidden neighbors, block
boundaries, snippets and foreign content. The numeric-reference family and decoder tables are removed. Static
references now expect G3015; raw references carry an explicit undecided checkpoint. Chromium decodes prefixes for
the independent whole-prefix oracle. Pins are checked before execution; `bun tests/update-pins.ts` deliberately
updates them after fixture review.

`strict-run.ts` performs real compilation and rendering:

- `random.ts` retains the supplied prototype's mixed, foreign and tags productions, including its later narrow
  alphabets, and adds col/colgroup. Counts are 60,000 / 40,000 / 60,000; seeds are 0x5eed0001–0x5eed0003. Each
  insertion is selected in turn for `javascript:M1=1 N1=2`; other insertions write `x=`. Both conditions run and
  metadata values are also rendered empty. Every distinct successfully rendered source/output/expected-place
  combination goes to Chromium, as in the prototype. G5001 stops are counted; other render failures fail the run.
  Observed markers must agree with the reader's recorded `place`; Chromium-decoded URL attributes carrying markers
  must pass the independent whole-prefix rule.
- Foreign sequences enumerate lengths 1–4 from the committed 25-piece alphabet: 406,900 sources. Every source is
  appended with `<style><i data-galley-probe></i></style>`. A browser-created probe element must imply compile
  refusal. All sequences are submitted to compilation; refused cases satisfy that implication immediately. Accepted sequences
  without either foreign entry token in this closed alphabet cannot enter foreign content. Every remaining accepted
  candidate is observed in a fresh iframe; counts record both reductions. The original spec's alphabet is absent
  from the supplied files, so exact historical counts cannot be reproduced; the replacement alphabet is explicit in `strict-families.ts`.
- Every ordered pair of the committed element names precedes each of the nine text owners. Accepted outputs must
  hold the literal probe as text in that owner. Self-closing text owners, foreign integration markup, frameset and
  template/col hazards are refused by the compiler.

`strict-browser.ts` creates and removes a fresh scripting-enabled iframe per case. CSP blocks script execution and
resource loads; links are never activated. Each Chromium invocation has a timeout and uses an argument array. A
failed batch is bisected until the failing case is named; no case is skipped. Generated HTML transport files may
live in temporary directories; all generators, browser code and probes are committed here or in `tests/`.

The gate runs the existing campaign and smoke domains of the full families; run the full families separately. Tests plant
bad observations, misplaced markers, false refusals, missing URL stops, dropped output, attribution errors and
subprocess hangs. `MUTATIONS.md` is generated mechanically from reader/URL conditions and URL checkpoint generation. It records
each killing test or a reviewed equivalence reason. The permanent generator, loop budget and equivalence inventory
live in `tests/support/`; the driver mutates only a temporary copy. Mutant runs use
`--bail` and retain the deterministic loop-budget preload, including the full-suite fallback. A complete successful
run records its input SHA-256 on the last line of `MUTATIONS.md`; unchanged inputs reuse that inventory. The hash
includes the mutated files, compiler/runtime dependencies, tests and support files (including the generator and
equivalence list), differential inputs, tool configuration and Bun version. Use
`python3 tests/mutate-context.py --force` to rerun unchanged inputs. Failed or incomplete runs cannot update the hash.
A time-ratio probe in the same directory compiles seventeen shapes at 4n and 64n in fresh processes, takes five-run
medians and fails at 32×. Warm-up uses a different source from both timed sizes. Shapes include many snippets with
JS blocks, constants followed by branches, and constants each used. The metadata whitespace and nested-block
shapes time 64 compiles per process to keep small measurements above clock noise.

Benchmark probes live in `tests/bench/`. Extract `main` without switching branches, then run:

```sh
python3 tests/bench/extract-main.py /absolute/path/to/main
bun tests/bench/verify.ts /absolute/path/to/main
python3 tests/bench/measure.py /absolute/path/to/main /absolute/path/to/branch /absolute/path/to/results
```

The measurement runner verifies all four independent outputs, runs main/main controls before main/branch, and
records eight AB/BA rounds per probe. It creates the supplied output directory and writes commands, raw samples,
verified outputs and tables there. Add `--rounds 4` for a shorter run.
