# Differential validation tools

Keep these tools local until release. They are outside the package's published `files` list.

Run with the VM's fetched Bun, Chromium and Python; no dependency installation is needed:

All browser launches and version probes use `GALLEY_CHROMIUM` (default `chromium`). Set it to an executable path
when Chromium has another name or location. A failed launch reports that selection and never tries another browser.

```sh
bun differential/run.ts
# Explicitly replace the recorded corpus result after review:
bun differential/run.ts --record
bun differential/strict-run.ts
# A small domain through the same CLI and browser transport:
bun differential/strict-run.ts --smoke
python3 tests/mutate-context.py
./check.sh
# Before publishing, run the whole gate without reusing the mutation inventory:
./check.sh --release
```

To keep every commit green: change the input, `git add` any new test files, run
`python3 tests/mutate-context.py`, review the inventory, `git add differential/MUTATIONS.md`, run `./check.sh`,
and make one commit. Then run `./check.sh --release` from the clean tree. The forced release run must reproduce
that inventory; any change to it fails the gate. The Bun version is part of the committed line; use the same Bun
version to reproduce it.

The release command includes types, forced mutations, coverage tests, a build matching `dist/`, the release-tree
check and the required secret scanner. Release mode requires a clean tree both before and after the gate, including untracked files not ignored by git
and all ignored files under `dist/`.

`run.ts` retains the lossless UTF-16 corpus codec, independently expected outputs and checkpoint attribution. Its
82 fixed cases and 920 generated cases cover seven URL attributes, both quotes, safe and forbidden neighbors, block
boundaries, snippets and foreign content. The numeric-reference family and decoder tables are removed. Static
references now expect G3015; raw references carry an explicit undecided checkpoint. Chromium decodes prefixes for
the independent whole-prefix oracle. Pins are checked before execution; `bun tests/update-pins.ts` deliberately
updates them after fixture review.

Tests and the default `run.ts` command validate without writing `RESULT.json`. Only `run.ts --record` replaces it;
the browser version in that historical result does not have to match the local installation.

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
subprocess hangs. `MUTATIONS.md` is generated mechanically from reader/URL conditions, URL checkpoint generation,
statements and conditions in `emitNodes` scope handling and the lexer's `inspectLine`. It records
only the verdict (`killed` or `equivalent:` with a reviewed reason); killing tests are printed during the run.
The permanent generator, loop budget and equivalence inventory
live in `tests/support/`; the driver mutates only a temporary copy. Mutant runs use
`--bail` and retain the deterministic loop-budget preload, including the full-suite fallback. A complete successful
run records its SHA-256 on the last line of `MUTATIONS.md`; unchanged inputs and report rows reuse that inventory.
The driver builds a temporary copy from one git listing of tracked files under `compiler/`, `tests/` and
`differential/`, plus its root execution inputs, excluding the inventory itself. It hashes those files in the
copy once, then combines that digest with the report body. This includes the generator and equivalence list,
both TypeScript configurations, the gate command, the lockfile, tool configuration and Bun version.
Package metadata is excluded. Git must be available to list the tracked inputs. Use
`python3 tests/mutate-context.py --force` to rerun unchanged inputs. Failed or incomplete runs cannot update the hash.
Every full-suite fallback kill requires the same first failure in a second run, regardless of the test file;
an unconfirmed kill aborts without replacing the report. The inventory records the count of fallback kills.
The full-suite subprocess has a 600-second limit, allowing the growth test's 300-second limit and browser work.
SIGTERM and SIGHUP unwind the copy and subprocess cleanup; SIGKILL cannot be handled. The report is replaced by renaming a
completed temporary file in the same directory, so an interrupted write leaves the previous inventory intact.
A time-ratio probe in the same directory compiles seventeen shapes at 4n and 64n in fresh processes, takes the minimum
of five samples independently at each size and fails at 32×. Alternating size order and using minima reduces delays
from competing work; it cannot eliminate contention or guarantee a pass on every machine. Warm-up uses a different
source from both timed sizes. Shapes include many snippets with
JS blocks, constants followed by branches, and constants each used. The metadata whitespace and nested-block
shapes time 64 compiles per process to keep small measurements above clock noise.

The gate sees total compile time, including native operations without a named work counter. A linear shape grows
about 16×; a dominant quadratic part grows toward 256×. The `actualWrites` array using `includes` must exceed 32×
on `manyUrls`. A small quadratic component can still pass: it has to contribute enough at 64n to push the total
ratio over 32. Growth present in only some samples passes when a fast large sample remains: the minimum
intentionally discards sporadic slow paths as well as scheduler delays. This is a regression probe at these sizes,
not a proof of linear complexity or a render benchmark.

Benchmark probes live in `tests/bench/`. Extract `main` without switching branches, then run:

```sh
python3 tests/bench/extract-main.py /absolute/path/to/main
bun tests/bench/verify.ts /absolute/path/to/main
python3 tests/bench/measure.py /absolute/path/to/main /absolute/path/to/branch /absolute/path/to/results
```

The measurement runner verifies all four independent outputs, runs main/main controls before main/branch, and
records eight AB/BA rounds per probe. It creates the supplied output directory and writes commands, raw samples,
verified outputs and tables there. Add `--rounds 4` for a shorter run.
