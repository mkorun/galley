# AGENTS.md

galley is a template engine for HTML: it compiles a template once into a JavaScript render function and checks, while
it compiles, where values land in the HTML and which URLs they can form.

## Read first

1. `README.md`: the language, the brace rules, the options and the diagnostics.
2. `compiler/README.md`: the pipeline and where each decision is made.
3. `SECURITY.md` and `CHANGELOG.md`.
4. `differential/README.md` when a change touches the HTML or URL checks.

## Principles

- **Look at how established tools solve it.** Before building a mechanism of your own, name the class of problem and
  how two or three leading tools of the same domain solve it; follow the proven pattern unless the difference is the
  point, and say which.
- **When fixes keep growing in one place, the design is wrong.** A second round of findings in the same place, or a fix
  that only works around a cause (a compatibility promise kept by a workaround is one), means stop, step back, and
  prefer the redesign that deletes code.
- **Readable code before line count.** A budget cuts scope, never clarity.
- **The gate guards against mistakes, not against circumvention.** `./check.sh` runs every check, the same in CI, for
  developers and for isolated runners; it changes no tracked file, and generated files are compared in a check mode
  that does not write.
- **A comparison with the previous release accepts a change;** it is not kept as a permanent gate.
- **This repository is public and holds nothing private:** no names, paths or texts from outside it, from the material
  a task brings along, or from the sites that use it.
- **Every platform counts:** Linux, macOS and Windows. Tests do not rely on timing (no tight time limits, no waiting
  for file-system events) or on how a system spells a path.
- **Reviews are by a different provider than the author.**

## How we work

- Human-owned files: `package.json`, `bun.lock`, `bunfig.toml`, `tsconfig*.json`, `.github/`, `AGENTS.md`, `CLAUDE.md`,
  `LICENSE`. Agents never change them; they propose a diff.
- `dist/` is built output that the gate compares: rebuild it with `bun run build` in every commit that changes the
  compiler.
- `./check.sh` passes before every commit; `./check.sh --release` also runs the mutation campaign, once at the end of a
  round, on a clean tree. Run it on its own and check its exit status; never pipe or chain it.
- Every test file lives directly in `tests/` and ends in lowercase `.test.ts`; the gate stops at any other file named
  like a test (`.test.`, `_spec.` and the like, in any case, ignored directories included).
- The human versions, tags, publishes and pushes.
