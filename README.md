<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/mkorun/galley/main/assets/logo-dark.svg">
    <img src="https://raw.githubusercontent.com/mkorun/galley/main/assets/logo-light.svg" alt="" width="96" height="96">
  </picture>
</p>

# galley — Template Engine

Svelte-inspired template engine that compiles templates once into native JS functions. Rendering executes those functions with targeted URL-prefix validation, without an HTML parser.

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

const diagnostics = await lint(source, {
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

HTML-escapes the value. Safe for user input and metadata in element text and in quoted attribute values; see
[Known Limitations](#known-limitations) for the places where it is not.

```html
<h1>{ meta.title }</h1>
<meta name="description" content="{ meta.description }">
```

Every value is turned into a string first (`String(value)`; `null` and `undefined` give an empty string; a failed conversion gives `[object Object]`, with a warning in debug mode), then its special characters are escaped: `&` → `&amp;`, `<` → `&lt;`, `>` → `&gt;`, `'` → `&apos;`, `"` → `&quot;`. Arrays and objects are escaped too.

**In a quoted URL attribute:** each nonempty dynamic write to `href`, `src`, `action`, `formaction`, `poster`,
`cite` or `xlink:href` is checked with all preceding serialized characters in that attribute. This includes literals,
executed branches, loops and snippet writes. A snippet's complete result creates an additional checkpoint only
when it checked a nonempty dynamic write, including its literal suffix without scanning its output twice. Static-only
results, empty strings, nullish values, empty arrays and empty snippet results create no write checkpoint.
At the end of every checked URL attribute, the finished prefix is checked once more if any nonempty dynamic
write was checked in that value. This includes all executed literal and snippet output. `{ u }:alert(1)` and
`{ u }&#58;alert(1)` stop with G5001 for `u = "javascript"`. With no nonempty dynamic write, literal fallbacks
remain unchecked. An unsettled bare word includes file names such as `page.html` and host names such as
`example.org`. Any following character reference stops, including `&amp;`, `&#x2F;` and `&shy;`.
For a relative file URL, write `href="./{ file }&amp;b=1"`. A literal port after a host also stops: migrate
`href="{ host }:8080/"` to `href="https://{ host }:8080/"`. A settled `u = "https://example.org"` remains allowed.

The prefix must be relative or use `http:`, `https:`, `mailto:` or `tel:`. Every leading slash/backslash pair is
refused, including mixed and same-host spellings. Literal NUL is read as U+FFFD; leading ASCII controls and spaces
are ignored, then TAB, LF and CR are ignored throughout. NBSP, BOM and percent escapes are left alone.

Character references are never decoded by the URL check. Before the prefix is settled as relative or an allowed
scheme, a static `&` before the first template tag is a compile error (`G3015`) when the value has a dynamic write. Write the character itself there.
A static start that is already forbidden, such as `//host/` or `data:`, is G3015 when the value has a dynamic write; use a relative URL or an allowed scheme. Static-only blocks, constants, partials and snippets keep their literal URLs.
An `&` in escaped output is safe: it begins one of the five HTML escapes and ends any scheme candidate. An `&` in
later static text or raw/JS output makes an unsettled prefix permanently undecided; the next nonempty write, or the
raw/JS write itself, stops rendering with `G5001`. The message names the attribute and quotes the serialized prefix,
including that `&`. Once settled, references are allowed, for example `/x?a=1&amp;b={ value }`.

Processing is incremental and linear in output size. `{@raw}` and `{@js}` receive this source-slot check and remain
outside the safety boundary; their authors must preserve the insertion context.

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

Typical use case: rendered Markdown HTML. Raw output must leave the HTML insertion context it found: in text,
finish any markup you open; in a quoted value, preserve its matching quote. This is the template author's obligation.
The compiler does not read raw output to discover a new context. The same obligation applies to `{@js}` results.

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
  strip?: boolean           // strip static whitespace before HTML checking (default: false)
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

The compiler resolves partials, analyzes the AST and applies lint checks. It then applies `strip`, if enabled, to
static text. One HTML reader checks that exact text and records insertion places, URL values and metadata boundaries.
Code generation emits static text unchanged and uses those records; rendering does no second HTML scan.

Escaped output uses the five-character HTML escape table. Checked URL values share an incremental prefix across
branches, loop iterations and snippet calls. Ordinary attributes and statically settled URL prefixes need no runtime
context operations.

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

The figures above describe the earlier compiler baseline. The context-analysis rebuild adds compile work and
improves warm rendering in the measured shapes; first-render costs depend on the template and its URL prefixes.
Internal microbenchmarks are not application-wide performance claims. Re-run measurements for your workload.
---

## Known Limitations

Galley accepts the following writing grammar around template tags. A “text” here means the static text between two
template tags, after lexical removals, parser whitespace handling and optional `strip`. It refuses markup requiring
browser repair at these boundaries; it does not validate a complete document tree.

| Rule | Accepted contract | Refusal |
|---|---|---|
| 1 | In ordinary text, `<` begins a start tag, end tag, comment or DOCTYPE. Write other literal `<` as `&lt;`. | G3014 |
| 2 | A start tag begins with a letter; its literal name is in one text, without whitespace, `/`, `>`, `<`, quotes, `=`, backtick or NUL. | G3014 |
| 3 | Attributes follow whitespace. Names contain no quotes, `<`, backtick or NUL; name and `=` stay in one text. | G3014 |
| 4 | Dynamic values stand inside matching quotes. Unquoted values are static, nonempty, complete in one text, without quotes, `=`, `<`, `>` or backtick. | G3008 / G3014 |
| 5 | `/` in a tag occurs only as `/>`; text elements cannot self-close. | G3014 / G3013 |
| 6 | An end tag is `</name`, optional whitespace, then `>`, all in one text; no attributes or NUL in its name. | G3014 |
| 7 | An inline comment ends at its first `-->` in one text, starts with neither `>` nor `->`, and contains no `--!>`. A DOCTYPE has whitespace after its name, no inner `<`, and ends at the first `>` in that text. | G3014; template tag inside: G3013 |
| 8 | `script`, `style`, `title`, `textarea`, `xmp`, `iframe`, `noembed`, `noframes`, `noscript` hold text until their literal end tag. No text ends with a beginning of that end tag. `script` contains no `<!--`. | G3014 / G3013 |
| 9 | `select`, `frameset` and `plaintext` are refused; `col` is refused while a `template` is counted open. `col` stays allowed elsewhere. | G3013 |
| 10 | Escaped output, raw/JS output and snippets stand in text or a quoted value. Snippets write no attributes. | G3008 / G3009 |
| 11 | Every branch, iteration, partial and snippet preserves state, tag, attribute, text owner, foreign/template counts, open tag and open quote. Between attributes, each following attribute needs whitespace on every path; a template tag cannot split `=` from its value. | G3010 for blocks; G3011 for calls; malformed separators: G3014 |
| 12 | The template finishes in ordinary text. | G3012 |
| 13 | Inside counted `svg`/`math`, text elements and integration points hold text only: no `<` except their own end tag, and no raw/JS output. Values in foreign `script`/`style` are refused. | G3013 |
| 14 | In a value with a dynamic write, the unsettled URL start before the first template tag contains no `&` and is not already forbidden. | G3015 |
| 15 | On `set`, `animate`, `animateMotion` and `animateTransform`, `to`, `from`, `by` and `values` contain no template tags of any kind. Names are ASCII case-insensitive, in every namespace, regardless of `attributeName`; this includes attributes supplied by snippets or partials. Static values stay valid. | G3016 |

`G3016` means an animation value contains a template tag. Write `to`, `from`, `by` and `values` statically;
changing `attributeName` does not enable dynamic values. Refusals locate the offending character, quote a short
excerpt and name the rule; structural mismatches include foreign/template counts and the identities of the differing open tags and quotes.

For rule 13, integration points are `foreignObject`, `desc`, `title`, `mi`, `mo`, `mn`, `ms`, `mtext` and
`annotation-xml`. Escaped output is allowed there except in `script`/`style`. A self-closing integration point opens
nothing, unless its name is also a text element, which rule 5 refuses. Open `svg`, `math` and `template` names are
counted until their matching end tags, never below zero. Every `template` start counts, including `/>`, because HTML
ignores its self-closing flag. Breakouts can leave the reader stricter than the browser.
CDATA is refused everywhere with `G3014`. Scripting is assumed enabled: `noscript` stays raw text.

Snippet specializations use the exact structural context and whether URL writes need checking; metadata tracking follows from the tag and attribute.
Context-changing recursion is `G3011`. A snippet lexically visible to `{@js}` also has an explicit ordinary-text
specialization callable by JavaScript; `allowCode: true` alone does not require one. `String`, `Object`, `Array`
and `TypeError` are reserved for generated runtime calls (`G3007`). `lint()` keeps warnings beside context errors
and accepts the same compile options. It always returns `Promise<Diagnostic[]>`: use `await lint(source, options)`.
With `includes`, it resolves partials and applies the same context and `strip` checks as `galley()`. Without a resolver,
it treats each partial as preserving its context and continues checking the surrounding template.

- **HTML escaping does not secure nested languages.** Script/style contents, event handlers, `style`, `srcdoc`,
  `srcset`, CSS URLs and other nested languages remain the author's responsibility. Raw/JS output must preserve
  its insertion context. The seven named URL attributes receive prefix admission, without an origin policy or
  completed-URL validation.
- **Standalone comment lines go in the lexer, everywhere, as in 0.3.4.** Removal includes indentation and the following
  line break, or the preceding LF/CRLF at source end. This also applies inside script, title and attribute values,
  including template tags held by those lines. Removing a `<galley:config>` on the same line can make a comment
  standalone, in either order. Inline comments remain; an inline comment holding a template tag
  is refused by rule 7.
- **`strip: true` changes static text before checking.** It removes LF and spaces/tabs before `<`, plus spaces/tabs
  after a final `>` only when the last root node is static text. Templates ending in a block or partial keep that
  trailing whitespace. It leaves dynamic values untouched. The `util.stripWhitespace` export remains available for callers.
- **`stripEmptyMeta` uses compiled tag captures.** It removes a real `meta[content]` or `link[href]` only when its
  first target attribute is empty and an executed dynamic emission participated, including an empty emission.
  Static empty tags and inactive branches are retained. Removal includes preceding static spaces/tabs and one following static line break, including across block
  boundaries; it never trims whitespace supplied by dynamic values. Complete tags start and finish in ordinary text, so removal preserves the reader's
  context; apparent metadata inside quoted values, comments or text elements stays literal.

- **Misspelled or unregistered pipe names compile without complaint unless you opt in.** Filters are resolved at render time (`tpl.render(data, filters)`), not compile time, so galley cannot know your filter set unless you tell it: pass `knownFilters` (to `galley()` or `lint()`) to get a `G3001` warning for typos like `slugfiy`. Without it, a typo surfaces as a runtime `TypeError` with no source location.
- **Invalid output expressions fail differently depending on where they are.** Per ADR-015, a malformed plain `{ expr }` falls back to literal text — useful for avoiding false positives on CSS/JS-shaped content that happens to sit inside `{ }`, but it also means a typo in that position can silently do nothing instead of erroring. Structurally required expressions (`{#if}` conditions, `{#each}` collections, `{@render}` arguments) always raise a compile error instead, since there's no sensible literal fallback for them.
- **The include resolver is responsible for real filesystem confinement of `{@partial}` paths.** galley rejects the syntactic red flags before ever calling the resolver — `..` segments, absolute roots, UNC and Windows drive-prefixed paths, NUL bytes — but it has no notion of your filesystem layout, so it cannot itself guarantee a resolved path stays inside any particular directory.

---

## Untrusted input

Templates are trusted code, not user input — this applies to the whole template, not just `{@js}` blocks. There is no sandbox, and `allowCode: false` is defense in depth rather than a safety guarantee for content you don't control. Don't compile a template you didn't write or fully review yourself; if you need to process one from a source you don't trust, treat it like arbitrary code (isolated process, resource limits) rather than as data.

---

## RE2 compatibility

The compiler's own regular expressions — in the lexer, path/expression parsers, and analysis pass — use only constructs supported by RE2: character classes, anchors, and non-capturing groups, no lookaheads, lookbehinds, backreferences, or conditional constructs anywhere. The lexer itself is index-based, not regex-driven, so template delimiters and block sigils have no RE2 exposure by construction.

This is a compiler-internal property, not a runtime one: the small number of regexes that appear in *generated* render functions (HTML escaping and whitespace trimming) run as ordinary JavaScript inside `new Function()`, where RE2 compatibility doesn't apply. What matters for RE2 is the compiler's own source — relevant if galley is ever embedded in a host that specifically requires RE2 syntax, or ported to a language whose regex engine is RE2-based.

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
