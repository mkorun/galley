# galley — Template Engine

Svelte-inspired template engine that compiles templates once into native JS functions. Rendering is pure function execution — no parser, no overhead.

**Compile-time templating. Typed AST, source-spanned diagnostics. Strict-mode codegen. No runtime parser.**

## Installation

```bash
bun add @mkorun/galley
# or
npm install @mkorun/galley
```

## Quick Start

```typescript
import galley from '@mkorun/galley'
import util from '@mkorun/galley/util'

// Compile once (e.g. at build start)
const tpl = await galley(templateSource, {
  includes: {
    import: (path: string) => Bun.file(path).text(),
    basedir: './templates',
  },
})

// Render many times — no parse overhead
// `await` works for both sync and async templates (a non-Promise value
// resolves immediately) and is the only call shape TypeScript can type as
// a plain `string` without first checking `tpl.async`.
const html = await tpl.render(data, util)
```

## Getting Started

### 1. Write a template (`article.chase`)

```html
<!DOCTYPE html>
<html lang="{ meta.lang ?? 'en' }">
<head>
  <title>{ meta.title }</title>
</head>
<body>

  {#if isDraft}
    <div class="banner">Draft — not published</div>
  {/if}

  <h1>{ meta.title }</h1>

  {#if meta.tags}
    <ul>
      {#each meta.tags as tag}
        <li><a href="/tags/{ tag | slugify }">{ tag }</a></li>
      {/each}
    </ul>
  {/if}

  <main>{@raw markup}</main>

</body>
</html>
```

### 2. Compile and render

```typescript
import galley from '@mkorun/galley'
import util from '@mkorun/galley/util'
import { readFile } from 'node:fs/promises'

const source = await readFile('./templates/article.chase', 'utf-8')
const tpl = await galley(source, {
  includes: {
    import: (path) => readFile(path, 'utf-8'),
    basedir: './templates',
  },
})

const html = await tpl.render({
  meta: { lang: 'en', title: 'My First Post', tags: ['web', 'ssg'] },
  markup: '<p>Rendered markdown HTML.</p>',
  isDraft: false,
}, util)
```

All template data lives in the context object `$`. `{ meta.title }` accesses `$.meta?.title` — undefined values produce an empty string, never an error.

The compiler also exports `lint()`, structured diagnostics, and the typed AST
parser for editor and build-tool integrations:

```typescript
import { lint } from '@mkorun/galley'

const diagnostics = lint(source, {
  sourceId: 'article.chase',
  knownFilters: new Set(['slugify', 'dateFormat']),
})
```

The same filter check can run during compilation by passing `knownFilters`.
Unknown names are returned as `G3001` warnings in `tpl.diagnostics`:

```typescript
const tpl = await galley(source, {
  includes,
  knownFilters: new Set(Object.keys(util)),
})
```

`lex()`, `parse()`, and the AST types are available for editor tooling. The AST
shape is experimental during the 0.x series; diagnostics and their codes are
the preferred integration boundary.

### 3. Partials for shared layouts

Partials are embedded at **compile time** — no runtime overhead:

```html
{@partial partials/head.sort}
<body>
  ...page content...
</body>
{@partial partials/footer.sort}
```

Partials share the same `$` context as the parent template.

Partial paths must be relative and may not contain `..` path segments, absolute
roots, drive-letter roots, or NUL bytes. Include resolvers should additionally
enforce their own filesystem boundary before reading a file.

---

## Tag Reference

### `{ variable }` — Escaped output

HTML-escapes the value. Safe for user input and metadata.

```html
<h1>{ meta.title }</h1>
<meta name="description" content="{ meta.description }">
```

Special characters are escaped: `&` → `&amp;`, `<` → `&lt;`, `>` → `&gt;`, `'` → `&apos;`, `"` → `&quot;`.

**With fallback:**

```html
<html lang="{ meta.lang ?? 'en' }">
```

Fallback values must be literals: strings (`'…'` / `"…"`), numbers (`1`, `1.5`), `true`, `false`, `null`, or `undefined` — not arbitrary expressions.

---

### `{@raw variable}` — Raw HTML output

Outputs the value **without** escaping. Use only for trusted HTML.

```html
{@raw markup}
{@raw meta.html ?? ''}
```

Typical use case: rendered Markdown HTML.

---

### `{#if condition}` — Conditionals

```html
{#if meta.subtitle}
  <h2>{ meta.subtitle }</h2>
{/if}
```

**Else-if and else:**

```html
{#if navigations.main}
  <!-- main nav -->
{:else if navigations.footer}
  <!-- fallback nav -->
{:else}
  <!-- no nav -->
{/if}
```

**Negation:**

```html
{#if !isDraft}<meta name="robots" content="index">{/if}
{#if !item.isCurrent}<a href="{ item.urlPath }">{ item.title }</a>{/if}
```

**Comparisons** (`===` `!==` `>` `<` `>=` `<=`):

```html
{#if items.length > 0}<ul>…</ul>{/if}
{#if status === 'published'}<span>live</span>{/if}
{#if count >= 3}…{/if}
{:else if count > 0}…
```

**Logical operators** (`&&` `||`):

```html
{#if isUpdated && meta.publishFrom}
  <p>(First published { meta.publishFrom | dateFormat })</p>
{/if}

{#if isDraft || isScheduled}
  <span class="badge">Not live</span>
{/if}

{#if status === 'published' && !isUpdated}
  <span>Current</span>
{/if}
```

Operator precedence matches JavaScript: `!` > comparisons > `&&` > `||`. Mix freely without extra parentheses.

**Inline:**

```html
{ meta.title }{#if isDraft} <em>Draft</em>{/if}
```

---

### `{#each collection as item}` — Loops

Iterates over arrays and objects. Loop helper variables are available inside the block:

| Variable | Meaning |
|----------|---------|
| `isFirst` | `true` for the first element |
| `isLast` | `true` for the last element |
| `length` | total number of elements |

```html
{#each navigations.footer as link}
  <a href="{ link.urlPath }">{ link.title }</a>
  {#if !isLast}<span>&bull;</span>{/if}
{/each}
```

**With index:**

```html
{#each meta.tags as tag, i}
  <a href="/tags/{ tag | slugify }">{ tag }</a>
{/each}
```

**Over objects** (iterates `Object.values()`):

```html
{#each site.pages as page}
  <a href="{ page.urlPath }">{ page.meta.title }</a>
{/each}
```

If a loop variable shadows an outer name, use `$.prop` to reach the top-level context explicitly — `$` always refers to the data object passed to `render()`, regardless of local shadowing:

```html
{#each items as title}
  {@const outerTitle = $.title}
  <!-- { title } is the current item; { $.title } is always the top-level one -->
{/each}
```

---

### `{#snippet name(param)}` / `{@render name(expr)}` — Snippets

Defines a reusable HTML block that can be called multiple times within the same template.

```html
{#snippet articleCard(article)}
  <article class="card">
    <h3><a href="{ article.urlPath }">{ article.meta.title }</a></h3>
    <p>{ article.meta.description | truncate(120) }</p>
  </article>
{/snippet}

{#each related.articles as article}
  {@render articleCard(article)}
{/each}
```

Snippets can also be defined without parameters:

```html
{#snippet loadingSpinner()}
  <div class="spinner" aria-hidden="true"></div>
{/snippet}

{@render loadingSpinner()}
```

---

### `{@partial path/to/file.sort}` — Partials

Embeds another template file **at compile time**. The partial is fully inlined into the parent template — no runtime overhead.

```html
{@partial partials/head.sort}
{@partial partials/footer.sort}
```

The path is relative to `basedir` from the compiler options. Unsafe traversal,
absolute, UNC, and Windows drive-prefixed paths are rejected before the include
resolver is invoked.

---

### Filters / Pipes

Transform the value before output. Escaped output (`{ }`) escapes after filtering.

```html
{ tag | slugify }
{ meta.description | truncate(120) }
{ meta.title | upper }
{ meta.date | isoDate }
{ meta.date | dateFormat('en-US') }
{ meta.date | dateFormat(meta.lang) }
```

Filter arguments can be **literals** (`'en-US'`, `120`) or **scope paths**:

```html
{ meta.date | dateFormat(meta.lang) }   ← scope path → $.meta?.lang
{ title | truncate(config.maxLen) }     ← scope path → $.config?.maxLen
```

Path arguments are resolved with optional chaining — undefined-safe, including loop-scope variables.

Pipes are chainable:

```html
{ content | striptags | truncate(200) }
```

**Built-in filters:**

| Filter | Signature | Description |
|--------|-----------|-------------|
| `upper` | `(s)` | Uppercase |
| `lower` | `(s)` | Lowercase |
| `capitalize` | `(s)` | First letter uppercase |
| `trim` | `(s)` | Trim whitespace |
| `truncate` | `(s, n, suffix?)` | Truncate to n characters (default suffix: `…`) |
| `replace` | `(s, from, to)` | Replace all occurrences |
| `striptags` | `(s)` | Strip HTML tags |
| `slugify` | `(s)` | URL-friendly slug (NFD, diacritics removed) |
| `isoDate` | `(s)` | ISO 8601 timestamp (`"2024-01-15"` → `"2024-01-15T00:00:00.000Z"`) |
| `dateFormat` | `(s, fmt)` | Locale (`'en-US'`) → long-form text; pattern (`'yyyy-MM-dd'`) → token replacement |
| `dateShort` | `(s, locale?)` | Day + long month name, locale-aware (`"11. Juli"` / `"July 11"`) |
| `dateDay` | `(s)` | Day of month as string (`"14"`) |
| `dateMonthShort` | `(s, locale?)` | Short month name without trailing period (`"Jul"`, `"Sep"`, `"Mär"`) |
| `join` | `(arr, sep?)` | Join array with separator |
| `first` | `(arr)` | First element |
| `last` | `(arr)` | Last element |
| `length` | `(arr\|s)` | Length of array or string |
| `round` | `(n, decimals?)` | Round number |
| `number` | `(n, locale?)` | Format number with locale |

Custom filters can be passed via `util` — any function on the `util` object is available as a pipe.

---

### `{@const name = expr}` — Local variables

Binds a galley expression to a local name. The right-hand side is a regular galley expression (path, `??`, pipes) — not JavaScript.

```html
{@const displayTitle = meta.title ?? 'Untitled'}
{@const tagCount = meta.tags | length}
{@const baseUrl = site.origin}

<h1>{ displayTitle }</h1>
{#if tagCount > 0}
  <p>{ tagCount } tags</p>
{/if}
```

**Scoping:** The variable belongs to the current block scope — inside `{#each}` it is loop-local and unavailable after `{/each}`.

```html
{#each articles as article}
  {@const slug = article.urlPath}
  <a href="{ slug }">{ article.meta.title }</a>
{/each}
```

Use `{@const}` to alias a long path, cache a computed value (via pipe), or name a condition. It is the preferred alternative to `{@js}` for simple cases without arithmetic.

---

### `{@js}` — JS code blocks

Evaluates arbitrary JavaScript. Requires `allowCode: true`. Output is unescaped (`{@raw}` semantics).

JavaScript blocks execute in strict mode, matching the generated render function.

> **Security boundary:** Templates are trusted code, not user input. `{@js}` runs with the
> privileges of the host process and galley does not provide a sandbox. `allowCode: false`
> disables `{@js}`, but it is defense in depth rather than a sandbox guarantee; do not compile
> templates supplied by untrusted users.

```html
{@js}
  const { meta, markup } = $
  const wordCount = markup.split(/\s+/).length
  return `<p>${wordCount} words · ${Math.ceil(wordCount / 200)} min read</p>`
{@js}
```

The block has full access to `$` (context), `$$filters` (the filter map passed to
`render()`), and all loop/snippet variables. `await` is allowed — the template
is then compiled as an `async function`.

For simple date formatting, the built-in filters are preferred — no `{@js}` needed:

```html
<time datetime="{ meta.date | isoDate }">{ meta.date | dateFormat('en-US') }</time>
```

---

### `<galley:config>` — Template metadata

An optional JSON block at the top of the template. Not a runtime tag — galley removes it before compilation. The parsed data is consumed by the hadley layer, not galley core.

> Note: This tag was `<chase:config>` until the package's rename from `chase` to `galley` (v0.2.0) caught up with it — it now matches the package name.

**Structure:** Top-level keys are namespaces. Currently defined: `"images"`.

```html
<galley:config>
{
  "images": {
    "default": {
      "widths": [640],
      "formats": ["webp"],
      "sizes": "(max-width: 767px) calc(100vw - 2rem), 640px",
      "quality": 72
    },
    "hero": {
      "widths": [1200, 2400],
      "formats": ["webp"],
      "sizes": "100vw",
      "quality": 80
    }
  }
}
</galley:config>
```

**`images` namespace:** Each key is an image variant. `"default"` applies to unannotated images. Named keys are referenced via Markdown annotations:

```markdown
{hero}![Header image](header.jpg)   → uses "hero" config, no <div> wrapper
![Regular image](photo.jpg)         → uses "default" config

{gallery}
![Image 1](a.jpg)
![Image 2](b.jpg)                   → group with "gallery" config, wrapped in <div class="image-group">
```

A single annotated image (`{key}![…](…)`) produces a one-element group internally — the wrapper `<div>` is omitted automatically, only the config key selection applies.

---

## Compiler Options

```typescript
interface GalleyOptions {
  includes: {
    import: (path: string, enc: string) => Promise<string>  // file reader function
    basedir?: string    // base directory for partials (default: '.')
  }
  allowCode?: boolean       // enable {@js} blocks (default: false)
  strip?: boolean           // compress whitespace via util.stripWhitespace (default: false)
  debug?: boolean           // expose generated function in tpl.source (default: false)
  stripEmptyMeta?: boolean  // remove <meta content=""> and <link href=""> (default: true)
  knownFilters?: ReadonlySet<string> // report unknown pipes during compilation
}
```

---

## How Templates Are Compiled

Each template is compiled once into a JS function:

```typescript
// Compile once
const tpl = await galley(templateSource, options)

// Render many times — no parse overhead
const html = await tpl.render({ meta, markup, isDraft, tags }, util)
```

The generated function looks roughly like this:

```javascript
function($, $$filters) {
  'use strict';
  $ ??= {};
  let $$ = '';
  $$+='<!DOCTYPE html>\n<html lang="';
  {const $$v1=$?.meta?.lang;$$+=$$v1==null?'':typeof $$v1==='string'?$$v1.replace(/[&<>'"]/g,c=>$$html[c]):$$v1;}
  $$+='">\n<body><h1>';
  {const $$v2=$?.title;$$+=$$v2==null?'':typeof $$v2==='string'?$$v2.replace(/[&<>'"]/g,c=>$$html[c]):$$v2;}
  if($?.isDraft){$$+=' <em>Draft</em>';}
  $$+='</h1>';
  $$+=($?.markup??'');
  $$+='</body></html>';
  return $$;
}
```

`$$html` (the escape table) is passed as a closure at compile time — no per-render overhead.

---

## Performance

Representative median from five serial runs on Bun 1.3.14, Linux x64,
2026-08-17:

| Implementation | Shape | Compile | Render |
|---|---|---:|---:|
| AST baseline | base | 6.76 µs | 0.22 µs |
| AST baseline | loop | 8.64 µs | 0.34 µs |
| private legacy oracle | base | 7.67 µs | 0.27 µs |
| private legacy oracle | loop | 11.73 µs | 0.35 µs |

Both compile and render are in the same low-single-digit-to-double-digit
microsecond range as the compact legacy oracle in these small shapes — close
enough that run-to-run and machine-to-machine variance can move either
implementation ahead. These are internal microbenchmarks, not
application-wide performance claims. A reproducible cross-engine comparison
with output verification is maintained under `private/bench/`.

---

## Known Limitations

- **`stripEmptyMeta` is a text heuristic, not an HTML parser.** It recognizes `<meta ... content="...">` and `<link ... href="...">` immediately preceding a dynamic value and removes the tag only if every dynamic piece of that attribute resolved to nothing. It does not understand HTML structure beyond that shape — content that happens to look like one of these tags outside real markup (inside a `<pre>` block, for example) is not specially excluded.
- **Misspelled or unregistered pipe names compile without complaint unless you opt in.** Filters are resolved at render time (`tpl.render(data, filters)`), not compile time, so galley cannot know your filter set unless you tell it: pass `knownFilters` (to `galley()` or `lint()`) to get a `G3001` warning for typos like `slugfiy`. Without it, a typo surfaces as a runtime `TypeError` with no source location.
- **Invalid output expressions fail differently depending on where they are.** Per ADR-015, a malformed plain `{ expr }` falls back to literal text — useful for avoiding false positives on CSS/JS-shaped content that happens to sit inside `{ }`, but it also means a typo in that position can silently do nothing instead of erroring. Structurally required expressions (`{#if}` conditions, `{#each}` collections, `{@render}` arguments) always raise a compile error instead, since there's no sensible literal fallback for them.
- **The include resolver is responsible for real filesystem confinement of `{@partial}` paths.** galley rejects the syntactic red flags before ever calling the resolver — `..` segments, absolute roots, UNC and Windows drive-prefixed paths, NUL bytes — but it has no notion of your filesystem layout, so it cannot itself guarantee a resolved path stays inside any particular directory.

---

## Untrusted input

Templates are trusted code, not user input — this applies to the whole template, not just `{@js}` blocks. There is no sandbox, and `allowCode: false` is defense in depth rather than a safety guarantee for content you don't control. Don't compile a template you didn't write or fully review yourself; if you need to process one from a source you don't trust, treat it like arbitrary code (isolated process, resource limits) rather than as data.

---

## RE2 compatibility

The compiler's own regular expressions — in the lexer, path/expression parsers, and analysis pass — use only constructs supported by RE2: character classes, anchors, and non-capturing groups, no lookaheads, lookbehinds, backreferences, or conditional constructs anywhere. The lexer itself is index-based, not regex-driven, so template delimiters and block sigils have no RE2 exposure by construction.

This is a compiler-internal property, not a runtime one: the small number of regexes that appear in *generated* render functions (HTML escaping, the `stripEmptyMeta` cleanup pass) run as ordinary JavaScript inside `new Function()`, where RE2 compatibility doesn't apply. What matters for RE2 is the compiler's own source — relevant if galley is ever embedded in a host that specifically requires RE2 syntax, or ported to a language whose regex engine is RE2-based.

---

## Tests

```bash
bun test   # unit tests
```

| File | Coverage |
|------|----------|
| `escaped-output.test.ts` | `{ var }`, escaping, undefined-safety |
| `raw-output.test.ts` | `{@raw var}` |
| **`conditionals.test.ts`** | **`{#if}`, `{:else if}`, `{:else}`, nesting, separately parenthesized logical operands** |
| **`loops.test.ts`** | **Arrays, objects, `isFirst`/`isLast`/`length`, explicit `$.prop` access past a shadowing loop variable** |
| **`snippets.test.ts`** | **`{#snippet}`, `{@render}`, parameters, lexical scoping and shadowing across nested blocks** |
| `pipes.test.ts` | All filters, chaining |
| `code-blocks.test.ts` | `{@js}`, `await` |
| **`partials.test.ts`** | **`{@partial}`, indentation, unsafe-path rejection (traversal, absolute, drive-prefixed)** |
| `fallback.test.ts` | `?? fallback`, edge cases |
| `escaping.test.ts` | Backslash escape `\{`, collision fallback |
| `whitespace.test.ts` | Bidirectional block-tag stripping |
| `const.test.ts` | `{@const}`, scoping, error handling |
| `errors.test.ts` | Compile errors with line, column, and context snippet |
| `options.test.ts` | `strip`, `debug`, `allowCode`, `stripEmptyMeta` (meta + link) |
| **`injection.test.ts`** | **Code-injection regressions: bracket paths, pipe arguments, comparison-RHS strings, special-character and `$` path roots** |

Bold rows were added or extended after review passes found real gaps — a data-key injection path reachable through ordinary template syntax without `{@js}`, snippet-shadowing that silently corrupted an outer binding at runtime, a partial-path check that missed Windows drive-relative paths, a parenthesis-balance bug that misparsed separately grouped logical operands, and a documented `$.prop` scope-escape that turned out not to actually work. Each row is what now guards against regressing.

---

## Part of the hadley ecosystem

- [@mkorun/lima](https://www.npmjs.com/package/@mkorun/lima) — frontmatter parser
- [@mkorun/galley](https://www.npmjs.com/package/@mkorun/galley) — template engine
- [@mkorun/quad](https://www.npmjs.com/package/@mkorun/quad) — HTML formatter

---

## License

ISC
