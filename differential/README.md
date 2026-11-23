# Differential and release checks

`./check.sh` checks the release tree, types, coverage tests, the build against `dist/`, and secrets when gitleaks is present.
After a change to `compiler/`, `index.ts`, `types.ts` or `util.ts`, run `bun run build` and `git add dist` before `./check.sh`.

`python3 tests/mutate-context.py` always runs one fresh campaign in a copy of tracked inputs. Stage new inputs first.
It generates mutants in that copy, baselines both test commands, and prints the Bun version, every outcome and totals.
Only recognised test failures count as kills; full-suite fallback kills need a second failure, which may name another test.
Timeouts, malformed output, invalid mutants, failed baselines and passing confirmations abort the campaign.
Reviewed reasons live in `tests/support/mutation-equivalents.json`; stale or newly killed entries fail the campaign.
The driver restores each mutant, bounds subprocesses, keeps the loop budget, and cleans up on SIGTERM and SIGHUP.

Commit the changes, then run `./check.sh --release` from a clean tree. It requires gitleaks, runs the ordinary checks,
then one complete campaign, and checks the tree again, including untracked files and ignored files under `dist/`.
Any unreviewed survivor or incomplete campaign blocks release. No mutation report or cache is written.
The existing growth timing probe can still be affected by contention; a passing run is not a proof of linear complexity.

Browser tools use `GALLEY_CHROMIUM` (default `chromium`) and fail on a broken selection without trying another browser.
Run `bun differential/run.ts` or `bun differential/strict-run.ts` for browser comparisons; the latter accepts `--smoke`.
Use `bun differential/run.ts --record` only to replace the recorded corpus result after review.
