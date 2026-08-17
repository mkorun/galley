# Galley AST compiler

This directory contains Galley's baseline compiler. It replaced the original
single-file implementation after passing the same 303-test behavioral suite.
The previous implementation remains temporarily in a maintainer-only workspace
outside this repository as a benchmark and conformance oracle; it is not part
of the package build, the public API, or this repository. The three tests
that compare against it (`tests/compiler.test.ts`) skip themselves when that
workspace isn't present, which is the normal state for any clone of this
repository.

## Pipeline

```text
source → cursor lexer → typed AST → analysis/lint → JavaScript codegen
```

- `lexer.ts` has no regex-engine dependency.
- `path.ts` and `expression.ts` produce structured expressions; raw template
  fragments never reach code generation.
- Every token, expression, node, and diagnostic carries a source span.
- `lint()` operates on the AST without invoking `new Function()`.
- `codegen.ts` emits loop metadata only when the AST proves it is used.
- All generated identifiers use an internal `$$` namespace unavailable to
  template declarations, preventing host/filter variables from being shadowed.
- Generated render functions run in strict mode so JavaScript block scope and
  the compiler's lexical snippet model agree.
- The package TypeScript configuration enables `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, and exhaustive-control-flow checks.

## Diagnostic policy

Codes are stable and grouped by phase:

- `G1xxx`: path/expression parsing
- `G2xxx`: template structure
- `G3xxx`: lint/semantic analysis
- `G4xxx`: code generation
- `G5xxx`: includes/host integration

Diagnostics contain a severity, source span, message, and optional actionable
help. Parse errors throw `GalleyDiagnosticError`; lint findings are returned as
data.

## Current benchmark

Median of five serial Bun microbenchmark runs, 2026-08-17 (see
`package/README.md` for the same figures kept in sync):

| implementation | shape | compile | render |
|---|---|---:|---:|
| legacy oracle | base | 7.67 µs | 0.27 µs |
| AST compiler | base | 6.76 µs | 0.22 µs |
| legacy oracle | loop | 11.73 µs | 0.35 µs |
| AST compiler | loop | 8.64 µs | 0.34 µs |

Relative to the first conforming AST version (18.04/22.64 µs), compile time is
materially lower. Both compile and render now sit in the same range as the
compact legacy oracle for these small shapes — close enough that run-to-run
and machine-to-machine variance can move either implementation ahead. These
are microbenchmarks, not claims of application-wide speedups.

## Commands

```bash
bun run typecheck
bun test
bun run test:compiler
bun run bench:compiler
```
