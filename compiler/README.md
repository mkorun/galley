# Galley AST compiler

This directory contains Galley's baseline compiler. It replaced the original
single-file implementation after passing the full behavioral suite.
The previous implementation remains temporarily in a maintainer-only workspace
outside this repository as a benchmark and conformance oracle; it is not part
of the package build, the public API, or this repository. The three tests
that compare against it (`tests/compiler.test.ts`) skip themselves when that
workspace isn't present, which is the normal state for any clone of this
repository.

## Pipeline

```text
source → cursor lexer → typed AST → partial expansion → lint/loop analysis → static strip → HTML context records → JavaScript codegen
```

- `lexer.ts` removes config tags, escaped-brace backslashes and standalone comment lines everywhere.
- `parser.ts` applies ADR-014/015 and joins adjacent literal texts.
- `lexer.ts` has no regex-engine dependency.
- `path.ts` and `expression.ts` produce structured expressions; raw template
  fragments never reach code generation.
- Every token, expression, node, and diagnostic carries a source span.
- `lint()` walks the AST and uses `new Function()` to ask the JavaScript engine whether each uncached bound name is valid in strict async JavaScript.
- `context.ts` is the only HTML reader. It records placement, URL sinks and metadata boundaries; codegen does no HTML recognition. Snippets are specialized by structural context and write-checking contract, with recursive preservation verified before generation.
- Partial boundaries survive until context checking, while declarations retain their original lexical scope.
- `url.ts` performs targeted incremental prefix admission without reference decoding at nonempty writes. It is not an HTML tokenizer.
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

The maintained representative figures live in the root `README.md`; they are
not duplicated here to avoid stale benchmark claims. Maintainer-only competitor
and legacy-oracle benchmarks live outside this repository. They verify equal
output before comparing timings.

## Commands

```bash
bun run typecheck
bun test
bun run test:compiler
```
