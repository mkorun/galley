# Changelog

All notable changes to `galley` are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.3.0] — 2026-10-26

### Added

- A value that begins a URL attribute (`href`, `src`, `action`, `formaction`, `poster`, `cite`, `xlink:href`) must be relative or start with `http:`, `https:`, `mailto:` or `tel:`; anything else, and `//host`, stops the render with `G5001`. Data could put `javascript:` into a link before. A template whose data holds such a URL on purpose must write it some other way.

## [0.2.0] — 2026-10-24

### Changed

- `{ expr }` escapes every value, not only strings: an array, object, number or boolean is turned into its string form and then escaped. In 0.1.0 an array or object from the data was written into the output unescaped, so data could inject markup (`{ tags }` with `tags: ['<script>…']`). A template that relied on that must use `{@raw}`.

## [0.1.0] — 2026-08-17

### Added

- `galley(templateSource, options)` — compiles a template once into a native JS render function; rendering is pure function execution, no per-render parse overhead
- `{ variable }` — escaped output, with optional `?? fallback`
- `{@raw variable}` — raw HTML output for trusted content (e.g. rendered Markdown)
- `{#if}` / `{:else if}` / `{:else}` conditionals — comparisons (`===` `!==` `>` `<` `>=` `<=`), negation (`!`), and logical operators `&&` / `||` with JavaScript-matching precedence
- `{#each collection as item}` / `{#each collection as item, i}` — loops over arrays and objects, with `isFirst` / `isLast` / `length` helper variables
- `{#snippet name(param)}` / `{@render name(expr)}` — reusable, file-local template blocks
- `{@partial path/to/file.sort}` — compile-time partial inlining, no runtime overhead
- `{@const name = expr}` — local variable binding, scoped to the current block
- `{@js}` — optional JavaScript code blocks (`allowCode: true`), with `await` support
- Filter/pipe system (`{ value | filter }`), chainable, with built-ins: `upper`, `lower`, `capitalize`, `trim`, `truncate`, `replace`, `striptags`, `slugify`, `isoDate`, `dateFormat`, `dateShort`, `dateDay`, `dateMonthShort`, `join`, `first`, `last`, `length`, `round`, `number`
- `stripEmptyMeta` option — removes `<meta content="">` and `<link href="">` left over from unresolved expressions
- `strip` option — whitespace compression via `util.stripWhitespace`
- `debug` option — exposes the generated function source on `tpl.source`

### Fixed

- The public `FilterMap` contract now accepts filters with precise individual argument types, so the packaged `util` object type-checks directly as the second `render()` argument in strict external TypeScript projects.
- Generated render functions now use strict JavaScript semantics, preventing Annex-B block-function leakage from corrupting lexically shadowed snippets while preserving same-block hoisting and recursion. Windows drive-relative partial paths are rejected, and separately parenthesized logical operands parse correctly.
- Special-character path roots are now emitted as quoted data-key access instead of executable JavaScript, closing a global-object injection path reachable without `allowCode`. Compiler internals use an unshadowable `$$` namespace; snippet visibility is checked lexically; multiline expression literals produce structured diagnostics; unsafe partial paths are rejected before resolver invocation; and standalone comments are stripped consistently on the first source line.
- Bracket-notation paths (`meta[...]`), pipe arguments, and comparison-RHS string literals could each smuggle arbitrary JS into the generated render function — reachable through ordinary template syntax, without `{@js}` and independent of `allowCode`. All three are now validated against a strict safe-content grammar at compile time; anything outside it either falls back to literal output (expression tags) or is rejected with a compile error (`{#each}` collection expressions).
- `{@const}` declarations now follow JavaScript block scope in `{#if}` branches; partial diagnostics restore the parent source; loop variables can no longer collide with `length` / `isFirst` / `isLast`; numeric dot-path segments are rejected cleanly; nested snippets restore their parent output buffer; and literal U+2028/U+2029 characters are escaped in generated source.
- `stripEmptyMeta` now tracks each dynamic `content` / `href` attribute independently instead of removing unrelated statically empty `<meta>` or `<link>` tags.
- `round()` now passes non-number values through consistently with the neighboring number filter.
- `$` is now recognized as an ordinary path root, both as a bare expression (`{ $ }`, `{ $.prop }`) and everywhere else a path was already valid (`{@const}`, `{#if}`, `{#each}` collections, pipe arguments). A path rooted at exactly `$` now addresses the data object passed to `render()` directly, so `{ $.prop }` reliably reaches the top-level context from inside a `{#each}`/`{#snippet}` block even when a local name shadows `prop` — as already documented in the README, but not previously implemented. Only an exact `$` root gets this treatment; `$`-prefixed roots (`$foo`, `$$foo`) are unaffected and remain ordinary (safely quoted) data-key lookups, so the existing global-object-injection protections are unchanged. One user-visible side effect: a bare `{$identifier}` with no matching data key now renders empty instead of falling back to literal text, since it is now a structurally valid (if unresolved) path rather than a parse failure — see `tests/loops.test.ts` and `tests/injection.test.ts` for the added regression coverage.
- README: the `await tpl.render(...)` call shape is now used consistently in every example — `render()`'s return type is `string | Promise<string>` until `tpl.async` is checked, so the previously shown non-`await` form did not type as a plain `string` under strict TypeScript. Also corrected the `slugify` filter description (NFD, not NFC), documented the previously-missing `dateShort` / `dateDay` / `dateMonthShort` filters, clarified which literal types are valid `?? fallback` values, and synced the `compiler/README.md` benchmark table with `README.md` (it had gone stale after the last compile-time optimization pass).
- `tests/compiler.test.ts`'s three legacy-comparison tests now load the legacy oracle via a dynamic import and skip themselves when it isn't present, instead of failing the whole file. That oracle lives in a maintainer-only workspace outside this repository and was never meant to be cloned with galley itself — a fresh clone now sees `327 pass, 3 skip` rather than a crash.

### Changed

- `CompileOptions.knownFilters` can enable unknown-pipe diagnostics during normal compilation. The AST remains available for tooling but is explicitly experimental during the 0.x series.
- Replaced the original single-file compiler with the typed AST pipeline (`lexer` → `parser` → analysis/lint → codegen). The new baseline adds source-spanned diagnostics and a parser-only linter while retaining full behavioral conformance. The legacy compiler is kept under `private/` only as an unpublished benchmark oracle.
- Loop rendering caches the resolved collection once, avoiding repeated optional-chain lookups and improving the loop benchmark hot path.
- Reduced AST compile time by roughly 36% in the representative base/loop benchmark through cursor jumps in the lexer, allocation-light parser block handling, character-code path validation, structural sharing in analysis, compact scope tracking, and direct code generation. Linting, diagnostics, security checks, and render semantics remain unchanged.

### Note

- galley started life as `chase`. The package and its exported types (`ChaseOptions` → `GalleyOptions`, `ChaseTemplate` → `GalleyTemplate`, `ChaseTemplateAsync` → `GalleyTemplateAsync`) were renamed first; the `<chase:config>` template tag initially stayed as-is and was only renamed to `<galley:config>` afterward, once the rest of the surface had settled.
- Template file conventions are deliberately untouched by the rename: layouts use the `.chase` extension, partials use `.sort` (in a `partials/` subdirectory) — these identify a file's role in the template system, not the package that compiles it.
