# Security

## Reporting a vulnerability

Report a vulnerability privately, through GitHub: the repository's **Security** tab, **Report a vulnerability**.
Please do not open a public issue for it. A report is answered within a week; a fix and an advisory follow, crediting
the reporter unless they ask not to be named.

## What galley guards

Templates are trusted code; their data is not. Galley accepts a strict HTML writing grammar around values and refuses
the rest. The full contract and diagnostics G3008–G3016 are in [README](README.md#known-limitations). One compile-time
reader runs after all static-text transformations. Generated code writes that text unchanged; dynamic escaped values
cannot introduce HTML delimiters. The only later static deletion, `stripEmptyMeta`, removes a complete recognized
metadata tag and its adjacent whitespace while preserving ordinary-text context.

A vulnerability is an accepted template that renders an escaped value where the reader did not read it, or a
forbidden URL prefix that passes admission. Scripting is assumed enabled. In particular, `noscript` is raw text;
parsing with scripting disabled is outside the guarantee.

Animation `to`, `from`, `by` and `values` on `set`, `animate`, `animateMotion` and `animateTransform` must be
static (G3016). Any template tag in these values is refused, including attributes supplied by snippets or partials,
regardless of `attributeName`. Element and attribute names are ASCII case-insensitive, in every namespace.

Each nonempty dynamic write in quoted `href`, `src`, `action`, `formaction`, `poster`, `cite` or `xlink:href` is checked
with all preceding serialized characters, including executed literals, branches, loops and snippets. Relative URLs
and `http:`, `https:`, `mailto:`, `tel:` are allowed. Every initial slash/backslash pair is refused, including mixed
or same-host pairs. Literal NUL is U+FFFD, leading ASCII controls/spaces are ignored, then TAB, LF and CR are ignored
throughout. NBSP, BOM and percent escapes are unchanged.

The checker never decodes character references. A static `&` before the first template tag in an unsettled URL, or a forbidden static start, is
G3015 only when the value has a dynamic write; static-only blocks, constants,
partials and snippets preserve their literal URLs. An `&` from escaped output breaks the scheme grammar safely.
An `&` in subsequent static text or raw/JS output makes an unsettled prefix permanently undecided; the next nonempty write, or that raw/JS write itself, stops with
G5001 and quotes the prefix including `&`. Settled prefixes ignore subsequent `&`. Empty writes create no checkpoint;
a snippet's complete result creates a caller checkpoint only when it checked a nonempty dynamic write, without
feeding its bytes twice. At the attribute end, the finished prefix is checked once more if any nonempty dynamic
write was checked in that value. All executed literals and snippet output participate, including character
references: `{ u }:alert(1)` and `{ u }&#58;alert(1)` stop with G5001 for `u = "javascript"`. No end check runs for
static fallbacks without a nonempty dynamic write. An unsettled bare word followed by `&amp;b=1` or `:8080/`
also stops; a relative prefix or allowed scheme settles it. This is prefix admission, without completed-URL or
origin validation.

The reader refuses malformed separators, partial delimiters and end-tag attributes. Every branch, iteration, partial
and snippet must preserve its entry context, including foreign/template counts and the identities of open tags and
quotes. Snippets write text or quoted values, never attributes. Context-changing recursion is G3011. `select`,
`frameset` and `plaintext` are refused; `col` is refused inside counted templates. CDATA is refused everywhere.

Within counted `svg`/`math`, text elements and integration points (`foreignObject`, `desc`, `title`, `mi`, `mo`, `mn`,
`ms`, `mtext`, `annotation-xml`) admit no `<` except their own end tag, and no raw/JS output. Escaped values are allowed
except in foreign `script`/`style`, where all values are refused. Counts never go below zero; self-closing svg/math
opens no foreign count. Every template start counts, including `/>`, because HTML ignores its self-closing flag.
Breakouts may leave restrictions in force longer than the browser needs them.

Comment lines are removed in the lexer everywhere, including script, title and attribute values, with any template
tags they contain. Inline comments holding template tags are refused. Optional `strip` changes only static text,
before the reader, and preserves dynamic whitespace.

Outside the boundary: template authors; raw/JS output; script/style contents, event handlers, `style`, `srcdoc`,
`srcset`, CSS URLs and other nested languages. Raw/JS authors must preserve the HTML insertion context, including
matching quotes and complete delimiters. Their output receives the source-slot URL check without extending the
boundary. Templates are not sandboxed. Filesystem confinement of partials remains the include resolver's job.

## Supported versions

Fixes go into the latest release.
