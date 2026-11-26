# Security

## Reporting a vulnerability

Report a vulnerability privately, through GitHub: the repository's **Security** tab, **Report a vulnerability**.
Please do not open a public issue for it. A report is answered within a week; a fix and an advisory follow, crediting
the reporter unless they ask not to be named.

## What galley guards

Templates are trusted code; their data is not. Galley accepts a strict HTML writing grammar around values and refuses
the rest. The full contract and diagnostics G3008–G3019 are in [README](README.md#known-limitations). One compile-time
reader runs after all static-text transformations. Generated code writes that text unchanged; dynamic escaped values
cannot introduce HTML delimiters. The only later static deletion, `stripEmptyMeta`, removes a complete recognized
metadata tag and its adjacent whitespace while preserving ordinary-text context.

A vulnerability is an accepted template that renders an escaped value where the reader did not read it, or a
forbidden URL prefix that passes admission. Scripting is assumed enabled. In particular, `noscript` is raw text;
parsing with scripting disabled is outside the guarantee.

Animation `to`, `from`, `by` and `values` on `set`, `animate`, `animateMotion` and `animateTransform` must be
static (G3016). Any template tag in these values is refused, including attributes supplied by snippets or partials,
regardless of `attributeName`. Element and attribute names are ASCII case-insensitive, in every namespace.

Template tags inside `on*` and `srcdoc` values are refused with G3017, in every namespace and ASCII case.
This includes a snippet or partial writing into such a value. Snippets cannot supply whole attributes (G3009).
Whole static attributes inside blocks remain allowed.

Each nonempty dynamic write in quoted `href`, `src`, `action`, `formaction`, `poster`, `cite` or `xlink:href` is checked
with all preceding serialized characters, including executed literals, branches, loops and snippets. Relative URLs
and `http:`, `https:`, `mailto:`, `tel:` are allowed. Every initial slash/backslash pair is refused, including mixed
or same-host pairs. Literal NUL is U+FFFD, leading ASCII controls/spaces are ignored, then TAB, LF and CR are ignored
throughout. NBSP, BOM and percent escapes are unchanged.

`srcset` and `imagesrcset` receive the same prefix check piece by piece, at the start, after ASCII whitespace and
after a comma. A list never settles. Static `&` anywhere in a list with a dynamic write is G3015; put query text in
an escaped value instead. A completely static list remains the author's responsibility.

The checker never decodes character references. A forbidden static start, or a static `&` before the first template
tag in an unsettled single URL, is G3015 when the value has a dynamic write. Static-only blocks, constants, partials
and snippets preserve their literal URLs. An `&` from escaped output breaks the scheme grammar safely. An `&` in
subsequent static text or raw/JS output makes an unsettled prefix permanently undecided; a prefix already found
forbidden keeps its forbidden-prefix refusal. The next nonempty write, including that raw/JS write itself, stops
with G5001 and quotes the prefix including `&`. Settled single-URL prefixes ignore subsequent `&`.

Empty writes create no checkpoint. A snippet's result creates a caller checkpoint only when it checked a nonempty
dynamic write, without feeding its bytes twice. At the attribute end, the finished prefix is checked once more if
any nonempty dynamic write was checked in that value. All executed literals and snippet output participate,
including character references: `{ u }:alert(1)` and `{ u }&#58;alert(1)` stop with G5001 for `u = "javascript"`,
the second at the attribute-end check. Without such a write, no end check runs.

An unsettled bare word followed by `&amp;b=1` or `:8080/` also stops; a relative prefix or an allowed scheme settles
it. This is prefix admission, without completed-URL or origin validation.

The reader refuses malformed separators, partial delimiters and end-tag attributes. Every branch, iteration, partial
and snippet must preserve its entry context, including foreign/template counts and the identities of open tags and
quotes. Snippets write text or quoted values, never attributes. Context-changing recursion is G3011. `select`,
`frameset` and `plaintext` are refused; `col` is refused inside counted templates. CDATA is refused everywhere.

Within counted `svg`/`math`, text elements and integration points (`foreignObject`, `desc`, `title`, `mi`, `mo`, `mn`,
`ms`, `mtext`, `annotation-xml`) admit no `<` except their own end tag, and no raw/JS output. Other foreign text owners
allow escaped values; foreign `script`/`style` admit no values (G3013). Counts never go below zero; self-closing svg/math
opens no foreign count. Every template start counts, including `/>`, because HTML ignores its self-closing flag.
Breakouts may leave restrictions in force longer than the browser needs them.

Rule 17 refuses escaped output in HTML `script` and `style` with G3018, including through snippets and partials.
Static text and raw/JS output retain their existing rules.
The [README's brace rules](README.md#brace-rules) apply in every context, including script/style and unused snippets.

Comment lines are removed in the lexer everywhere, including script, title and attribute values, with any template
tags they contain. Inline comments holding template tags are refused. Optional `strip` changes only static text,
before the reader, and preserves dynamic whitespace.

Outside the boundary: template authors; raw/JS output; authored script/style code, static handlers and `srcdoc`,
other URL attributes, `style` attributes, CSS URLs and other unchecked nested languages. Raw/JS authors must preserve the HTML insertion
context, including matching quotes and complete delimiters. Their output receives the source-slot URL check without
extending the boundary. Templates are not sandboxed. Filesystem confinement of partials remains the include resolver's job.

## Supported versions

Fixes go into the latest release.
