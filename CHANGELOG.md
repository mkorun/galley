# Changelog

All notable changes to `galley` are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

### Breaking

- A number in brackets follows the rules of a numeric literal, also in `{#each}` collections. `a[007]` read `a[7]`
  and is now G1106, suggesting `7`. A number beyond `Number.MAX_SAFE_INTEGER` in magnitude, in brackets or as a
  literal, read a different number (`a[9007199254740993]` read key `9007199254740992`, 310 nines read `Infinity`)
  and is now G1107; quote such a key, as in `a['9007199254740993']`, or pass the number in data.
- `stripEmptyMeta` keeps a `<meta content>` or `<link href>` whose value is written only by snippets that can write
  no dynamic value. `{#snippet s()}{/snippet}<meta name="d" content="{@render s()}">` rendered nothing and now
  renders the tag with `content=""`. A snippet that can write a dynamic value still lets an empty tag go; for a tag
  that should go when empty, write its value with an output, such as `content="{ value }"`.

## [0.5.0] — 2026-11-25

### Fixed

- Lone-quote string literals in 0.4.0 and earlier could smuggle arbitrary JS into the generated render function,
  independent of `allowCode`. String literals now require both quotes and are generated from their parsed values;
  lone quotes are rejected in directives and remain literal text in outputs that do not parse.
- Locate expression spans from their positions in template tags, so repeated binding or keyword text cannot
  move diagnostics to an earlier occurrence. `{@const title = title}` now reports G5002 at column 17.
  Pipes inside parentheses or arguments exclude surrounding whitespace, so G5002 and G3022 point at the first
  character of the expression and G5002 names it without the surrounding blanks.
- Reject leading-zero numeric literals such as `007` and `-01` with G1106 at the literal and a suggested spelling,
  instead of leaking the JavaScript engine's SyntaxError.
- Parse comparisons beginning and ending with quoted operands, such as `'x' === 'y'`, as expressions.
  Outputs containing one, such as `{ a || 'x' === 'y' }`, were literal text and now render a value; write `\{`
  to keep them as text. A single string literal containing its own quote or an escape remains G1101.

- Discover surrounding loop metadata in nested `{#each}` collection paths, including computed segments deeper in a path.
  `lists[length]`, `lists[position]`, `lists[isFirst]` and `lists[isLast]` now use the enclosing loop's
  bindings even when no other expression reads them; output paths retain their existing behavior.

### Breaking

- B9: the loop name `position` shadows every outer binding of that name: data, a constant or a snippet parameter.
  `$.position` reaches only root data; rename shadowed constants or parameters. Items/indices named `position`
  are G2213; duplicate body declarations are G3021.

- B6: snippet calls require exact arity. G3020 reports missing and extra `{@render}` arguments;
  calls from `{@js}` throw TypeError naming the snippet and expected/actual counts.

- B5: G3022 refuses a pipe after an unparenthesized unary, boolean or comparison expression.
  Group the operator expression, or group the pipe when it is an operand; `??` is exempt.
  In output tags, bind the operator result with `{@const}` before piping it.
- B5: an output with a pipe inside parentheses, such as `{ a || (b | upper) }`, was literal text and is now an
  expression: it renders when every pipe names a registered filter, otherwise G3001; in script/style it is G3001
  or G3018. Escape the opening brace as `\{` to keep it as text.

- B4: link built-in and custom filters at compile time; unknown names are G3001 errors at the filter's name.
  Pass custom functions in `options.filters` on `galley()` or `lint()`; entries may replace built-ins. The linked
  registry is frozen, so `{@js}` cannot replace a filter for later renders.
  `render(data)` no longer takes filters: a second argument and the removed `knownFilters` option throw TypeError.
  Filter failures now report G5003 with the filter name, source location and original `cause`.

- B1: report G3007 with a source location for every bound name the engine cannot bind in strict async JavaScript
  or the generated code needs as a global (`String`, `Object`, `Array`, `TypeError`, `undefined`). This also refuses `await`
  without awaiting code and globals used as an item, index or parameter where they previously worked.
- B1: report G3021 at the second declaration in a generated scope, including expanded partials, snippet parameters,
  loop metadata and snippet names visible to JS. A snippet callable by `{@js}` may no longer take the name of a
  parameter of its enclosing snippet. Inner-block and loop-item shadowing remain allowed. Snippet names that
  `{@js}` cannot call have no generated binding and are exempt from G3007.

- B3: refuse every template tag inside `on*` and `srcdoc` attributes (G3017), in every namespace and ASCII case.
  Pass handler data through `data-*`; whole static attributes inside blocks remain allowed.
- B3: check each piece of `srcset` and `imagesrcset` at render (G5001). Relative and allowed-scheme URLs pass,
  including `https://cdn.example/`; protocol-relative, `data:` and other schemes stop. Static `&` anywhere in a list
  with a dynamic write is G3015; move query text into an escaped value.
- B3: for a single URL, a forbidden prefix followed by a raw `&` in the same write now keeps the forbidden-prefix
  G5001 reason (`a relative one, or one of http:, https:, mailto:, tel:`), rather than becoming `undecided`.
  The same writes are stopped. For example, `href="{@raw u}"` with `u = "javascript:&x"` still fails.

- B7a: rule 17 refuses escaped values in script/style with G3018, including values in rendered snippets; the
  diagnostic identifies the value and its render call. Static text and raw/JS output keep their existing rules.
- B7a: the first path name must be an identifier. Outside script/style, an output that fails only this rule is G3019,
  always on; other tags report a parse error. Use `$.user-name` for a special data key. Inside script/style such a brace
  becomes literal text: CSS `{margin:0}` is retained, and a former `{ user-name }` interpolation stays as written.

### Added

- B8: `strictUndefined` (default false) stops renders with G5002 and the expression/source place for undefined
  output, each collections, const values and initial pipe inputs outside conditions. Checks evaluate once;
  conditions, direct snippet arguments, filter arguments and intermediate results retain their lenient contracts.

- B7b: `strictBraces` (default false) refuses every malformed unescaped `{` outside script/style with G3019,
  including through snippets and partials. `lint()` reports the same source location and reason; write `\{` for text.

- B9: one-based `position` for array and object loops, generated only when referenced.
  Nested loops own it; empty fallbacks retain the surrounding binding.

- B6: snippets take several distinct positional parameters; every argument is forwarded in order,
  including calls from `{@js}`. Repeated parameters are G2222. Partial snippet libraries are
  exempt from unused-snippet G3006 warnings.

- B5: pipes in parenthesized operands; `oneOf` with strict equality; `plural(locale, forms)`
  using host plural rules (cached for up to 100 locales), finite counts and explicit category forms. Unsupported
  locales and invalid forms throw instead of choosing defaults. G1102 and G1103 name the parentheses when an
  operator follows a pipe.

- B2: support one `{:else}` fallback for `{#each}`. It renders exactly when the body runs zero times and uses the
  surrounding bindings, with its own snippet scope. Both paths must preserve their HTML context and delimiter rules.

### Documentation

- B1: document paths as `??` fallbacks.

## [0.4.0] — 2026-11-20

### Security

- Close HTML placement and URL-admission bypasses affecting 0.3.0–0.3.4, including `strip: true`. Accept a strict
  writing grammar with one compile-time reader; check URL prefixes incrementally at nonempty dynamic writes.
- Refuse dynamic SVG animation values (G3016), including attributes supplied by snippets or partials.
  Versions 0.3.x render these values unchecked.
- Check every URL attribute end after a nonempty dynamic write, including literal snippet output and character references.
  `<a href="{ u }:alert(1)">` with `u = "javascript"` now stops with G5001; 0.3.x renders the inline form unchecked.
- Preserve literal NUL prefixes and shared safe string conversion for escaped output and built-in filters.
- Capture actual metadata tags without output markers and preserve lint warnings alongside context errors.

### Breaking

- Finished URL prefixes receive an end check when the value had a nonempty dynamic write. An unsettled bare word
  includes file names such as `page.html` and host names such as `example.org`. Any following character reference
  stops with G5001, including `&amp;`, `&#x2F;` and `&shy;`. For a relative file URL, use `href="./{ file }&amp;b=1"`.
  A host followed by a literal port also stops: migrate `href="{ host }:8080/"` to `href="https://{ host }:8080/"`.
  Static fallbacks without a nonempty dynamic write remain unchecked.
- Refuse template tags in `to`, `from`, `by` and `values` on `set`, `animate`, `animateMotion` and
  `animateTransform`, in every namespace and regardless of `attributeName` (G3016). Static values remain valid.
- `lint()` always returns `Promise<Diagnostic[]>`. Migrate `lint(source, options)` to `await lint(source, options)`.
  With `includes`, partials resolve before checking; without a resolver, each partial preserves its entry context
  and the surrounding template is still checked. Both paths honor `strip`.
- Refuse XML prologs, CDATA and dynamic tag names.
- URL-like markup inside text elements, including scripting-enabled `noscript`, is text and receives no URL
  attribute check. Only actual quoted URL attributes receive admission; scripting-disabled parsing is outside the guarantee.
- Refuse malformed HTML separators, incomplete or split delimiters, end-tag attributes, dynamic unquoted values,
  attribute-writing snippets, nonpreserving blocks/calls, unsafe foreign integration content, `select`, `frameset`,
  `plaintext`, and `col` inside `template` (G3008–G3014).
- Refuse references in unsettled URL starts before the first template tag, and starts that are already forbidden
  (G3015, only in values with a dynamic write, including an empty write). Subsequent static references and raw/JS ampersands make an unsettled prefix undecided and stop the next nonempty write or the attribute-end check with G5001.
- Apply `strip` to static text before HTML checking; whitespace inside dynamic values is preserved. Bytes around
  values can differ from output-wide stripping. Keep the exported `util.stripWhitespace` helper.
- Remove standalone comment lines in the lexer everywhere; refuse template tags inside inline comments.
  A comment beside `<galley:config>` now becomes standalone after config removal, in either order; 0.3.4 kept it.
- Keep the line break after a block tag that follows another template tag on its line (G-22). With `a = 1` and
  `p = true`, `{ a }{#if p}\nA\n{/if}` now renders `1\nA\n` instead of `1A\n`.
  Likewise, `<ul>\n{#each xs as v}{#if v}\n  <li>{ v }</li>\n{/if}{/each}\n</ul>` with `xs = [1]` renders
  `<ul>\n\n  <li>1</li>\n\n</ul>` instead of `<ul>\n  <li>1</li>\n</ul>`.
- `stripEmptyMeta` preserves whitespace supplied by dynamic values. It still removes static indentation and one
  following static line break across blocks when the metadata tag goes, as in 0.3.4.
- A snippet visible to `{@js}` must also compile as ordinary text, even when its `{@render}` calls are all in
  quoted attributes. Invalid ordinary-text HTML in that snippet is now refused.
- Static-only snippet results no longer create a URL write checkpoint just because their result is nonempty.
  Versions 0.3.x checked completed snippet results, including static-only values. Finished prefixes
  receive the conditional attribute-end check described above.
- Reserve `String`, `Object`, `Array` and `TypeError` for generated runtime calls (G3007).

### Fixed

- Report rule 5 and rule 9 HTML refusals at the opening tag and include tag/quote identities in context mismatches.
- Bound compiler work for joined and stripped text: append source spans in place and map positions only on refusal.

### Removed

- The URL character-reference decoder and its entity tables.
- Browser-repair states, continuation searches, comment records and the post-reader comment-removal pass.

## [0.3.4] — 2026-10-31

### Security

- A value that held the marks of `stripEmptyMeta` could pass the check of URL attributes (`G5001`) and lose them
  afterwards, which wrote `href="javascript:…"` from a value, in any template with a value in `<meta content>` or
  `<link href>`. The four characters U+E000 to U+E003 of a value are now written as character references.

### Changed

- A partial that includes itself stops with `G4003` and names the chain; it filled the memory or hung.
- `{@const}` and `{#snippet}` may not take the name `String`, `Object` or `Array`, which the generated code calls (`G3007`):
  a snippet of that name turned the check of URL attributes off.

### Fixed

- An object whose `toString` is no function stopped the render with `No default value`.

## [0.3.3] — 2026-10-28

### Fixed

- `!` bound looser than the binary operators: `{#if !a || b}` was read as `!(a || b)`, and so were `!a && b` and `!a === b`. It now binds tighter than all of them, as in JavaScript; `!(a || b)` still negates the group.

## [0.3.2] — 2026-10-26

### Fixed

- `{@raw}` with a value that is not a string (a number, a boolean) threw `w.lastIndexOf is not a function` in 0.3.1; it is written as its string form again.

## [0.3.1] — 2026-10-26

### Fixed

- `G5001` checked only a value that directly followed `href="` and the other URL attributes in the template's text, so a URL of another scheme passed in an `{#if}` (`href="{#if a}{ a.url }{/if}"`), after an empty value (`href="{ unset }{ url }"`) and after a space (`href=" { url }"`). Each value written into a URL attribute is now checked at render time with what the attribute holds before it, a snippet's output too.

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
