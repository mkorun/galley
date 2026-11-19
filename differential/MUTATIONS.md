# Mechanical reader and URL mutations

| Location | Kind | Before → after | Result / reason |
|---|---|---|---|
| compiler/context.ts:7 | class "A" | ` /[A-Z]/g ` → ` /[BCDEFGHIJKLMNOPQRSTUVWXYZ]/g ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:7 | class "B" | ` /[A-Z]/g ` → ` /[ACDEFGHIJKLMNOPQRSTUVWXYZ]/g ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:7 | class "C" | ` /[A-Z]/g ` → ` /[ABDEFGHIJKLMNOPQRSTUVWXYZ]/g ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:7 | class "D" | ` /[A-Z]/g ` → ` /[ABCEFGHIJKLMNOPQRSTUVWXYZ]/g ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:7 | class "E" | ` /[A-Z]/g ` → ` /[ABCDFGHIJKLMNOPQRSTUVWXYZ]/g ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:7 | class "F" | ` /[A-Z]/g ` → ` /[ABCDEGHIJKLMNOPQRSTUVWXYZ]/g ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:7 | class "G" | ` /[A-Z]/g ` → ` /[ABCDEFHIJKLMNOPQRSTUVWXYZ]/g ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:7 | class "H" | ` /[A-Z]/g ` → ` /[ABCDEFGIJKLMNOPQRSTUVWXYZ]/g ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:7 | class "I" | ` /[A-Z]/g ` → ` /[ABCDEFGHJKLMNOPQRSTUVWXYZ]/g ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:7 | class "J" | ` /[A-Z]/g ` → ` /[ABCDEFGHIKLMNOPQRSTUVWXYZ]/g ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:7 | class "K" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJLMNOPQRSTUVWXYZ]/g ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:7 | class "L" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKMNOPQRSTUVWXYZ]/g ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:7 | class "M" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKLNOPQRSTUVWXYZ]/g ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:7 | class "N" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKLMOPQRSTUVWXYZ]/g ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:7 | class "O" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKLMNPQRSTUVWXYZ]/g ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:7 | class "P" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKLMNOQRSTUVWXYZ]/g ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:7 | class "Q" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKLMNOPRSTUVWXYZ]/g ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:7 | class "R" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKLMNOPQSTUVWXYZ]/g ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:7 | class "S" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKLMNOPQRTUVWXYZ]/g ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:7 | class "T" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKLMNOPQRSUVWXYZ]/g ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:7 | class "U" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKLMNOPQRSTVWXYZ]/g ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:7 | class "V" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKLMNOPQRSTUWXYZ]/g ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:7 | class "W" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKLMNOPQRSTUVXYZ]/g ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:7 | class "X" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKLMNOPQRSTUVWYZ]/g ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:7 | class "Y" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKLMNOPQRSTUVWXZ]/g ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:7 | class "Z" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKLMNOPQRSTUVWXY]/g ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:8 | class "\\t" | ` /[\t\n\f\r ]/ ` → ` /[\n\f\r ]/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:8 | class "\\n" | ` /[\t\n\f\r ]/ ` → ` /[\t\f\r ]/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:8 | class "\\f" | ` /[\t\n\f\r ]/ ` → ` /[\t\n\r ]/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:8 | class "\\r" | ` /[\t\n\f\r ]/ ` → ` /[\t\n\f ]/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:8 | class " " | ` /[\t\n\f\r ]/ ` → ` /[\t\n\f\r]/ ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:9 | set 'href' | ` ['href', 'src', 'action', 'formaction', 'poster', 'cite', 'xlink:href'] ` → ` ['src', 'action', 'formaction', 'poster', 'cite', 'xlink:href'] ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:9 | set 'src' | ` ['href', 'src', 'action', 'formaction', 'poster', 'cite', 'xlink:href'] ` → ` ['href', 'action', 'formaction', 'poster', 'cite', 'xlink:href'] ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:9 | set 'action' | ` ['href', 'src', 'action', 'formaction', 'poster', 'cite', 'xlink:href'] ` → ` ['href', 'src', 'formaction', 'poster', 'cite', 'xlink:href'] ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:9 | set 'formaction' | ` ['href', 'src', 'action', 'formaction', 'poster', 'cite', 'xlink:href'] ` → ` ['href', 'src', 'action', 'poster', 'cite', 'xlink:href'] ` | killed: seven URL attributes, both quotes, safe schemes and all four slash pairs |
| compiler/context.ts:9 | set 'poster' | ` ['href', 'src', 'action', 'formaction', 'poster', 'cite', 'xlink:href'] ` → ` ['href', 'src', 'action', 'formaction', 'cite', 'xlink:href'] ` | killed: URL attributes > check every URL attribute, quoted either way, and a value only as the start of a URL |
| compiler/context.ts:9 | set 'cite' | ` ['href', 'src', 'action', 'formaction', 'poster', 'cite', 'xlink:href'] ` → ` ['href', 'src', 'action', 'formaction', 'poster', 'xlink:href'] ` | killed: URL attributes > check every URL attribute, quoted either way, and a value only as the start of a URL |
| compiler/context.ts:9 | set 'xlink:href' | ` ['href', 'src', 'action', 'formaction', 'poster', 'cite', 'xlink:href'] ` → ` ['href', 'src', 'action', 'formaction', 'poster', 'cite'] ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:10 | set 'set' | ` ['set', 'animate', 'animatemotion', 'animatetransform'] ` → ` ['animate', 'animatemotion', 'animatetransform'] ` | killed: G-24: SVG animation values refuse every template-tag kind in any namespace |
| compiler/context.ts:10 | set 'animate' | ` ['set', 'animate', 'animatemotion', 'animatetransform'] ` → ` ['set', 'animatemotion', 'animatetransform'] ` | killed: G-24: SVG animation values refuse every template-tag kind in any namespace |
| compiler/context.ts:10 | set 'animatemotion' | ` ['set', 'animate', 'animatemotion', 'animatetransform'] ` → ` ['set', 'animate', 'animatetransform'] ` | killed: G-24: SVG animation values refuse every template-tag kind in any namespace |
| compiler/context.ts:10 | set 'animatetransform' | ` ['set', 'animate', 'animatemotion', 'animatetransform'] ` → ` ['set', 'animate', 'animatemotion'] ` | killed: G-24: SVG animation values refuse every template-tag kind in any namespace |
| compiler/context.ts:11 | set 'to' | ` ['to', 'from', 'by', 'values'] ` → ` ['from', 'by', 'values'] ` | killed: G-24: SVG animation values refuse every template-tag kind in any namespace |
| compiler/context.ts:11 | set 'from' | ` ['to', 'from', 'by', 'values'] ` → ` ['to', 'by', 'values'] ` | killed: G-24: SVG animation values refuse every template-tag kind in any namespace |
| compiler/context.ts:11 | set 'by' | ` ['to', 'from', 'by', 'values'] ` → ` ['to', 'from', 'values'] ` | killed: G-24: SVG animation values refuse every template-tag kind in any namespace |
| compiler/context.ts:11 | set 'values' | ` ['to', 'from', 'by', 'values'] ` → ` ['to', 'from', 'by'] ` | killed: G-24: SVG animation values refuse every template-tag kind in any namespace |
| compiler/context.ts:12 | set 'script' | ` ['script', 'style', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript'] ` → ` ['style', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript'] ` | killed: G-32: every variant key field preserves placement and quote grammar |
| compiler/context.ts:12 | set 'style' | ` ['script', 'style', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript'] ` → ` ['script', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript'] ` | killed: G-32/P3: foreign count underflow is killed without Chromium |
| compiler/context.ts:12 | set 'title' | ` ['script', 'style', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript'] ` → ` ['script', 'style', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript'] ` | killed: G-32/P3: rule 5 and 9 refusals point to the start tag, including a split start tag |
| compiler/context.ts:12 | set 'textarea' | ` ['script', 'style', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript'] ` → ` ['script', 'style', 'title', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript'] ` | killed: G-32: every variant key field preserves placement and quote grammar |
| compiler/context.ts:12 | set 'xmp' | ` ['script', 'style', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript'] ` → ` ['script', 'style', 'title', 'textarea', 'iframe', 'noembed', 'noframes', 'noscript'] ` | killed: real metadata boundaries: inert contexts, quoted angles, branches, snippets, partials and markers |
| compiler/context.ts:12 | set 'iframe' | ` ['script', 'style', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript'] ` → ` ['script', 'style', 'title', 'textarea', 'xmp', 'noembed', 'noframes', 'noscript'] ` | killed: real metadata boundaries: inert contexts, quoted angles, branches, snippets, partials and markers |
| compiler/context.ts:12 | set 'noembed' | ` ['script', 'style', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript'] ` → ` ['script', 'style', 'title', 'textarea', 'xmp', 'iframe', 'noframes', 'noscript'] ` | killed: real metadata boundaries: inert contexts, quoted angles, branches, snippets, partials and markers |
| compiler/context.ts:12 | set 'noframes' | ` ['script', 'style', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript'] ` → ` ['script', 'style', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noscript'] ` | killed: real metadata boundaries: inert contexts, quoted angles, branches, snippets, partials and markers |
| compiler/context.ts:12 | set 'noscript' | ` ['script', 'style', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript'] ` → ` ['script', 'style', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes'] ` | killed: real metadata boundaries: inert contexts, quoted angles, branches, snippets, partials and markers |
| compiler/context.ts:13 | set 'foreignobject' | ` ['foreignobject', 'desc', 'mi', 'mo', 'mn', 'ms', 'mtext', 'annotation-xml'] ` → ` ['desc', 'mi', 'mo', 'mn', 'ms', 'mtext', 'annotation-xml'] ` | killed: G-12/G-21: foreign integration points admit text only and counts never underflow |
| compiler/context.ts:13 | set 'desc' | ` ['foreignobject', 'desc', 'mi', 'mo', 'mn', 'ms', 'mtext', 'annotation-xml'] ` → ` ['foreignobject', 'mi', 'mo', 'mn', 'ms', 'mtext', 'annotation-xml'] ` | killed: G-12/G-21: foreign integration points admit text only and counts never underflow |
| compiler/context.ts:13 | set 'mi' | ` ['foreignobject', 'desc', 'mi', 'mo', 'mn', 'ms', 'mtext', 'annotation-xml'] ` → ` ['foreignobject', 'desc', 'mo', 'mn', 'ms', 'mtext', 'annotation-xml'] ` | killed: G-12/G-21: foreign integration points admit text only and counts never underflow |
| compiler/context.ts:13 | set 'mo' | ` ['foreignobject', 'desc', 'mi', 'mo', 'mn', 'ms', 'mtext', 'annotation-xml'] ` → ` ['foreignobject', 'desc', 'mi', 'mn', 'ms', 'mtext', 'annotation-xml'] ` | killed: G-12/G-21: foreign integration points admit text only and counts never underflow |
| compiler/context.ts:13 | set 'mn' | ` ['foreignobject', 'desc', 'mi', 'mo', 'mn', 'ms', 'mtext', 'annotation-xml'] ` → ` ['foreignobject', 'desc', 'mi', 'mo', 'ms', 'mtext', 'annotation-xml'] ` | killed: G-12/G-21: foreign integration points admit text only and counts never underflow |
| compiler/context.ts:13 | set 'ms' | ` ['foreignobject', 'desc', 'mi', 'mo', 'mn', 'ms', 'mtext', 'annotation-xml'] ` → ` ['foreignobject', 'desc', 'mi', 'mo', 'mn', 'mtext', 'annotation-xml'] ` | killed: G-12/G-21: foreign integration points admit text only and counts never underflow |
| compiler/context.ts:13 | set 'mtext' | ` ['foreignobject', 'desc', 'mi', 'mo', 'mn', 'ms', 'mtext', 'annotation-xml'] ` → ` ['foreignobject', 'desc', 'mi', 'mo', 'mn', 'ms', 'annotation-xml'] ` | killed: G-12/G-21: foreign integration points admit text only and counts never underflow |
| compiler/context.ts:13 | set 'annotation-xml' | ` ['foreignobject', 'desc', 'mi', 'mo', 'mn', 'ms', 'mtext', 'annotation-xml'] ` → ` ['foreignobject', 'desc', 'mi', 'mo', 'mn', 'ms', 'mtext'] ` | killed: G-12/G-21: foreign integration points admit text only and counts never underflow |
| compiler/context.ts:14 | predicate | ` text.length > 80 ` → ` !(text.length > 80) ` | killed: G-30: refusals locate the offending character and bound their excerpts |
| compiler/context.ts:15 | operand | ` (tag === 'meta' && attribute === 'content') ` → ` false ` | killed: G-32/P3: empty metadata removes static indentation across blocks and leaves values intact |
| compiler/context.ts:15 | operand | ` (tag === 'link' && attribute === 'href') ` → ` false ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:15 | operand | ` tag === 'meta' ` → ` true ` | killed: G-32: metadata targets and animation element names remain distinct |
| compiler/context.ts:15 | operand | ` attribute === 'content' ` → ` true ` | killed: a value with the marks of stripEmptyMeta > leaves a meta element without a value to be removed, as before |
| compiler/context.ts:15 | predicate | ` tag === 'meta' ` → ` !(tag === 'meta') ` | killed: G-32/P3: empty metadata removes static indentation across blocks and leaves values intact |
| compiler/context.ts:15 | predicate | ` attribute === 'content' ` → ` !(attribute === 'content') ` | killed: G-32/P3: empty metadata removes static indentation across blocks and leaves values intact |
| compiler/context.ts:15 | operand | ` tag === 'link' ` → ` true ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:15 | operand | ` attribute === 'href' ` → ` true ` | killed: G-32: metadata targets and animation element names remain distinct |
| compiler/context.ts:15 | predicate | ` tag === 'link' ` → ` !(tag === 'link') ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:15 | predicate | ` attribute === 'href' ` → ` !(attribute === 'href') ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:28 | predicate | ` typeof at === 'function' ` → ` !(typeof at === 'function') ` | killed: G-32/P3: rule 5 and 9 refusals point to the start tag, including a split start tag |
| compiler/context.ts:41 | boolean | ` false ` → ` true ` | equivalent: Delimited is unused in data; every start tag initializes it before attribute reading. |
| compiler/context.ts:41 | boolean | ` false ` → ` true ` | killed: G-32/P3: JS inside a partial marks visible snippets and keeps the lexer line flag |
| compiler/context.ts:42 | operand | ` a.owner === b.owner && a.svg === b.svg && a.math === b.math && a.template === b.template && a.tagId === b.tagId ` → ` true ` | killed: G-32/P3: context identity mismatches show both tag identities |
| compiler/context.ts:42 | operand | ` a.quote === b.quote ` → ` true ` | killed: G-32: every variant key field preserves placement and quote grammar |
| compiler/context.ts:42 | operand | ` a.owner === b.owner && a.svg === b.svg && a.math === b.math && a.template === b.template ` → ` true ` | killed: G-22/G-23 rule 9: refuse text self-closing and col only while template count is positive |
| compiler/context.ts:42 | operand | ` a.tagId === b.tagId ` → ` true ` | killed: G-32/P3: context identity mismatches show both tag identities |
| compiler/context.ts:42 | operand | ` a.owner === b.owner && a.svg === b.svg && a.math === b.math ` → ` true ` | killed: G-28: each entry, missing else, tag/quote identities and math count stay distinct |
| compiler/context.ts:42 | operand | ` a.template === b.template ` → ` true ` | killed: G-22/G-23 rule 9: refuse text self-closing and col only while template count is positive |
| compiler/context.ts:42 | operand | ` a.owner === b.owner && a.svg === b.svg ` → ` true ` | killed: G-30: context mismatches name every foreign and template count |
| compiler/context.ts:42 | operand | ` a.math === b.math ` → ` true ` | killed: G-28: each entry, missing else, tag/quote identities and math count stay distinct |
| compiler/context.ts:42 | operand | ` a.owner === b.owner ` → ` true ` | killed: G-32: every review bypass keeps its refusal or URL checkpoint |
| compiler/context.ts:42 | operand | ` a.svg === b.svg ` → ` true ` | killed: G-30: context mismatches name every foreign and template count |
| compiler/context.ts:42 | predicate | ` a.owner === b.owner ` → ` !(a.owner === b.owner) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:42 | predicate | ` a.svg === b.svg ` → ` !(a.svg === b.svg) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:42 | predicate | ` a.math === b.math ` → ` !(a.math === b.math) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:42 | predicate | ` a.template === b.template ` → ` !(a.template === b.template) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:42 | predicate | ` a.tagId === b.tagId ` → ` !(a.tagId === b.tagId) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:42 | predicate | ` a.quote === b.quote ` → ` !(a.quote === b.quote) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:43 | operand | ` context.tag ` → ` false ` | killed: G-32: metadata targets and animation element names remain distinct |
| compiler/context.ts:43 | operand | ` context.owner ` → ` false ` | killed: G-32: metadata targets and animation element names remain distinct |
| compiler/context.ts:43 | predicate | ` context.attribute ` → ` !(context.attribute) ` | killed: G-32: metadata targets and animation element names remain distinct |
| compiler/context.ts:46 | predicate | ` (context.state === 'double' &#124;&#124; context.state === 'single' &#124;&#124; context.state === 'before-value')   && ANIMATION_ELEMENTS.has(context.tag) && ANIMATION_VALUES.has(context.attribute) ` → ` !((context.state === 'double' &#124;&#124; context.state === 'single' &#124;&#124; context.state === 'before-value')   && ANIMATION_ELEMENTS.has(context.tag) && ANIMATION_VALUES.has(context.attribute)) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:46 | operand | ` (context.state === 'double' &#124;&#124; context.state === 'single' &#124;&#124; context.state === 'before-value')   && ANIMATION_ELEMENTS.has(context.tag) ` → ` true ` | killed: G-32: metadata targets and animation element names remain distinct |
| compiler/context.ts:47 | operand | ` ANIMATION_VALUES.has(context.attribute) ` → ` true ` | killed: G-24: static animation values and ordinary dynamic attributes still compile |
| compiler/context.ts:46 | operand | ` (context.state === 'double' &#124;&#124; context.state === 'single' &#124;&#124; context.state === 'before-value') ` → ` true ` | killed: G-32: metadata targets and animation element names remain distinct |
| compiler/context.ts:47 | operand | ` ANIMATION_ELEMENTS.has(context.tag) ` → ` true ` | killed: G-32: metadata targets and animation element names remain distinct |
| compiler/context.ts:46 | operand | ` context.state === 'double' &#124;&#124; context.state === 'single' ` → ` false ` | killed: G-24: SVG animation values refuse every template-tag kind in any namespace |
| compiler/context.ts:46 | operand | ` context.state === 'before-value' ` → ` false ` | killed: G-24: SVG animation values refuse every template-tag kind in any namespace |
| compiler/context.ts:46 | operand | ` context.state === 'double' ` → ` false ` | killed: G-24: SVG animation values refuse every template-tag kind in any namespace |
| compiler/context.ts:46 | operand | ` context.state === 'single' ` → ` false ` | killed: G-24: SVG animation values refuse every template-tag kind in any namespace |
| compiler/context.ts:46 | predicate | ` context.state === 'double' ` → ` !(context.state === 'double') ` | killed: G-32: metadata targets and animation element names remain distinct |
| compiler/context.ts:46 | predicate | ` context.state === 'single' ` → ` !(context.state === 'single') ` | killed: G-32: metadata targets and animation element names remain distinct |
| compiler/context.ts:46 | predicate | ` context.state === 'before-value' ` → ` !(context.state === 'before-value') ` | killed: G-32: metadata targets and animation element names remain distinct |
| compiler/context.ts:49 | delete statement | ` refuse('G3016', where, context, '15', where.source.text.slice(where.start, where.end)) ` → ` ; ` | killed: G-24: SVG animation values refuse every template-tag kind in any namespace |
| compiler/context.ts:67 | predicate | ` tag === 'select' &#124;&#124; tag === 'frameset' &#124;&#124; tag === 'plaintext' &#124;&#124; (tag === 'col' && context.template > 0) ` → ` !(tag === 'select' &#124;&#124; tag === 'frameset' &#124;&#124; tag === 'plaintext' &#124;&#124; (tag === 'col' && context.template > 0)) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:67 | operand | ` tag === 'select' &#124;&#124; tag === 'frameset' &#124;&#124; tag === 'plaintext' ` → ` false ` | killed: G-32/P3: rule 5 and 9 refusals point to the start tag, including a split start tag |
| compiler/context.ts:67 | operand | ` (tag === 'col' && context.template > 0) ` → ` false ` | killed: G-32/P3: rule 5 and 9 refusals point to the start tag, including a split start tag |
| compiler/context.ts:67 | operand | ` tag === 'select' &#124;&#124; tag === 'frameset' ` → ` false ` | killed: G-32/P3: rule 5 and 9 refusals point to the start tag, including a split start tag |
| compiler/context.ts:67 | operand | ` tag === 'plaintext' ` → ` false ` | killed: G-22/G-23 rule 9: refuse text self-closing and col only while template count is positive |
| compiler/context.ts:67 | operand | ` tag === 'select' ` → ` false ` | killed: G-32/P3: rule 5 and 9 refusals point to the start tag, including a split start tag |
| compiler/context.ts:67 | operand | ` tag === 'frameset' ` → ` false ` | killed: G-22/G-23 rule 9: refuse text self-closing and col only while template count is positive |
| compiler/context.ts:67 | predicate | ` tag === 'select' ` → ` !(tag === 'select') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:67 | predicate | ` tag === 'frameset' ` → ` !(tag === 'frameset') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:67 | predicate | ` tag === 'plaintext' ` → ` !(tag === 'plaintext') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:67 | operand | ` tag === 'col' ` → ` true ` | killed: G-23 self-closing template starts still count because HTML ignores their closing flag |
| compiler/context.ts:67 | operand | ` context.template > 0 ` → ` true ` | killed: G-22/G-23 rule 9: refuse text self-closing and col only while template count is positive |
| compiler/context.ts:67 | predicate | ` tag === 'col' ` → ` !(tag === 'col') ` | killed: G-32/P3: rule 5 and 9 refusals point to the start tag, including a split start tag |
| compiler/context.ts:67 | predicate | ` context.template > 0 ` → ` !(context.template > 0) ` | killed: G-32/P3: rule 5 and 9 refusals point to the start tag, including a split start tag |
| compiler/context.ts:67 | delete statement | ` refuse('G3013', at, context, '9', tag) ` → ` ; ` | killed: G-32/P3: rule 5 and 9 refusals point to the start tag, including a split start tag |
| compiler/context.ts:69 | predicate | ` tag === 'template' ` → ` !(tag === 'template') ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:69 | delete statement | ` context.template++ ` → ` ; ` | killed: G-32/P3: rule 5 and 9 refusals point to the start tag, including a split start tag |
| compiler/context.ts:70 | predicate | ` (tag === 'svg' &#124;&#124; tag === 'math') && !selfClosing ` → ` !((tag === 'svg' &#124;&#124; tag === 'math') && !selfClosing) ` | killed: G-32/P3: foreign count underflow is killed without Chromium |
| compiler/context.ts:70 | operand | ` (tag === 'svg' &#124;&#124; tag === 'math') ` → ` true ` | killed: G-32: ordinary tag names cannot alter private context fields |
| compiler/context.ts:70 | operand | ` !selfClosing ` → ` true ` | killed: G-12/G-21: foreign integration points admit text only and counts never underflow |
| compiler/context.ts:70 | operand | ` tag === 'svg' ` → ` false ` | killed: G-32/P3: foreign count underflow is killed without Chromium |
| compiler/context.ts:70 | operand | ` tag === 'math' ` → ` false ` | killed: G-32/P3: foreign count underflow is killed without Chromium |
| compiler/context.ts:70 | predicate | ` tag === 'svg' ` → ` !(tag === 'svg') ` | killed: G-32/P3: foreign count underflow is killed without Chromium |
| compiler/context.ts:70 | predicate | ` tag === 'math' ` → ` !(tag === 'math') ` | killed: G-32/P3: foreign count underflow is killed without Chromium |
| compiler/context.ts:70 | negation | ` !selfClosing ` → ` selfClosing ` | killed: G-32/P3: foreign count underflow is killed without Chromium |
| compiler/context.ts:70 | delete statement | ` context[tag]++ ` → ` ; ` | killed: G-32/P3: foreign count underflow is killed without Chromium |
| compiler/context.ts:71 | predicate | ` context.svg + context.math > 0 ` → ` !(context.svg + context.math > 0) ` | killed: G-32/P3: foreign count underflow is killed without Chromium |
| compiler/context.ts:72 | operand | ` TEXT_ELEMENTS.has(tag) ` → ` false ` | killed: G-32/P3: foreign count underflow is killed without Chromium |
| compiler/context.ts:72 | operand | ` (foreign && INTEGRATION.has(tag)) ` → ` false ` | killed: G-12/G-21: foreign integration points admit text only and counts never underflow |
| compiler/context.ts:72 | operand | ` foreign ` → ` true ` | killed: G-32: foreign exits consume all HTML separators; HTML integration names still hold markup |
| compiler/context.ts:72 | operand | ` INTEGRATION.has(tag) ` → ` true ` | killed: G-32/P3: JS inside a partial marks visible snippets and keeps the lexer line flag |
| compiler/context.ts:73 | predicate | ` TEXT_ELEMENTS.has(tag) && selfClosing ` → ` !(TEXT_ELEMENTS.has(tag) && selfClosing) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:73 | operand | ` TEXT_ELEMENTS.has(tag) ` → ` true ` | killed: G-32: attribute terminators and metadata non-targets keep their meanings |
| compiler/context.ts:73 | operand | ` selfClosing ` → ` true ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:73 | delete statement | ` refuse('G3013', at, context, '5', tag) ` → ` ; ` | killed: G-32/P3: rule 5 and 9 refusals point to the start tag, including a split start tag |
| compiler/context.ts:74 | delete statement | ` Object.assign(context, { state: 'data', tag: '', attribute: '', delimited: false, tagId: 0, quote: 0, tagAt: null, capture: null }) ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:74 | boolean | ` false ` → ` true ` | equivalent: Delimited is unused after a completed tag; the next start tag initializes it. |
| compiler/context.ts:75 | predicate | ` text && !selfClosing ` → ` !(text && !selfClosing) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:75 | operand | ` text ` → ` true ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:75 | operand | ` !selfClosing ` → ` true ` | killed: G-12/G-21: foreign integration points admit text only and counts never underflow |
| compiler/context.ts:75 | negation | ` !selfClosing ` → ` selfClosing ` | killed: G-32/P3: foreign count underflow is killed without Chromium |
| compiler/context.ts:75 | delete statement | ` Object.assign(context, { state: 'text', owner: tag, strict: foreign }) ` → ` ; ` | killed: G-32/P3: foreign count underflow is killed without Chromium |
| compiler/context.ts:78 | class "A" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([BCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "B" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ACDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "C" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "D" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "E" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "F" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "G" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "H" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "I" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "J" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "K" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "L" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "M" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "N" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "O" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "P" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "Q" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "R" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "S" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "T" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "U" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "V" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "W" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "X" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "Y" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "Z" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "a" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZbcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:78 | class "b" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZacdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "c" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "d" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "e" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdfghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "f" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "g" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefhijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "h" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32/P3: empty metadata removes static indentation across blocks and leaves values intact |
| compiler/context.ts:78 | class "i" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghjklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:78 | class "j" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "k" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijlmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "l" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: {#each} / {/each} > iterates array |
| compiler/context.ts:78 | class "m" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32/P3: foreign count underflow is killed without Chromium |
| compiler/context.ts:78 | class "n" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "o" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnpqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "p" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnoqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: a value with the marks of stripEmptyMeta > stays the same text for a browser |
| compiler/context.ts:78 | class "q" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnoprstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "r" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "s" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrtuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32/P3: JS inside a partial marks visible snippets and keeps the lexer line flag |
| compiler/context.ts:78 | class "t" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrsuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32/P3: JS inside a partial marks visible snippets and keeps the lexer line flag |
| compiler/context.ts:78 | class "u" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "v" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "w" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "x" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "y" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "z" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxy][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "\\t" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([A-Za-z][^\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: foreign exits consume all HTML separators; HTML integration names still hold markup |
| compiler/context.ts:78 | class "\\n" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([A-Za-z][^\t\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: foreign exits consume all HTML separators; HTML integration names still hold markup |
| compiler/context.ts:78 | class "\\f" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([A-Za-z][^\t\n\r \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: foreign exits consume all HTML separators; HTML integration names still hold markup |
| compiler/context.ts:78 | class "\\r" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([A-Za-z][^\t\n\f \/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: foreign exits consume all HTML separators; HTML integration names still hold markup |
| compiler/context.ts:78 | class " " | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([A-Za-z][^\t\n\f\r\/>]*)[\t\n\f\r ]*>/ ` | killed: G-32: foreign exits consume all HTML separators; HTML integration names still hold markup |
| compiler/context.ts:78 | class "\\/" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([A-Za-z][^\t\n\f\r >]*)[\t\n\f\r ]*>/ ` | killed: G-1/G-2: valid quoted angles stop; K1–K3 and malformed attributes are G3014 |
| compiler/context.ts:78 | class ">" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([A-Za-z][^\t\n\f\r \/]*)[\t\n\f\r ]*>/ ` | killed: G-32/P3: foreign count underflow is killed without Chromium |
| compiler/context.ts:78 | class "\\t" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\n\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "\\n" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\f\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "\\f" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\r ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class "\\r" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f ]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:78 | class " " | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r]*>/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:79 | predicate | `` !match &#124;&#124; /[<"'=`\0]/.test(match[1]!) `` → `` !(!match &#124;&#124; /[<"'=`\0]/.test(match[1]!)) `` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:79 | operand | ` !match ` → ` false ` | killed: G-11 quoted-context snippet and exact double-escaped script fixture |
| compiler/context.ts:79 | operand | `` /[<"'=`\0]/.test(match[1]!) `` → ` false ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:79 | negation | ` !match ` → ` match ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:79 | class "<" | `` /[<"'=`\0]/ `` → `` /["'=`\0]/ `` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:79 | class "\"" | `` /[<"'=`\0]/ `` → `` /[<'=`\0]/ `` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:79 | class "'" | `` /[<"'=`\0]/ `` → `` /[<"=`\0]/ `` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:79 | class "=" | `` /[<"'=`\0]/ `` → `` /[<"'`\0]/ `` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:79 | class "`" | `` /[<"'=`\0]/ `` → ` /[<"'=\0]/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:79 | class "\\0" | `` /[<"'=`\0]/ `` → `` /[<"'=`]/ `` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:79 | drop returned value | ` refuse('G3014', where, context, '6', value.slice(at)) ` → ` undefined ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:81 | predicate | ` name === 'svg' &#124;&#124; name === 'math' &#124;&#124; name === 'template' ` → ` !(name === 'svg' &#124;&#124; name === 'math' &#124;&#124; name === 'template') ` | killed: G-32: foreign exits consume all HTML separators; HTML integration names still hold markup |
| compiler/context.ts:81 | operand | ` name === 'svg' &#124;&#124; name === 'math' ` → ` false ` | killed: G-32: foreign exits consume all HTML separators; HTML integration names still hold markup |
| compiler/context.ts:81 | operand | ` name === 'template' ` → ` false ` | killed: G-22/G-23 rule 9: refuse text self-closing and col only while template count is positive |
| compiler/context.ts:81 | operand | ` name === 'svg' ` → ` false ` | killed: G-32: foreign exits consume all HTML separators; HTML integration names still hold markup |
| compiler/context.ts:81 | operand | ` name === 'math' ` → ` false ` | killed: G-32: foreign exits consume all HTML separators; HTML integration names still hold markup |
| compiler/context.ts:81 | predicate | ` name === 'svg' ` → ` !(name === 'svg') ` | killed: G-32: foreign exits consume all HTML separators; HTML integration names still hold markup |
| compiler/context.ts:81 | predicate | ` name === 'math' ` → ` !(name === 'math') ` | killed: G-32: foreign exits consume all HTML separators; HTML integration names still hold markup |
| compiler/context.ts:81 | predicate | ` name === 'template' ` → ` !(name === 'template') ` | killed: G-22/G-23 rule 9: refuse text self-closing and col only while template count is positive |
| compiler/context.ts:81 | delete statement | ` context[name] = Math.max(0, context[name] - 1) ` → ` ; ` | killed: G-32: foreign exits consume all HTML separators; HTML integration names still hold markup |
| compiler/context.ts:81 | remove clamp | ` Math.max(0, context[name] - 1) ` → ` context[name] - 1 ` | killed: G-32/P3: foreign count underflow is killed without Chromium |
| compiler/context.ts:82 | drop returned value | ` at + match[0].length ` → ` undefined ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:90 | predicate | ` index < value.length ` → ` !(index < value.length) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:92 | predicate | ` context.state ` → ` !(context.state) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:93 | case comparison | ` 'data' ` → ` "__mutation_unreachable_case__" ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:95 | predicate | ` less < 0 ` → ` !(less < 0) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:95 | delete statement | ` index = value.length; ` → ` ; ` | killed: G-43: a comment after a multiline config removes the indentation before the config |
| compiler/context.ts:97 | predicate | ` rest.startsWith('<!--') ` → ` !(rest.startsWith('<!--')) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:99 | predicate | ` close < 0 ` → ` !(close < 0) ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:100 | predicate | ` value.startsWith('>', body) &#124;&#124; value.startsWith('->', body) &#124;&#124; bang ` → ` !(value.startsWith('>', body) &#124;&#124; value.startsWith('->', body) &#124;&#124; bang) ` | killed: G-32/P3: JS inside a partial marks visible snippets and keeps the lexer line flag |
| compiler/context.ts:100 | operand | ` value.startsWith('>', body) &#124;&#124; value.startsWith('->', body) ` → ` false ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:100 | operand | ` bang ` → ` false ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:100 | operand | ` value.startsWith('>', body) ` → ` false ` | killed: rules 1/7/8: comments and declarations are whole, and text end tags cannot straddle a template tag |
| compiler/context.ts:100 | operand | ` value.startsWith('->', body) ` → ` false ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:100 | delete statement | ` refuse('G3014', at(less), context, '7', rest) ` → ` ; ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:101 | predicate | ` close < 0 ` → ` !(close < 0) ` | killed: G-32/P3: JS inside a partial marks visible snippets and keeps the lexer line flag |
| compiler/context.ts:101 | delete statement | ` refuse(tagFollows ? 'G3013' : 'G3014', at(less), context, '7', rest) ` → ` ; ` | killed: rules 1/7/8: comments and declarations are whole, and text end tags cannot straddle a template tag |
| compiler/context.ts:101 | predicate | ` tagFollows ` → ` !(tagFollows) ` | killed: rules 1/7/8: comments and declarations are whole, and text end tags cannot straddle a template tag |
| compiler/context.ts:102 | delete statement | ` index = close + 3 ` → ` ; ` | killed: G-32/P3: JS inside a partial marks visible snippets and keeps the lexer line flag |
| compiler/context.ts:103 | predicate | ` /^<!doctype[\t\n\f\r ]/i.test(rest) ` → ` !(/^<!doctype[\t\n\f\r ]/i.test(rest)) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:103 | class "\\t" | ` /^<!doctype[\t\n\f\r ]/i ` → ` /^<!doctype[\n\f\r ]/i ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:103 | class "\\n" | ` /^<!doctype[\t\n\f\r ]/i ` → ` /^<!doctype[\t\f\r ]/i ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:103 | class "\\f" | ` /^<!doctype[\t\n\f\r ]/i ` → ` /^<!doctype[\t\n\r ]/i ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:103 | class "\\r" | ` /^<!doctype[\t\n\f\r ]/i ` → ` /^<!doctype[\t\n\f ]/i ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:103 | class " " | ` /^<!doctype[\t\n\f\r ]/i ` → ` /^<!doctype[\t\n\f\r]/i ` | killed: DOCTYPE abrupt greater-than follows the browser; partial declarations retain lexical scope |
| compiler/context.ts:104 | class "<" | ` /^![^<>]*>/ ` → ` /^![^>]*>/ ` | killed: rules 1/7/8: comments and declarations are whole, and text end tags cannot straddle a template tag |
| compiler/context.ts:104 | class ">" | ` /^![^<>]*>/ ` → ` /^![^<]*>/ ` | equivalent: Greedily consuming additional > characters in DOCTYPE can consume only ordinary data, since < remains excluded. |
| compiler/context.ts:105 | predicate | ` !close ` → ` !(!close) ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:105 | negation | ` !close ` → ` close ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:105 | delete statement | ` refuse(tagFollows ? 'G3013' : 'G3014', at(less), context, '7', rest) ` → ` ; ` | killed: rules 1/7/8: comments and declarations are whole, and text end tags cannot straddle a template tag |
| compiler/context.ts:105 | predicate | ` tagFollows ` → ` !(tagFollows) ` | killed: rules 1/7/8: comments and declarations are whole, and text end tags cannot straddle a template tag |
| compiler/context.ts:106 | delete statement | ` index = less + 1 + close![0].length ` → ` ; ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:107 | predicate | ` rest.startsWith('</') ` → ` !(rest.startsWith('</')) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:107 | delete statement | ` index = endTag(value, less, context, () => at(less)) ` → ` ; ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:109 | class "A" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([BCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "B" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ACDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "C" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "D" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "E" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "F" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "G" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "H" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "I" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "J" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "K" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "L" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "M" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "N" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "O" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "P" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "Q" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "R" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "S" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "T" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "U" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "V" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "W" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "X" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "Y" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "Z" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "a" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZbcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:109 | class "b" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZacdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "c" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32/P3: foreign count underflow is killed without Chromium |
| compiler/context.ts:109 | class "d" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "e" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdfghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "f" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:109 | class "g" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefhijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "h" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32/P3: empty metadata removes static indentation across blocks and leaves values intact |
| compiler/context.ts:109 | class "i" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghjklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:109 | class "j" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "k" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijlmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "l" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:109 | class "m" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32/P3: empty metadata removes static indentation across blocks and leaves values intact |
| compiler/context.ts:109 | class "n" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "o" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnpqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "p" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnoqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: a value with the marks of stripEmptyMeta > stays the same text for a browser |
| compiler/context.ts:109 | class "q" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnoprstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "r" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "s" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrtuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32/P3: JS inside a partial marks visible snippets and keeps the lexer line flag |
| compiler/context.ts:109 | class "t" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrsuvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32/P3: JS inside a partial marks visible snippets and keeps the lexer line flag |
| compiler/context.ts:109 | class "u" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstvwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "v" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuwxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "w" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvxyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "x" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwyz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "y" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxz][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "z" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxy][^\t\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "\\t" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([A-Za-z][^\n\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "\\n" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([A-Za-z][^\t\f\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "\\f" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([A-Za-z][^\t\n\r \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class "\\r" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([A-Za-z][^\t\n\f \/>]*)/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:109 | class " " | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([A-Za-z][^\t\n\f\r\/>]*)/ ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:109 | class "\\/" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([A-Za-z][^\t\n\f\r >]*)/ ` | killed: G-32/P3: rule 5 and 9 refusals point to the start tag, including a split start tag |
| compiler/context.ts:109 | class ">" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([A-Za-z][^\t\n\f\r \/]*)/ ` | killed: G-32/P3: JS inside a partial marks visible snippets and keeps the lexer line flag |
| compiler/context.ts:110 | predicate | `` !name &#124;&#124; /[<"'=`\0]/.test(name[1]!) `` → `` !(!name &#124;&#124; /[<"'=`\0]/.test(name[1]!)) `` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:110 | operand | ` !name ` → ` false ` | killed: compiler boundary diagnostics and independent existing helper branches |
| compiler/context.ts:110 | operand | `` /[<"'=`\0]/.test(name[1]!) `` → ` false ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:110 | negation | ` !name ` → ` name ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:110 | class "<" | `` /[<"'=`\0]/ `` → `` /["'=`\0]/ `` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:110 | class "\"" | `` /[<"'=`\0]/ `` → `` /[<'=`\0]/ `` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:110 | class "'" | `` /[<"'=`\0]/ `` → `` /[<"=`\0]/ `` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:110 | class "=" | `` /[<"'=`\0]/ `` → `` /[<"'`\0]/ `` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:110 | class "`" | `` /[<"'=`\0]/ `` → ` /[<"'=\0]/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:110 | class "\\0" | `` /[<"'=`\0]/ `` → `` /[<"'=`]/ `` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:110 | drop returned value | ` refuse('G3014', at(less), context, '1/2', rest) ` → ` undefined ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:111 | delete statement | ` Object.assign(context, { state: 'tag', tag: asciiLower(name[1]!), attribute: '', delimited: false, tagId: ++identity, tagAt: () => at(less) }) ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:111 | boolean | ` false ` → ` true ` | killed: G-32: static metadata, slot flags, strip boundaries and empty each paths are pinned |
| compiler/context.ts:112 | predicate | ` context.tag === 'meta' &#124;&#124; context.tag === 'link' ` → ` !(context.tag === 'meta' &#124;&#124; context.tag === 'link') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:112 | operand | ` context.tag === 'meta' ` → ` false ` | killed: G-32/P3: empty metadata removes static indentation across blocks and leaves values intact |
| compiler/context.ts:112 | operand | ` context.tag === 'link' ` → ` false ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:112 | predicate | ` context.tag === 'meta' ` → ` !(context.tag === 'meta') ` | killed: G-32/P3: empty metadata removes static indentation across blocks and leaves values intact |
| compiler/context.ts:112 | predicate | ` context.tag === 'link' ` → ` !(context.tag === 'link') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:113 | delete statement | ` context.capture = { kind: 'tag-open', at: less, dynamic: false } ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:113 | boolean | ` false ` → ` true ` | equivalent: An unused static tag capture has no dynamic target, so it cannot remove output. |
| compiler/context.ts:114 | delete statement | ` records.push(context.capture) ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:116 | delete statement | ` index = less + name[0].length ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:120 | case comparison | ` 'tag' ` → ` "__mutation_unreachable_case__" ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:121 | predicate | ` SPACE.test(char) ` → ` !(SPACE.test(char)) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:121 | delete statement | ` context.delimited = true; ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:121 | boolean | ` true ` → ` false ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:121 | delete statement | ` index++; ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:122 | predicate | ` char === '>' &#124;&#124; value.startsWith('/>', index) ` → ` !(char === '>' &#124;&#124; value.startsWith('/>', index)) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:122 | operand | ` char === '>' ` → ` false ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:122 | operand | ` value.startsWith('/>', index) ` → ` false ` | killed: G-32/P3: rule 5 and 9 refusals point to the start tag, including a split start tag |
| compiler/context.ts:122 | predicate | ` char === '>' ` → ` !(char === '>') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:123 | delete statement | ` index += char === '>' ? 1 : 2 ` → ` ; ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:123 | predicate | ` char === '>' ` → ` !(char === '>') ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:124 | predicate | ` context.capture ` → ` !(context.capture) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:124 | delete statement | ` records.push({ kind: 'tag-close', at: index, tag: context.capture }) ` → ` ; ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:125 | delete statement | ` finishTag(context, char !== '>') ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:125 | predicate | ` char !== '>' ` → ` !(char !== '>') ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:128 | predicate | ` char === '/' &#124;&#124; char === '=' &#124;&#124; !context.delimited ` → ` !(char === '/' &#124;&#124; char === '=' &#124;&#124; !context.delimited) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:128 | operand | ` char === '/' &#124;&#124; char === '=' ` → ` false ` | killed: G-1/G-2: valid quoted angles stop; K1–K3 and malformed attributes are G3014 |
| compiler/context.ts:128 | operand | ` !context.delimited ` → ` false ` | killed: G-32: metadata targets and animation element names remain distinct |
| compiler/context.ts:128 | operand | ` char === '/' ` → ` false ` | killed: G-1/G-2: valid quoted angles stop; K1–K3 and malformed attributes are G3014 |
| compiler/context.ts:128 | operand | ` char === '=' ` → ` false ` | killed: G-1/G-2: valid quoted angles stop; K1–K3 and malformed attributes are G3014 |
| compiler/context.ts:128 | predicate | ` char === '/' ` → ` !(char === '/') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:128 | predicate | ` char === '=' ` → ` !(char === '=') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:128 | negation | ` !context.delimited ` → ` context.delimited ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:128 | delete statement | ` refuse('G3014', at(index), context, '3/5', value.slice(index)) ` → ` ; ` | killed: G-32: metadata targets and animation element names remain distinct |
| compiler/context.ts:129 | class "\\t" | ` /^[^\t\n\f\r \/>=]+/ ` → ` /^[^\n\f\r \/>=]+/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:129 | class "\\n" | ` /^[^\t\n\f\r \/>=]+/ ` → ` /^[^\t\f\r \/>=]+/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:129 | class "\\f" | ` /^[^\t\n\f\r \/>=]+/ ` → ` /^[^\t\n\r \/>=]+/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:129 | class "\\r" | ` /^[^\t\n\f\r \/>=]+/ ` → ` /^[^\t\n\f \/>=]+/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:129 | class " " | ` /^[^\t\n\f\r \/>=]+/ ` → ` /^[^\t\n\f\r\/>=]+/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:129 | class "\\/" | ` /^[^\t\n\f\r \/>=]+/ ` → ` /^[^\t\n\f\r >=]+/ ` | killed: G-32: attribute terminators and metadata non-targets keep their meanings |
| compiler/context.ts:129 | class ">" | ` /^[^\t\n\f\r \/>=]+/ ` → ` /^[^\t\n\f\r \/=]+/ ` | killed: G-32: attribute terminators and metadata non-targets keep their meanings |
| compiler/context.ts:129 | class "=" | ` /^[^\t\n\f\r \/>=]+/ ` → ` /^[^\t\n\f\r \/>]+/ ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:130 | predicate | `` /["'<`\0]/.test(name) `` → `` !(/["'<`\0]/.test(name)) `` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:130 | class "\"" | `` /["'<`\0]/ `` → `` /['<`\0]/ `` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:130 | class "'" | `` /["'<`\0]/ `` → `` /["<`\0]/ `` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:130 | class "<" | `` /["'<`\0]/ `` → `` /["'`\0]/ `` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:130 | class "`" | `` /["'<`\0]/ `` → ` /["'<\0]/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:130 | class "\\0" | `` /["'<`\0]/ `` → `` /["'<`]/ `` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:130 | delete statement | ` refuse('G3014', at(index), context, '3', name) ` → ` ; ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:131 | delete statement | ` context.attribute = asciiLower(name) ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:132 | delete statement | ` context.delimited = false ` → ` ; ` | killed: G-32: each exit delimiters, strip traversal and nonempty metadata are pinned |
| compiler/context.ts:132 | boolean | ` false ` → ` true ` | killed: G-32: each exit delimiters, strip traversal and nonempty metadata are pinned |
| compiler/context.ts:133 | delete statement | ` index += name.length ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:134 | predicate | ` isTarget(context.tag, context.attribute) ` → ` !(isTarget(context.tag, context.attribute)) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:134 | delete statement | ` records.push({ kind: 'target', at: index, tag: context.capture! }) ` → ` ; ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:135 | predicate | ` value[index] === '=' ` → ` !(value[index] === '=') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:135 | delete statement | ` context.state = 'before-value'; ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:135 | delete statement | ` index++ ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:136 | predicate | ` SPACE.test(value[index]!) ` → ` !(SPACE.test(value[index]!)) ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:136 | delete statement | ` context.state = 'after-name' ` → ` ; ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:139 | case comparison | ` 'after-name' ` → ` "__mutation_unreachable_case__" ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:140 | predicate | ` SPACE.test(char) ` → ` !(SPACE.test(char)) ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:140 | delete statement | ` index++; ` → ` ; ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:141 | predicate | ` char === '=' ` → ` !(char === '=') ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:141 | delete statement | ` context.state = 'before-value'; ` → ` ; ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:141 | delete statement | ` index++ ` → ` ; ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:142 | delete statement | ` Object.assign(context, { state: 'tag', delimited: true, attribute: '' }) ` → ` ; ` | killed: metadata duplicate and boolean targets follow the first actual attribute |
| compiler/context.ts:142 | boolean | ` true ` → ` false ` | killed: metadata duplicate and boolean targets follow the first actual attribute |
| compiler/context.ts:144 | case comparison | ` 'before-value' ` → ` "__mutation_unreachable_case__" ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:145 | predicate | ` SPACE.test(char) ` → ` !(SPACE.test(char)) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:145 | delete statement | ` index++; ` → ` ; ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:146 | predicate | ` char === '"' &#124;&#124; char === "'" ` → ` !(char === '"' &#124;&#124; char === "'") ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:146 | operand | ` char === '"' ` → ` false ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:146 | operand | ` char === "'" ` → ` false ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:146 | predicate | ` char === '"' ` → ` !(char === '"') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:146 | predicate | ` char === "'" ` → ` !(char === "'") ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:147 | delete statement | ` context.state = char === '"' ? 'double' : 'single'; ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:147 | predicate | ` char === '"' ` → ` !(char === '"') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:147 | delete statement | ` context.quote = ++identity; ` → ` ; ` | killed: G-32: every variant key field preserves placement and quote grammar |
| compiler/context.ts:147 | delete statement | ` index++ ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:148 | predicate | ` value.indexOf(char, index) < 0 ` → ` !(value.indexOf(char, index) < 0) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:150 | predicate | ` URL_ATTRIBUTES.has(context.attribute) ` → ` !(URL_ATTRIBUTES.has(context.attribute)) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:152 | delete statement | ` prefix?.feed(ampersand < 0 ? startText : startText.slice(0, ampersand)) ` → ` ; ` | killed: G-34: forbidden static starts need an actual dynamic write |
| compiler/context.ts:152 | predicate | ` ampersand < 0 ` → ` !(ampersand < 0) ` | killed: G-35: lint always returns a Promise; partials preserve context without a resolver |
| compiler/context.ts:153 | predicate | ` prefix && !prefix.settled ` → ` !(prefix && !prefix.settled) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:153 | operand | ` prefix ` → ` true ` | killed: G-32/P3: empty metadata removes static indentation across blocks and leaves values intact |
| compiler/context.ts:153 | operand | ` !prefix.settled ` → ` true ` | killed: G-36: literal scheme completions checkpoint attribute ends, including static snippets |
| compiler/context.ts:153 | negation | ` !prefix.settled ` → ` prefix.settled ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:154 | predicate | ` isTarget(context.tag, context.attribute) ` → ` !(isTarget(context.tag, context.attribute)) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:155 | predicate | ` url !== null &#124;&#124; tag ` → ` !(url !== null &#124;&#124; tag) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:155 | operand | ` url !== null ` → ` false ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:155 | operand | ` tag ` → ` false ` | killed: G-32/P3: empty metadata removes static indentation across blocks and leaves values intact |
| compiler/context.ts:155 | predicate | ` url !== null ` → ` !(url !== null) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:155 | delete statement | ` context.open = { kind: 'value-open', at: index, url, tag, dynamic: false }; ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:155 | boolean | ` false ` → ` true ` | killed: G-32: static metadata, slot flags, strip boundaries and empty each paths are pinned |
| compiler/context.ts:155 | delete statement | ` records.push(context.open) ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:156 | predicate | ` prefix && !prefix.settled && (prefix.forbidden &#124;&#124; ampersand >= 0) ` → ` !(prefix && !prefix.settled && (prefix.forbidden &#124;&#124; ampersand >= 0)) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:156 | operand | ` prefix && !prefix.settled ` → ` true ` | killed: G-32/P3: empty metadata removes static indentation across blocks and leaves values intact |
| compiler/context.ts:156 | operand | ` (prefix.forbidden &#124;&#124; ampersand >= 0) ` → ` true ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:156 | operand | ` prefix ` → ` true ` | killed: G-32/P3: empty metadata removes static indentation across blocks and leaves values intact |
| compiler/context.ts:156 | operand | ` !prefix.settled ` → ` true ` | killed: G-40/P3: settled metadata URLs keep static ampersands before writes |
| compiler/context.ts:156 | negation | ` !prefix.settled ` → ` prefix.settled ` | killed: G-34: forbidden static starts need an actual dynamic write |
| compiler/context.ts:156 | operand | ` prefix.forbidden ` → ` false ` | killed: G-34: forbidden static starts need an actual dynamic write |
| compiler/context.ts:156 | operand | ` ampersand >= 0 ` → ` false ` | killed: G-7 five static reference prefixes |
| compiler/context.ts:156 | predicate | ` ampersand >= 0 ` → ` !(ampersand >= 0) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:156 | delete statement | ` starts.push({ value: context.open, text: value.slice(start), at: offset => at(start + offset), forbidden: prefix.forbidden }) ` → ` ; ` | killed: G-34: forbidden static starts need an actual dynamic write |
| compiler/context.ts:161 | class "\\t" | ` /^[^\t\n\f\r >]+/ ` → ` /^[^\n\f\r >]+/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:161 | class "\\n" | ` /^[^\t\n\f\r >]+/ ` → ` /^[^\t\f\r >]+/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:161 | class "\\f" | ` /^[^\t\n\f\r >]+/ ` → ` /^[^\t\n\r >]+/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:161 | class "\\r" | ` /^[^\t\n\f\r >]+/ ` → ` /^[^\t\n\f >]+/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:161 | class " " | ` /^[^\t\n\f\r >]+/ ` → ` /^[^\t\n\f\r>]+/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:161 | class ">" | ` /^[^\t\n\f\r >]+/ ` → ` /^[^\t\n\f\r ]+/ ` | killed: G-32: attribute terminators and metadata non-targets keep their meanings |
| compiler/context.ts:162 | predicate | `` !unquoted &#124;&#124; /["'<=`]/.test(unquoted[0]) &#124;&#124; index + unquoted[0].length === value.length `` → `` !(!unquoted &#124;&#124; /["'<=`]/.test(unquoted[0]) &#124;&#124; index + unquoted[0].length === value.length) `` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:162 | operand | `` !unquoted &#124;&#124; /["'<=`]/.test(unquoted[0]) `` → ` false ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:162 | operand | ` index + unquoted[0].length === value.length ` → ` false ` | killed: G-28: each entry, missing else, tag/quote identities and math count stay distinct |
| compiler/context.ts:162 | operand | ` !unquoted ` → ` false ` | killed: G-1/G-2: valid quoted angles stop; K1–K3 and malformed attributes are G3014 |
| compiler/context.ts:162 | operand | `` /["'<=`]/.test(unquoted[0]) `` → ` false ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:162 | negation | ` !unquoted ` → ` unquoted ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:162 | class "\"" | `` /["'<=`]/ `` → `` /['<=`]/ `` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:162 | class "'" | `` /["'<=`]/ `` → `` /["<=`]/ `` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:162 | class "<" | `` /["'<=`]/ `` → `` /["'=`]/ `` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:162 | class "=" | `` /["'<=`]/ `` → `` /["'<`]/ `` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:162 | class "`" | `` /["'<=`]/ `` → ` /["'<=]/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:162 | predicate | ` index + unquoted[0].length === value.length ` → ` !(index + unquoted[0].length === value.length) ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:162 | drop returned value | ` refuse('G3014', at(index), context, '4', value.slice(index)) ` → ` undefined ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:163 | delete statement | ` index += unquoted[0].length ` → ` ; ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:164 | delete statement | ` Object.assign(context, { state: 'tag', attribute: '', delimited: false }) ` → ` ; ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:164 | boolean | ` false ` → ` true ` | equivalent: An unquoted value must end in the same text at whitespace or >; both consume or overwrite delimited. |
| compiler/context.ts:167 | case comparison | ` 'double' ` → ` "__mutation_unreachable_case__" ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:167 | case comparison | ` 'single' ` → ` "__mutation_unreachable_case__" ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:168 | predicate | ` context.state === 'double' ` → ` !(context.state === 'double') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:169 | predicate | ` close < 0 ` → ` !(close < 0) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:169 | delete statement | ` index = value.length; ` → ` ; ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:170 | predicate | ` context.open ` → ` !(context.open) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:170 | delete statement | ` records.push({ kind: 'value-close', at: close }) ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:171 | delete statement | ` index = close + 1 ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:172 | delete statement | ` Object.assign(context, { state: 'tag', attribute: '', delimited: false, quote: 0, open: null }) ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:172 | boolean | ` false ` → ` true ` | killed: G-32: metadata targets and animation element names remain distinct |
| compiler/context.ts:175 | case comparison | ` 'text' ` → ` "__mutation_unreachable_case__" ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:177 | predicate | ` less < 0 ` → ` !(less < 0) ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:177 | delete statement | ` index = value.length; ` → ` ; ` | killed: G-32: attribute terminators and metadata non-targets keep their meanings |
| compiler/context.ts:180 | predicate | ` rest.startsWith(end) && /^[\t\n\f\r \/>]/.test(rest.slice(end.length)) ` → ` !(rest.startsWith(end) && /^[\t\n\f\r \/>]/.test(rest.slice(end.length))) ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:180 | operand | ` rest.startsWith(end) ` → ` true ` | killed: real metadata boundaries: inert contexts, quoted angles, branches, snippets, partials and markers |
| compiler/context.ts:180 | operand | ` /^[\t\n\f\r \/>]/.test(rest.slice(end.length)) ` → ` true ` | killed: G-12/G-21: foreign integration points admit text only and counts never underflow |
| compiler/context.ts:180 | class "\\t" | ` /^[\t\n\f\r \/>]/ ` → ` /^[\n\f\r \/>]/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:180 | class "\\n" | ` /^[\t\n\f\r \/>]/ ` → ` /^[\t\f\r \/>]/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:180 | class "\\f" | ` /^[\t\n\f\r \/>]/ ` → ` /^[\t\n\r \/>]/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:180 | class "\\r" | ` /^[\t\n\f\r \/>]/ ` → ` /^[\t\n\f \/>]/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:180 | class " " | ` /^[\t\n\f\r \/>]/ ` → ` /^[\t\n\f\r\/>]/ ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:180 | class "\\/" | ` /^[\t\n\f\r \/>]/ ` → ` /^[\t\n\f\r >]/ ` | killed: G-32: every review bypass keeps its refusal or URL checkpoint |
| compiler/context.ts:180 | class ">" | ` /^[\t\n\f\r \/>]/ ` → ` /^[\t\n\f\r \/]/ ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:181 | delete statement | ` Object.assign(context, { state: 'data', owner: '', strict: false }) ` → ` ; ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:181 | boolean | ` false ` → ` true ` | killed: G-32/P3: JS inside a partial marks visible snippets and keeps the lexer line flag |
| compiler/context.ts:184 | predicate | ` ((end + '>').startsWith(rest) &#124;&#124; (context.owner === 'script' && '<!--'.startsWith(rest))) ` → ` !(((end + '>').startsWith(rest) &#124;&#124; (context.owner === 'script' && '<!--'.startsWith(rest)))) ` | killed: G-32/P3: foreign count underflow is killed without Chromium |
| compiler/context.ts:184 | operand | ` (end + '>').startsWith(rest) ` → ` false ` | killed: rules 1/7/8: comments and declarations are whole, and text end tags cannot straddle a template tag |
| compiler/context.ts:184 | operand | ` (context.owner === 'script' && '<!--'.startsWith(rest)) ` → ` false ` | killed: rules 1/7/8: comments and declarations are whole, and text end tags cannot straddle a template tag |
| compiler/context.ts:184 | operand | ` context.owner === 'script' ` → ` true ` | killed: G-32: attribute terminators and metadata non-targets keep their meanings |
| compiler/context.ts:184 | operand | ` '<!--'.startsWith(rest) ` → ` true ` | killed: G-11 quoted-context snippet and exact double-escaped script fixture |
| compiler/context.ts:184 | predicate | ` context.owner === 'script' ` → ` !(context.owner === 'script') ` | killed: G-32: attribute terminators and metadata non-targets keep their meanings |
| compiler/context.ts:184 | delete statement | ` refuse('G3014', at(less), context, '8', rest) ` → ` ; ` | killed: rules 1/7/8: comments and declarations are whole, and text end tags cannot straddle a template tag |
| compiler/context.ts:185 | predicate | ` context.strict &#124;&#124; (context.owner === 'script' && rest.startsWith('<!--')) ` → ` !(context.strict &#124;&#124; (context.owner === 'script' && rest.startsWith('<!--'))) ` | killed: G-32/P3: foreign count underflow is killed without Chromium |
| compiler/context.ts:185 | operand | ` context.strict ` → ` false ` | killed: G-32/P3: foreign count underflow is killed without Chromium |
| compiler/context.ts:185 | operand | ` (context.owner === 'script' && rest.startsWith('<!--')) ` → ` false ` | killed: G-11 quoted-context snippet and exact double-escaped script fixture |
| compiler/context.ts:185 | operand | ` context.owner === 'script' ` → ` true ` | killed: G-32: attribute terminators and metadata non-targets keep their meanings |
| compiler/context.ts:185 | operand | ` rest.startsWith('<!--') ` → ` true ` | killed: real metadata boundaries: inert contexts, quoted angles, branches, snippets, partials and markers |
| compiler/context.ts:185 | predicate | ` context.owner === 'script' ` → ` !(context.owner === 'script') ` | killed: G-32: attribute terminators and metadata non-targets keep their meanings |
| compiler/context.ts:185 | delete statement | ` refuse('G3013', at(less), context, '8/13', rest) ` → ` ; ` | killed: G-32/P3: foreign count underflow is killed without Chromium |
| compiler/context.ts:186 | delete statement | ` index = less + 1 ` → ` ; ` | killed: G-32: foreign exits consume all HTML separators; HTML integration names still hold markup |
| compiler/context.ts:191 | drop returned value | ` { ...node, records, ...(open ? { open } : {}) } ` → ` undefined ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:191 | predicate | ` open ` → ` !(open) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:194 | predicate | ` context.state === 'after-name' ` → ` !(context.state === 'after-name') ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:194 | delete statement | ` Object.assign(context, { state: 'tag', delimited: true, attribute: '' }) ` → ` ; ` | killed: G-14: blocks preserve structure and whitespace is a forward fact |
| compiler/context.ts:194 | boolean | ` true ` → ` false ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:195 | predicate | ` context.state === 'tag' ` → ` !(context.state === 'tag') ` | killed: G-32: attribute terminators and metadata non-targets keep their meanings |
| compiler/context.ts:195 | delete statement | ` context.attribute = '' ` → ` ; ` | killed: G-40: a template boundary clears the previous attribute in diagnostics |
| compiler/context.ts:196 | predicate | ` context.state === 'before-value' ` → ` !(context.state === 'before-value') ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:196 | delete statement | ` refuse(code, where, context, '11', where.source.text.slice(where.start, where.end)) ` → ` ; ` | killed: G-32: attribute terminators and metadata non-targets keep their meanings |
| compiler/context.ts:198 | boolean | ` false ` → ` true ` | killed: G-34: forbidden static starts need an actual dynamic write |
| compiler/context.ts:199 | predicate | ` context.state === 'data' ` → ` !(context.state === 'data') ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:199 | predicate | ` context.state === 'text' ` → ` !(context.state === 'text') ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:200 | predicate | ` context.state === 'double' &#124;&#124; context.state === 'single' ` → ` !(context.state === 'double' &#124;&#124; context.state === 'single') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:200 | operand | ` context.state === 'double' ` → ` false ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:200 | operand | ` context.state === 'single' ` → ` false ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:200 | predicate | ` context.state === 'double' ` → ` !(context.state === 'double') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:200 | predicate | ` context.state === 'single' ` → ` !(context.state === 'single') ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:202 | predicate | ` value ` → ` !(value) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:202 | delete statement | ` value.dynamic = true; ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:202 | boolean | ` true ` → ` false ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:202 | predicate | ` !render ` → ` !(!render) ` | killed: G-34: forbidden static starts need an actual dynamic write |
| compiler/context.ts:202 | negation | ` !render ` → ` render ` | killed: G-34: forbidden static starts need an actual dynamic write |
| compiler/context.ts:202 | delete statement | ` actualWrites.add(value); ` → ` ; ` | killed: G-34: forbidden static starts need an actual dynamic write |
| compiler/context.ts:202 | predicate | ` value.tag ` → ` !(value.tag) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:202 | delete statement | ` value.tag.dynamic = true ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:202 | boolean | ` true ` → ` false ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:203 | drop returned value | ` { place, url: value?.url != null, metadata: value?.tag != null } ` → ` undefined ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:203 | predicate | ` value?.url != null ` → ` !(value?.url != null) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:203 | predicate | ` value?.tag != null ` → ` !(value?.tag != null) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:205 | predicate | ` context.state === 'data' &#124;&#124; context.state === 'text' ` → ` !(context.state === 'data' &#124;&#124; context.state === 'text') ` | killed: G-32/P3: JS inside a partial marks visible snippets and keeps the lexer line flag |
| compiler/context.ts:205 | operand | ` context.state === 'data' ` → ` false ` | killed: G-32/P3: JS inside a partial marks visible snippets and keeps the lexer line flag |
| compiler/context.ts:205 | operand | ` context.state === 'text' ` → ` false ` | killed: G-32: attribute terminators and metadata non-targets keep their meanings |
| compiler/context.ts:205 | predicate | ` context.state === 'data' ` → ` !(context.state === 'data') ` | killed: G-32/P3: JS inside a partial marks visible snippets and keeps the lexer line flag |
| compiler/context.ts:205 | predicate | ` context.state === 'text' ` → ` !(context.state === 'text') ` | killed: G-32: attribute terminators and metadata non-targets keep their meanings |
| compiler/context.ts:206 | predicate | ` context.strict && (opaque &#124;&#124; context.owner === 'script' &#124;&#124; context.owner === 'style') ` → ` !(context.strict && (opaque &#124;&#124; context.owner === 'script' &#124;&#124; context.owner === 'style')) ` | killed: G-32/P3: JS inside a partial marks visible snippets and keeps the lexer line flag |
| compiler/context.ts:206 | operand | ` context.strict ` → ` true ` | killed: G-32/P3: JS inside a partial marks visible snippets and keeps the lexer line flag |
| compiler/context.ts:206 | operand | ` (opaque &#124;&#124; context.owner === 'script' &#124;&#124; context.owner === 'style') ` → ` true ` | killed: supplied template scan: every recorded complete shape still compiles |
| compiler/context.ts:206 | operand | ` opaque &#124;&#124; context.owner === 'script' ` → ` false ` | killed: G-32: every variant key field preserves placement and quote grammar |
| compiler/context.ts:206 | operand | ` context.owner === 'style' ` → ` false ` | killed: G-12/G-21: foreign integration points admit text only and counts never underflow |
| compiler/context.ts:206 | operand | ` opaque ` → ` false ` | killed: G-12/G-21: foreign integration points admit text only and counts never underflow |
| compiler/context.ts:206 | operand | ` context.owner === 'script' ` → ` false ` | killed: G-32: every variant key field preserves placement and quote grammar |
| compiler/context.ts:206 | predicate | ` context.owner === 'script' ` → ` !(context.owner === 'script') ` | killed: supplied template scan: every recorded complete shape still compiles |
| compiler/context.ts:206 | predicate | ` context.owner === 'style' ` → ` !(context.owner === 'style') ` | killed: supplied template scan: every recorded complete shape still compiles |
| compiler/context.ts:206 | delete statement | ` refuse('G3013', at, context, '13', at.source.text.slice(at.start, at.end)) ` → ` ; ` | killed: G-32: every variant key field preserves placement and quote grammar |
| compiler/context.ts:207 | drop returned value | ` { place, url: false, metadata: false } ` → ` undefined ` | killed: G-32: every variant key field preserves placement and quote grammar |
| compiler/context.ts:207 | boolean | ` false ` → ` true ` | killed: G-32/P3: JS inside a partial marks visible snippets and keeps the lexer line flag |
| compiler/context.ts:207 | boolean | ` false ` → ` true ` | killed: G-32: static metadata, slot flags, strip boundaries and empty each paths are pinned |
| compiler/context.ts:209 | drop returned value | ` refuse(opaque &#124;&#124; render ? 'G3009' : 'G3008', at, context, '10', at.source.text.slice(at.start, at.end)) ` → ` undefined ` | killed: G-32: each exit delimiters, strip traversal and nonempty metadata are pinned |
| compiler/context.ts:209 | predicate | ` opaque &#124;&#124; render ` → ` !(opaque &#124;&#124; render) ` | killed: G-32: each exit delimiters, strip traversal and nonempty metadata are pinned |
| compiler/context.ts:209 | operand | ` opaque ` → ` false ` | killed: G-5/G-15: output and snippets only stand in text or quoted values |
| compiler/context.ts:209 | operand | ` render ` → ` false ` | killed: G-32: each exit delimiters, strip traversal and nonempty metadata are pinned |
| compiler/context.ts:213 | predicate | ` node.kind === 'snippet' ` → ` !(node.kind === 'snippet') ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:213 | delete statement | ` scope.bindings.set(node.name, { node, scope, list: [], variants: new Map(), active: null }) ` → ` ; ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:214 | predicate | ` node.kind === 'partial' ` → ` !(node.kind === 'partial') ` | killed: DOCTYPE abrupt greater-than follows the browser; partial declarations retain lexical scope |
| compiler/context.ts:214 | delete statement | ` declare(node.children ?? [], scope) ` → ` ; ` | killed: DOCTYPE abrupt greater-than follows the browser; partial declarations retain lexical scope |
| compiler/context.ts:218 | delete statement | ` declare(nodes, scope); ` → ` ; ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:218 | drop returned value | ` scope ` → ` undefined ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:226 | predicate | ` outer ` → ` !(outer) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:226 | delete statement | ` previous.set(name, outer); ` → ` ; ` | killed: G-41: scripted snippet marking preserves hoisting, shadowing and restored visibility |
| compiler/context.ts:226 | delete statement | ` unmarked.delete(outer) ` → ` ; ` | killed: G-41: scripted snippet marking preserves hoisting, shadowing and restored visibility |
| compiler/context.ts:227 | delete statement | ` visible.set(name, binding); ` → ` ; ` | killed: G-41: scripted snippet marking preserves hoisting, shadowing and restored visibility |
| compiler/context.ts:227 | delete statement | ` unmarked.add(binding) ` → ` ; ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:230 | predicate | ` node.kind === 'js' ` → ` !(node.kind === 'js') ` | killed: G-41: scripted snippet marking preserves hoisting, shadowing and restored visibility |
| compiler/context.ts:231 | delete statement | ` scripted.add(binding.node) ` → ` ; ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:232 | delete statement | ` unmarked.clear() ` → ` ; ` | killed: G-41: compiler time at 64n stays below 32 times 4n across seventeen shapes |
| compiler/context.ts:233 | predicate | ` node.kind === 'partial' ` → ` !(node.kind === 'partial') ` | killed: G-32/P3: JS inside a partial marks visible snippets and keeps the lexer line flag |
| compiler/context.ts:233 | delete statement | ` markScripted(node.children ?? [], { parent: scope, bindings: new Map() }) ` → ` ; ` | killed: G-32/P3: JS inside a partial marks visible snippets and keeps the lexer line flag |
| compiler/context.ts:234 | predicate | ` node.kind === 'if' ` → ` !(node.kind === 'if') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:234 | delete statement | ` markScripted(branch.children, openScope(branch.children, scope)) ` → ` ; ` | killed: G-41: scripted snippet marking preserves hoisting, shadowing and restored visibility |
| compiler/context.ts:235 | predicate | ` node.kind === 'each' &#124;&#124; node.kind === 'snippet' ` → ` !(node.kind === 'each' &#124;&#124; node.kind === 'snippet') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:235 | operand | ` node.kind === 'each' ` → ` false ` | killed: G-32: attribute terminators and metadata non-targets keep their meanings |
| compiler/context.ts:235 | operand | ` node.kind === 'snippet' ` → ` false ` | killed: P1 4 (G-16): {@js} calls the variant of a snippet for ordinary content, whatever was rendered first |
| compiler/context.ts:235 | predicate | ` node.kind === 'each' ` → ` !(node.kind === 'each') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:235 | predicate | ` node.kind === 'snippet' ` → ` !(node.kind === 'snippet') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:235 | delete statement | ` markScripted(node.children, openScope(node.children, scope)) ` → ` ; ` | killed: G-32: attribute terminators and metadata non-targets keep their meanings |
| compiler/context.ts:237 | delete statement | ` visible.delete(name); ` → ` ; ` | killed: G-41: scripted snippet marking preserves hoisting, shadowing and restored visibility |
| compiler/context.ts:237 | delete statement | ` unmarked.delete(binding) ` → ` ; ` | killed: G-41: scripted snippet marking preserves hoisting, shadowing and restored visibility |
| compiler/context.ts:239 | delete statement | ` visible.set(name, binding) ` → ` ; ` | killed: G-41: scripted snippet marking preserves hoisting, shadowing and restored visibility |
| compiler/context.ts:240 | predicate | ` !scripted.has(binding.node) ` → ` !(!scripted.has(binding.node)) ` | killed: G-41: scripted snippet marking preserves hoisting, shadowing and restored visibility |
| compiler/context.ts:240 | negation | ` !scripted.has(binding.node) ` → ` scripted.has(binding.node) ` | killed: G-41: scripted snippet marking preserves hoisting, shadowing and restored visibility |
| compiler/context.ts:240 | delete statement | ` unmarked.add(binding) ` → ` ; ` | killed: G-41: scripted snippet marking preserves hoisting, shadowing and restored visibility |
| compiler/context.ts:244 | predicate | ` current ` → ` !(current) ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:244 | predicate | ` binding ` → ` !(binding) ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:244 | drop returned value | ` binding ` → ` undefined ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:247 | boolean | ` true ` → ` false ` | killed: G-27: comment and DOCTYPE codes depend on actual template tags, not source length |
| compiler/context.ts:250 | predicate | ` last?.kind === 'text' && last.value.length ` → ` !(last?.kind === 'text' && last.value.length) ` | killed: G-32: static metadata, slot flags, strip boundaries and empty each paths are pinned |
| compiler/context.ts:250 | operand | ` last?.kind === 'text' ` → ` true ` | killed: G-32: static metadata, slot flags, strip boundaries and empty each paths are pinned |
| compiler/context.ts:250 | operand | ` last.value.length ` → ` true ` | killed: G-32: static metadata, slot flags, strip boundaries and empty each paths are pinned |
| compiler/context.ts:250 | predicate | ` last?.kind === 'text' ` → ` !(last?.kind === 'text') ` | killed: G-32: static metadata, slot flags, strip boundaries and empty each paths are pinned |
| compiler/context.ts:251 | predicate | ` closes ` → ` !(closes) ` | killed: G-24: SVG animation values refuse every template-tag kind in any namespace |
| compiler/context.ts:251 | delete statement | ` animationValue(exit, end) ` → ` ; ` | killed: G-24: SVG animation values refuse every template-tag kind in any namespace |
| compiler/context.ts:252 | delete statement | ` boundary(exit, end, code) ` → ` ; ` | killed: G-32: every ASCII name letter and HTML separator is read literally |
| compiler/context.ts:253 | predicate | ` !same(entry, exit) ` → ` !(!same(entry, exit)) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:253 | negation | ` !same(entry, exit) ` → ` same(entry, exit) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:253 | delete statement | ` refuse(code, end, entry, '11', describe(exit)) ` → ` ; ` | killed: G-32/P3: context identity mismatches show both tag identities |
| compiler/context.ts:254 | drop returned value | ` { children: result, delimited: exit.delimited } ` → ` undefined ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:257 | key entry.state | ` [entry.state, entry.tag, entry.attribute, entry.owner, entry.svg, entry.math, entry.template, entry.open?.url != null] ` → ` [entry.tag, entry.attribute, entry.owner, entry.svg, entry.math, entry.template, entry.open?.url != null] ` | killed: G-32: every variant key field preserves placement and quote grammar |
| compiler/context.ts:257 | key entry.tag | ` [entry.state, entry.tag, entry.attribute, entry.owner, entry.svg, entry.math, entry.template, entry.open?.url != null] ` → ` [entry.state, entry.attribute, entry.owner, entry.svg, entry.math, entry.template, entry.open?.url != null] ` | killed: G-32: every variant key field preserves placement and quote grammar |
| compiler/context.ts:257 | key entry.attribute | ` [entry.state, entry.tag, entry.attribute, entry.owner, entry.svg, entry.math, entry.template, entry.open?.url != null] ` → ` [entry.state, entry.tag, entry.owner, entry.svg, entry.math, entry.template, entry.open?.url != null] ` | killed: G-32: every variant key field preserves placement and quote grammar |
| compiler/context.ts:257 | key entry.owner | ` [entry.state, entry.tag, entry.attribute, entry.owner, entry.svg, entry.math, entry.template, entry.open?.url != null] ` → ` [entry.state, entry.tag, entry.attribute, entry.svg, entry.math, entry.template, entry.open?.url != null] ` | killed: G-32: every variant key field preserves placement and quote grammar |
| compiler/context.ts:257 | key entry.svg | ` [entry.state, entry.tag, entry.attribute, entry.owner, entry.svg, entry.math, entry.template, entry.open?.url != null] ` → ` [entry.state, entry.tag, entry.attribute, entry.owner, entry.math, entry.template, entry.open?.url != null] ` | killed: G-17/G-22: preserving recursion is independent of call order; context-changing recursion refuses |
| compiler/context.ts:257 | key entry.math | ` [entry.state, entry.tag, entry.attribute, entry.owner, entry.svg, entry.math, entry.template, entry.open?.url != null] ` → ` [entry.state, entry.tag, entry.attribute, entry.owner, entry.svg, entry.template, entry.open?.url != null] ` | killed: G-32: every review bypass keeps its refusal or URL checkpoint |
| compiler/context.ts:257 | key entry.template | ` [entry.state, entry.tag, entry.attribute, entry.owner, entry.svg, entry.math, entry.template, entry.open?.url != null] ` → ` [entry.state, entry.tag, entry.attribute, entry.owner, entry.svg, entry.math, entry.open?.url != null] ` | killed: G-32: every review bypass keeps its refusal or URL checkpoint |
| compiler/context.ts:257 | key entry.open?.url != null | ` [entry.state, entry.tag, entry.attribute, entry.owner, entry.svg, entry.math, entry.template, entry.open?.url != null] ` → ` [entry.state, entry.tag, entry.attribute, entry.owner, entry.svg, entry.math, entry.template] ` | killed: G-28: snippet variants retain whether URL writes are checked |
| compiler/context.ts:257 | predicate | ` entry.open?.url != null ` → ` !(entry.open?.url != null) ` | equivalent: Negating a boolean key component is bijective and preserves exactly the same variant partitions. |
| compiler/context.ts:259 | predicate | ` known ` → ` !(known) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:259 | drop returned value | ` known.name ` → ` undefined ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:260 | predicate | ` binding.active ` → ` !(binding.active) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:260 | delete statement | ` refuse('G3011', at, binding.active, '11', describe(entry)) ` → ` ; ` | killed: G-17/G-22: preserving recursion is independent of call order; context-changing recursion refuses |
| compiler/context.ts:261 | boolean | ` false ` → ` true ` | killed: G-34/G-36: static-only snippets stay static; actual writes propagate through calls and cycles |
| compiler/context.ts:262 | delete statement | ` variants.set(variant.name, variant) ` → ` ; ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:263 | delete statement | ` binding.variants.set(key, variant); ` → ` ; ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:263 | delete statement | ` binding.list.push(variant); ` → ` ; ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:263 | delete statement | ` binding.active = entry ` → ` ; ` | killed: G-17/G-22: preserving recursion is independent of call order; context-changing recursion refuses |
| compiler/context.ts:264 | delete statement | ` variant.children = path(binding.node.children, entry, openScope(binding.node.children, binding.scope), 'G3011', binding.node.span).children ` → ` ; ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:265 | delete statement | ` binding.active = null ` → ` ; ` | killed: G-34/G-36: static-only snippets stay static; actual writes propagate through calls and cycles |
| compiler/context.ts:266 | drop returned value | ` variant.name ` → ` undefined ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:268 | boolean | ` false ` → ` true ` | killed: rules 1/7/8: comments and declarations are whole, and text end tags cannot straddle a template tag |
| compiler/context.ts:271 | predicate | ` node.kind === 'text' ` → ` !(node.kind === 'text') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:271 | delete statement | ` result.push(read(node, context, index + 1 < nodes.length &#124;&#124; closes)); ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:271 | operand | ` index + 1 < nodes.length ` → ` false ` | killed: rules 1/7/8: comments and declarations are whole, and text end tags cannot straddle a template tag |
| compiler/context.ts:271 | operand | ` closes ` → ` false ` | killed: G-27: comment and DOCTYPE codes depend on actual template tags, not source length |
| compiler/context.ts:271 | predicate | ` index + 1 < nodes.length ` → ` !(index + 1 < nodes.length) ` | killed: rules 1/7/8: comments and declarations are whole, and text end tags cannot straddle a template tag |
| compiler/context.ts:272 | delete statement | ` animationValue(context, node.span) ` → ` ; ` | killed: G-24: SVG animation values refuse every template-tag kind in any namespace |
| compiler/context.ts:273 | predicate | ` node.kind === 'const' ` → ` !(node.kind === 'const') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:273 | delete statement | ` boundary(context, node.span); ` → ` ; ` | killed: G-32: attribute terminators and metadata non-targets keep their meanings |
| compiler/context.ts:273 | delete statement | ` result.push(node); ` → ` ; ` | killed: {#each} / {/each} > $ alone refers to the whole context object, not a "$"-named property |
| compiler/context.ts:274 | predicate | ` node.kind === 'snippet' ` → ` !(node.kind === 'snippet') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:275 | delete statement | ` boundary(context, node.span) ` → ` ; ` | killed: G-14: blocks preserve structure and whitespace is a forward fact |
| compiler/context.ts:277 | delete statement | ` result.push({ ...node, variants: binding.list, ...(scripted.has(node) ? { js: specialize(binding, data(), node.span) } : {}) }); ` → ` ; ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:277 | predicate | ` scripted.has(node) ` → ` !(scripted.has(node)) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:279 | predicate | ` node.kind === 'output' &#124;&#124; node.kind === 'js' ` → ` !(node.kind === 'output' &#124;&#124; node.kind === 'js') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:279 | operand | ` node.kind === 'output' ` → ` false ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:279 | operand | ` node.kind === 'js' ` → ` false ` | killed: G-32/P3: JS inside a partial marks visible snippets and keeps the lexer line flag |
| compiler/context.ts:279 | predicate | ` node.kind === 'output' ` → ` !(node.kind === 'output') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:279 | predicate | ` node.kind === 'js' ` → ` !(node.kind === 'js') ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:279 | delete statement | ` result.push({ ...node, slot: slot(context, node.span, node.kind === 'js' &#124;&#124; node.raw) }); ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:279 | operand | ` node.kind === 'js' ` → ` false ` | killed: G-5/G-15: output and snippets only stand in text or quoted values |
| compiler/context.ts:279 | operand | ` node.raw ` → ` false ` | killed: G-5/G-15: output and snippets only stand in text or quoted values |
| compiler/context.ts:279 | predicate | ` node.kind === 'js' ` → ` !(node.kind === 'js') ` | killed: supplied template scan: every recorded complete shape still compiles |
| compiler/context.ts:280 | delete statement | ` boundary(context, node.span, node.kind === 'render' ? 'G3009' : node.kind === 'partial' ? 'G3011' : 'G3010') ` → ` ; ` | killed: G-14: blocks preserve structure and whitespace is a forward fact |
| compiler/context.ts:280 | predicate | ` node.kind === 'render' ` → ` !(node.kind === 'render') ` | killed: G-14: blocks preserve structure and whitespace is a forward fact |
| compiler/context.ts:280 | predicate | ` node.kind === 'partial' ` → ` !(node.kind === 'partial') ` | killed: G-14: blocks preserve structure and whitespace is a forward fact |
| compiler/context.ts:281 | predicate | ` node.kind ` → ` !(node.kind) ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:282 | case comparison | ` 'if' ` → ` "__mutation_unreachable_case__" ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:285 | predicate | ` node.branches[node.branches.length - 1]!.condition !== null ` → ` !(node.branches[node.branches.length - 1]!.condition !== null) ` | killed: G-28: each entry, missing else, tag/quote identities and math count stay distinct |
| compiler/context.ts:285 | delete statement | ` ends.push(context.delimited) ` → ` ; ` | killed: G-28: each entry, missing else, tag/quote identities and math count stay distinct |
| compiler/context.ts:286 | delete statement | ` context.delimited = ends.every(Boolean) ` → ` ; ` | killed: G-14: blocks preserve structure and whitespace is a forward fact |
| compiler/context.ts:287 | delete statement | ` result.push({ ...node, branches: node.branches.map((branch, index) => ({ ...branch, children: paths[index]!.children })) }); ` → ` ; ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:289 | case comparison | ` 'each' ` → ` "__mutation_unreachable_case__" ` | killed: {#each} / {/each} > iterates array |
| compiler/context.ts:290 | boolean | ` false ` → ` true ` | killed: G-28: each entry, missing else, tag/quote identities and math count stay distinct |
| compiler/context.ts:291 | delete statement | ` context.delimited &&= body.delimited ` → ` ; ` | killed: G-32: each exit delimiters, strip traversal and nonempty metadata are pinned |
| compiler/context.ts:291 | assignment condition | ` context.delimited &&= body.delimited ` → ` context.delimited = body.delimited ` | killed: G-32: static metadata, slot flags, strip boundaries and empty each paths are pinned |
| compiler/context.ts:291 | assignment operand | ` body.delimited ` → ` true ` | killed: G-32: each exit delimiters, strip traversal and nonempty metadata are pinned |
| compiler/context.ts:292 | delete statement | ` result.push({ ...node, children: body.children }); ` → ` ; ` | killed: {#each} / {/each} > iterates array |
| compiler/context.ts:294 | case comparison | ` 'partial' ` → ` "__mutation_unreachable_case__" ` | killed: G-32/P3: JS inside a partial marks visible snippets and keeps the lexer line flag |
| compiler/context.ts:295 | boolean | ` false ` → ` true ` | killed: G-27: comment and DOCTYPE codes depend on actual template tags, not source length |
| compiler/context.ts:296 | delete statement | ` context.delimited = body.delimited; ` → ` ; ` | killed: G-35: lint always returns a Promise; partials preserve context without a resolver |
| compiler/context.ts:296 | delete statement | ` result.push(...body.children); ` → ` ; ` | killed: G-32/P3: JS inside a partial marks visible snippets and keeps the lexer line flag |
| compiler/context.ts:298 | case comparison | ` 'render' ` → ` "__mutation_unreachable_case__" ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:301 | predicate | ` ANIMATION_ELEMENTS.has(context.tag) ` → ` !(ANIMATION_ELEMENTS.has(context.tag)) ` | killed: G-32: each exit delimiters, strip traversal and nonempty metadata are pinned |
| compiler/context.ts:301 | delete statement | ` specialization = specialize(resolve(scope, node.name), context, node.span) ` → ` ; ` | killed: G-24: animation attributes supplied by snippets and partials also refuse |
| compiler/context.ts:302 | boolean | ` false ` → ` true ` | killed: G-12/G-21: foreign integration points admit text only and counts never underflow |
| compiler/context.ts:302 | boolean | ` true ` → ` false ` | killed: G-34/G-36: static-only snippets stay static; actual writes propagate through calls and cycles |
| compiler/context.ts:303 | delete statement | ` specialization ??= specialize(resolve(scope, node.name), context, node.span) ` → ` ; ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:304 | predicate | ` context.open ` → ` !(context.open) ` | killed: G-32/G-36: cached suffix and write summaries apply to every caller value |
| compiler/context.ts:304 | delete statement | ` renderWrites.push({ value: context.open, name: specialization }) ` → ` ; ` | killed: G-32/G-36: cached suffix and write summaries apply to every caller value |
| compiler/context.ts:305 | delete statement | ` result.push({ ...node, slot: written, specialization }); ` → ` ; ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/context.ts:309 | drop returned value | ` result ` → ` undefined ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:312 | delete statement | ` markScripted(ast.children, scope) ` → ` ; ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:314 | predicate | ` context.state !== 'data' ` → ` !(context.state !== 'data') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:314 | delete statement | ` refuse('G3012', { ...ast.span, start: ast.span.end }, context, '12', describe(context)) ` → ` ; ` | killed: G-34: forbidden static starts need an actual dynamic write |
| compiler/context.ts:320 | predicate | ` node.kind === 'output' &#124;&#124; node.kind === 'js' ` → ` !(node.kind === 'output' &#124;&#124; node.kind === 'js') ` | killed: G-34/G-36: static-only snippets stay static; actual writes propagate through calls and cycles |
| compiler/context.ts:320 | operand | ` node.kind === 'output' ` → ` false ` | killed: G-32/G-36: cached suffix and write summaries apply to every caller value |
| compiler/context.ts:320 | operand | ` node.kind === 'js' ` → ` false ` | killed: G-32/G-36: cached suffix and write summaries apply to every caller value |
| compiler/context.ts:320 | predicate | ` node.kind === 'output' ` → ` !(node.kind === 'output') ` | killed: G-34/G-36: static-only snippets stay static; actual writes propagate through calls and cycles |
| compiler/context.ts:320 | predicate | ` node.kind === 'js' ` → ` !(node.kind === 'js') ` | killed: G-34/G-36: static-only snippets stay static; actual writes propagate through calls and cycles |
| compiler/context.ts:320 | delete statement | ` variant.writes = true ` → ` ; ` | killed: G-32/G-36: cached suffix and write summaries apply to every caller value |
| compiler/context.ts:320 | boolean | ` true ` → ` false ` | killed: G-32/G-36: cached suffix and write summaries apply to every caller value |
| compiler/context.ts:321 | predicate | ` node.kind === 'render' ` → ` !(node.kind === 'render') ` | killed: G-32/G-36: cached suffix and write summaries apply to every caller value |
| compiler/context.ts:323 | delete statement | ` list.push(variant); ` → ` ; ` | killed: G-32/G-36: cached suffix and write summaries apply to every caller value |
| compiler/context.ts:323 | delete statement | ` callers.set(name, list) ` → ` ; ` | killed: G-32/G-36: cached suffix and write summaries apply to every caller value |
| compiler/context.ts:324 | predicate | ` node.kind === 'if' ` → ` !(node.kind === 'if') ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:324 | delete statement | ` inspect(branch.children, variant) ` → ` ; ` | killed: G-40: cached conditional and loop writes propagate to every caller |
| compiler/context.ts:325 | predicate | ` node.kind === 'each' ` → ` !(node.kind === 'each') ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/context.ts:325 | delete statement | ` inspect(node.children, variant) ` → ` ; ` | killed: G-40: cached conditional and loop writes propagate to every caller |
| compiler/context.ts:328 | delete statement | ` inspect(variant.children, variant); ` → ` ; ` | killed: G-32/G-36: cached suffix and write summaries apply to every caller value |
| compiler/context.ts:328 | predicate | ` variant.writes ` → ` !(variant.writes) ` | killed: G-32/G-36: cached suffix and write summaries apply to every caller value |
| compiler/context.ts:328 | delete statement | ` pending.push(variant) ` → ` ; ` | killed: G-32/G-36: cached suffix and write summaries apply to every caller value |
| compiler/context.ts:329 | predicate | ` index < pending.length ` → ` !(index < pending.length) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/context.ts:330 | predicate | ` !caller.writes ` → ` !(!caller.writes) ` | killed: G-32/G-36: cached suffix and write summaries apply to every caller value |
| compiler/context.ts:330 | negation | ` !caller.writes ` → ` caller.writes ` | killed: G-32/G-36: cached suffix and write summaries apply to every caller value |
| compiler/context.ts:330 | delete statement | ` caller.writes = true; ` → ` ; ` | killed: G-32/G-36: cached suffix and write summaries apply to every caller value |
| compiler/context.ts:330 | boolean | ` true ` → ` false ` | killed: G-32/G-36: cached suffix and write summaries apply to every caller value |
| compiler/context.ts:330 | delete statement | ` pending.push(caller) ` → ` ; ` | killed: G-40: writes propagate through three snippet levels to a second caller |
| compiler/context.ts:332 | predicate | ` variants.get(render.name)!.writes ` → ` !(variants.get(render.name)!.writes) ` | killed: G-34/G-36: static-only snippets stay static; actual writes propagate through calls and cycles |
| compiler/context.ts:332 | delete statement | ` actualWrites.add(render.value) ` → ` ; ` | killed: G-32/G-36: cached suffix and write summaries apply to every caller value |
| compiler/context.ts:333 | predicate | ` actualWrites.has(start.value) ` → ` !(actualWrites.has(start.value)) ` | killed: G-34: forbidden static starts need an actual dynamic write |
| compiler/context.ts:334 | predicate | ` start.forbidden ` → ` !(start.forbidden) ` | killed: G-30: refusals locate the offending character and bound their excerpts |
| compiler/context.ts:334 | delete statement | `` fail('G3015', `HTML context URL; forbidden static prefix: ${excerpt(start.text)}`, start.at(0), 'Use a relative URL, or http:, https:, mailto: or tel:, before a dynamic value.') `` → ` ; ` | killed: G-31: forbidden static URL starts fail at compile with specific help |
| compiler/context.ts:335 | delete statement | `` fail('G3015', `HTML context URL; rule 14: ${excerpt(start.text)}`, start.at(start.text.indexOf('&')), 'Write the character itself, not a reference, before a value in a URL.') `` → ` ; ` | killed: G-7 five static reference prefixes |
| compiler/context.ts:337 | drop returned value | ` { ...ast, children } ` → ` undefined ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:3 | set 'http' | ` ['http', 'https', 'mailto', 'tel'] ` → ` ['https', 'mailto', 'tel'] ` | killed: G-32: URL prefix transitions cover every ASCII code point and allowed scheme |
| compiler/url.ts:3 | set 'https' | ` ['http', 'https', 'mailto', 'tel'] ` → ` ['http', 'mailto', 'tel'] ` | killed: G-36: literal scheme completions checkpoint attribute ends, including static snippets |
| compiler/url.ts:3 | set 'mailto' | ` ['http', 'https', 'mailto', 'tel'] ` → ` ['http', 'https', 'tel'] ` | killed: G-32: URL prefix transitions cover every ASCII code point and allowed scheme |
| compiler/url.ts:3 | set 'tel' | ` ['http', 'https', 'mailto', 'tel'] ` → ` ['http', 'https', 'mailto'] ` | killed: G-32: URL prefix transitions cover every ASCII code point and allowed scheme |
| compiler/url.ts:5 | operand | ` (code >= 97 && code <= 122) ` → ` false ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/url.ts:5 | operand | ` (code >= 65 && code <= 90) ` → ` false ` | killed: G-32: URL prefix transitions cover every ASCII code point and allowed scheme |
| compiler/url.ts:5 | operand | ` code >= 97 ` → ` true ` | killed: G-32: URL prefix transitions cover every ASCII code point and allowed scheme |
| compiler/url.ts:5 | operand | ` code <= 122 ` → ` true ` | killed: a value with the marks of stripEmptyMeta > passes no URL through the check, into either kind of value |
| compiler/url.ts:5 | predicate | ` code >= 97 ` → ` !(code >= 97) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/url.ts:5 | predicate | ` code <= 122 ` → ` !(code <= 122) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/url.ts:5 | operand | ` code >= 65 ` → ` true ` | killed: G-32: URL prefix transitions cover every ASCII code point and allowed scheme |
| compiler/url.ts:5 | operand | ` code <= 90 ` → ` true ` | killed: a value with the marks of stripEmptyMeta > passes no URL through the check, into either kind of value |
| compiler/url.ts:5 | predicate | ` code >= 65 ` → ` !(code >= 65) ` | killed: G-32: URL prefix transitions cover every ASCII code point and allowed scheme |
| compiler/url.ts:5 | predicate | ` code <= 90 ` → ` !(code <= 90) ` | killed: a value with the marks of stripEmptyMeta > passes no URL through the check, into either kind of value |
| compiler/url.ts:6 | operand | ` code >= 48 ` → ` true ` | killed: G-32: URL prefix transitions cover every ASCII code point and allowed scheme |
| compiler/url.ts:6 | operand | ` code <= 57 ` → ` true ` | killed: a value with the marks of stripEmptyMeta > passes no URL through the check, into either kind of value |
| compiler/url.ts:6 | predicate | ` code >= 48 ` → ` !(code >= 48) ` | killed: G-32: URL prefix transitions cover every ASCII code point and allowed scheme |
| compiler/url.ts:6 | predicate | ` code <= 57 ` → ` !(code <= 57) ` | killed: a value with the marks of stripEmptyMeta > passes no URL through the check, into either kind of value |
| compiler/url.ts:18 | drop returned value | ` this.mode === 'relative' &#124;&#124; this.mode === 'allowed' ` → ` undefined ` | killed: G-36: literal scheme completions checkpoint attribute ends, including static snippets |
| compiler/url.ts:18 | operand | ` this.mode === 'relative' ` → ` false ` | killed: G-32: URL prefix transitions cover every ASCII code point and allowed scheme |
| compiler/url.ts:18 | operand | ` this.mode === 'allowed' ` → ` false ` | killed: G-36: literal scheme completions checkpoint attribute ends, including static snippets |
| compiler/url.ts:18 | predicate | ` this.mode === 'relative' ` → ` !(this.mode === 'relative') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:18 | predicate | ` this.mode === 'allowed' ` → ` !(this.mode === 'allowed') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:20 | drop returned value | ` this.mode === 'forbidden' ` → ` undefined ` | killed: G-34: forbidden static starts need an actual dynamic write |
| compiler/url.ts:20 | predicate | ` this.mode === 'forbidden' ` → ` !(this.mode === 'forbidden') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:24 | predicate | ` code === TAB &#124;&#124; code === LF &#124;&#124; code === CR ` → ` !(code === TAB &#124;&#124; code === LF &#124;&#124; code === CR) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:24 | operand | ` code === TAB &#124;&#124; code === LF ` → ` false ` | killed: G-32: URL prefix transitions cover every ASCII code point and allowed scheme |
| compiler/url.ts:24 | operand | ` code === CR ` → ` false ` | killed: G-32: URL prefix transitions cover every ASCII code point and allowed scheme |
| compiler/url.ts:24 | operand | ` code === TAB ` → ` false ` | killed: G-32: URL prefix transitions cover every ASCII code point and allowed scheme |
| compiler/url.ts:24 | operand | ` code === LF ` → ` false ` | killed: G-32: URL prefix transitions cover every ASCII code point and allowed scheme |
| compiler/url.ts:24 | predicate | ` code === TAB ` → ` !(code === TAB) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:24 | predicate | ` code === LF ` → ` !(code === LF) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:24 | predicate | ` code === CR ` → ` !(code === CR) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:25 | predicate | ` this.mode === 'leading' ` → ` !(this.mode === 'leading') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:26 | predicate | ` code <= SPACE ` → ` !(code <= SPACE) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:27 | predicate | ` code === SLASH &#124;&#124; code === BACKSLASH ` → ` !(code === SLASH &#124;&#124; code === BACKSLASH) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:27 | operand | ` code === SLASH ` → ` false ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:27 | operand | ` code === BACKSLASH ` → ` false ` | killed: G-32: URL prefix transitions cover every ASCII code point and allowed scheme |
| compiler/url.ts:27 | predicate | ` code === SLASH ` → ` !(code === SLASH) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:27 | predicate | ` code === BACKSLASH ` → ` !(code === BACKSLASH) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/url.ts:27 | delete statement | ` this.mode = 'slash'; ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:28 | predicate | ` !isLetter(code) ` → ` !(!isLetter(code)) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/url.ts:28 | negation | ` !isLetter(code) ` → ` isLetter(code) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/url.ts:28 | delete statement | ` this.mode = 'relative'; ` → ` ; ` | killed: G-32: URL prefix transitions cover every ASCII code point and allowed scheme |
| compiler/url.ts:29 | delete statement | ` this.mode = 'scheme' ` → ` ; ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/url.ts:30 | predicate | ` this.mode === 'slash' ` → ` !(this.mode === 'slash') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:31 | delete statement | ` this.mode = code === SLASH &#124;&#124; code === BACKSLASH ? 'forbidden' : 'relative' ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:31 | predicate | ` code === SLASH &#124;&#124; code === BACKSLASH ` → ` !(code === SLASH &#124;&#124; code === BACKSLASH) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:31 | operand | ` code === SLASH ` → ` false ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:31 | operand | ` code === BACKSLASH ` → ` false ` | killed: G-32: URL prefix transitions cover every ASCII code point and allowed scheme |
| compiler/url.ts:31 | predicate | ` code === SLASH ` → ` !(code === SLASH) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:31 | predicate | ` code === BACKSLASH ` → ` !(code === BACKSLASH) ` | killed: a value with the marks of stripEmptyMeta > passes no URL through the check, into either kind of value |
| compiler/url.ts:34 | predicate | ` this.mode !== 'scheme' ` → ` !(this.mode !== 'scheme') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:35 | predicate | ` code === COLON ` → ` !(code === COLON) ` | killed: G-38: finished prefixes with no nonempty dynamic write render static fallbacks |
| compiler/url.ts:36 | boolean | ` false ` → ` true ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/url.ts:37 | predicate | ` index < SCHEMES.length ` → ` !(index < SCHEMES.length) ` | killed: G-36: literal scheme completions checkpoint attribute ends, including static snippets |
| compiler/url.ts:37 | delete statement | ` allowed &#124;&#124;= (this.schemes & (1 << index)) !== 0 && SCHEMES[index]!.length === this.schemeLength ` → ` ; ` | killed: G-36: literal scheme completions checkpoint attribute ends, including static snippets |
| compiler/url.ts:37 | assignment condition | ` allowed &#124;&#124;= (this.schemes & (1 << index)) !== 0 && SCHEMES[index]!.length === this.schemeLength ` → ` allowed = (this.schemes & (1 << index)) !== 0 && SCHEMES[index]!.length === this.schemeLength ` | killed: G-36: literal scheme completions checkpoint attribute ends, including static snippets |
| compiler/url.ts:37 | assignment operand | ` (this.schemes & (1 << index)) !== 0 && SCHEMES[index]!.length === this.schemeLength ` → ` false ` | killed: G-36: literal scheme completions checkpoint attribute ends, including static snippets |
| compiler/url.ts:37 | operand | ` (this.schemes & (1 << index)) !== 0 ` → ` true ` | killed: G-32: every variant key field preserves placement and quote grammar |
| compiler/url.ts:37 | operand | ` SCHEMES[index]!.length === this.schemeLength ` → ` true ` | killed: G-32: every variant key field preserves placement and quote grammar |
| compiler/url.ts:37 | predicate | ` (this.schemes & (1 << index)) !== 0 ` → ` !((this.schemes & (1 << index)) !== 0) ` | killed: G-36: literal scheme completions checkpoint attribute ends, including static snippets |
| compiler/url.ts:37 | predicate | ` SCHEMES[index]!.length === this.schemeLength ` → ` !(SCHEMES[index]!.length === this.schemeLength) ` | killed: G-36: literal scheme completions checkpoint attribute ends, including static snippets |
| compiler/url.ts:38 | delete statement | ` this.mode = allowed ? 'allowed' : 'forbidden' ` → ` ; ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/url.ts:38 | predicate | ` allowed ` → ` !(allowed) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/url.ts:39 | predicate | ` isLetter(code) &#124;&#124; isDigit(code) &#124;&#124; code === PLUS &#124;&#124; code === MINUS &#124;&#124; code === PERIOD ` → ` !(isLetter(code) &#124;&#124; isDigit(code) &#124;&#124; code === PLUS &#124;&#124; code === MINUS &#124;&#124; code === PERIOD) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/url.ts:39 | operand | ` isLetter(code) &#124;&#124; isDigit(code) &#124;&#124; code === PLUS &#124;&#124; code === MINUS ` → ` false ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/url.ts:39 | operand | ` code === PERIOD ` → ` false ` | killed: G-32: URL prefix transitions cover every ASCII code point and allowed scheme |
| compiler/url.ts:39 | operand | ` isLetter(code) &#124;&#124; isDigit(code) &#124;&#124; code === PLUS ` → ` false ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/url.ts:39 | operand | ` code === MINUS ` → ` false ` | killed: G-32: URL prefix transitions cover every ASCII code point and allowed scheme |
| compiler/url.ts:39 | operand | ` isLetter(code) &#124;&#124; isDigit(code) ` → ` false ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/url.ts:39 | operand | ` code === PLUS ` → ` false ` | killed: G-32: URL prefix transitions cover every ASCII code point and allowed scheme |
| compiler/url.ts:39 | operand | ` isLetter(code) ` → ` false ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/url.ts:39 | operand | ` isDigit(code) ` → ` false ` | killed: G-32: URL prefix transitions cover every ASCII code point and allowed scheme |
| compiler/url.ts:39 | predicate | ` code === PLUS ` → ` !(code === PLUS) ` | killed: a value with the marks of stripEmptyMeta > passes no URL through the check, into either kind of value |
| compiler/url.ts:39 | predicate | ` code === MINUS ` → ` !(code === MINUS) ` | killed: G-32: URL prefix transitions cover every ASCII code point and allowed scheme |
| compiler/url.ts:39 | predicate | ` code === PERIOD ` → ` !(code === PERIOD) ` | killed: a value with the marks of stripEmptyMeta > passes no URL through the check, into either kind of value |
| compiler/url.ts:41 | predicate | ` index < SCHEMES.length ` → ` !(index < SCHEMES.length) ` | killed: G-36: end checks reject unsettled bare words followed by references or port literals |
| compiler/url.ts:41 | predicate | ` SCHEMES[index]!.charCodeAt(this.schemeLength) !== (code &#124; 32) ` → ` !(SCHEMES[index]!.charCodeAt(this.schemeLength) !== (code &#124; 32)) ` | killed: G-36: literal scheme completions checkpoint attribute ends, including static snippets |
| compiler/url.ts:41 | delete statement | ` this.schemes &= ~(1 << index) ` → ` ; ` | killed: G-36: end checks reject unsettled bare words followed by references or port literals |
| compiler/url.ts:43 | predicate | ` this.schemes ` → ` !(this.schemes) ` | killed: G-36: literal scheme completions checkpoint attribute ends, including static snippets |
| compiler/url.ts:43 | delete statement | ` this.schemeLength++ ` → ` ; ` | killed: G-36: literal scheme completions checkpoint attribute ends, including static snippets |
| compiler/url.ts:44 | delete statement | ` this.mode = 'relative' ` → ` ; ` | killed: a value with the marks of stripEmptyMeta > passes no URL through the check, into either kind of value |
| compiler/url.ts:48 | boolean | ` false ` → ` true ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/url.ts:49 | predicate | ` text === '' &#124;&#124; this.settled ` → ` !(text === '' &#124;&#124; this.settled) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:49 | operand | ` text === '' ` → ` false ` | equivalent: Feeding empty text adds only an empty diagnostic chunk, scans nothing and leaves every check unchanged. |
| compiler/url.ts:49 | operand | ` this.settled ` → ` false ` | equivalent: A settled prefix skips the scan loop and can never report the extra diagnostic chunks. |
| compiler/url.ts:49 | predicate | ` text === '' ` → ` !(text === '') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:50 | delete statement | ` this.chunks.push(text) ` → ` ; ` | killed: G-1/G-2 appendix near-miss branches both retain their contributions |
| compiler/url.ts:51 | predicate | ` this.mode === 'forbidden' &#124;&#124; this.mode === 'undecided' ` → ` !(this.mode === 'forbidden' &#124;&#124; this.mode === 'undecided') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:51 | operand | ` this.mode === 'forbidden' ` → ` false ` | killed: G-32: URL scans stop at settled and absorbing prefixes |
| compiler/url.ts:51 | operand | ` this.mode === 'undecided' ` → ` false ` | killed: G-32: URL scans stop at settled and absorbing prefixes |
| compiler/url.ts:51 | predicate | ` this.mode === 'forbidden' ` → ` !(this.mode === 'forbidden') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:51 | predicate | ` this.mode === 'undecided' ` → ` !(this.mode === 'undecided') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:52 | predicate | ` index < text.length && !this.settled ` → ` !(index < text.length && !this.settled) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:52 | operand | ` index < text.length ` → ` true ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:52 | operand | ` !this.settled ` → ` true ` | killed: G-32: URL scans stop at settled and absorbing prefixes |
| compiler/url.ts:52 | predicate | ` index < text.length ` → ` !(index < text.length) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:52 | negation | ` !this.settled ` → ` this.settled ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:54 | predicate | ` code === AMPERSAND && !escaped ` → ` !(code === AMPERSAND && !escaped) ` | killed: G-34: forbidden static starts need an actual dynamic write |
| compiler/url.ts:54 | operand | ` code === AMPERSAND ` → ` true ` | killed: G-34: forbidden static starts need an actual dynamic write |
| compiler/url.ts:54 | operand | ` !escaped ` → ` true ` | killed: URL sources: escaped &, raw/JS &, and references after a template tag have distinct admission |
| compiler/url.ts:54 | predicate | ` code === AMPERSAND ` → ` !(code === AMPERSAND) ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/url.ts:54 | negation | ` !escaped ` → ` escaped ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/url.ts:54 | delete statement | ` this.mode = 'undecided'; ` → ` ; ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/url.ts:55 | delete statement | ` this.read(code === 0 ? 0xfffd : code) ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:55 | predicate | ` code === 0 ` → ` !(code === 0) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:60 | predicate | ` !nonempty ` → ` !(!nonempty) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/url.ts:60 | negation | ` !nonempty ` → ` nonempty ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/url.ts:61 | delete statement | ` this.checkpoints++ ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:62 | predicate | ` this.settled ` → ` !(this.settled) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:63 | predicate | ` this.mode === 'forbidden' &#124;&#124; this.mode === 'undecided' ` → ` !(this.mode === 'forbidden' &#124;&#124; this.mode === 'undecided') ` | killed: G-32/G-36: cached suffix and write summaries apply to every caller value |
| compiler/url.ts:63 | operand | ` this.mode === 'forbidden' ` → ` false ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/url.ts:63 | operand | ` this.mode === 'undecided' ` → ` false ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/url.ts:63 | predicate | ` this.mode === 'forbidden' ` → ` !(this.mode === 'forbidden') ` | killed: G-32/G-36: cached suffix and write summaries apply to every caller value |
| compiler/url.ts:63 | predicate | ` this.mode === 'undecided' ` → ` !(this.mode === 'undecided') ` | killed: G-32/G-36: cached suffix and write summaries apply to every caller value |
| compiler/url.ts:63 | predicate | ` this.mode === 'undecided' ` → ` !(this.mode === 'undecided') ` | killed: G-31: G5001 names only the reason that applies |
| compiler/codegen.ts:62 | predicate | ` record?.dynamic && (record.url !== null &#124;&#124; (record.tag !== null && strip)) ` → ` !(record?.dynamic && (record.url !== null &#124;&#124; (record.tag !== null && strip))) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:62 | operand | ` record?.dynamic ` → ` true ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:62 | operand | ` (record.url !== null &#124;&#124; (record.tag !== null && strip)) ` → ` true ` | equivalent: Records have URL or metadata; with strip false an extra metadata-only cut writes identical literals and performs no work at render. |
| compiler/codegen.ts:62 | operand | ` record.url !== null ` → ` false ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:62 | operand | ` (record.tag !== null && strip) ` → ` false ` | killed: G-32/P3: empty metadata removes static indentation across blocks and leaves values intact |
| compiler/codegen.ts:62 | predicate | ` record.url !== null ` → ` !(record.url !== null) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:62 | operand | ` record.tag !== null ` → ` true ` | equivalent: A record without a URL necessarily has a metadata tag; with a URL the other OR operand already holds. |
| compiler/codegen.ts:62 | operand | ` strip ` → ` true ` | equivalent: With strip false an extra metadata-only cut writes identical literals; all metadata actions still have strip guards. |
| compiler/codegen.ts:62 | predicate | ` record.tag !== null ` → ` !(record.tag !== null) ` | killed: G-32/P3: empty metadata removes static indentation across blocks and leaves values intact |
| compiler/codegen.ts:64 | boolean | ` false ` → ` true ` | killed: URL sources: escaped &, raw/JS &, and references after a template tag have distinct admission |
| compiler/codegen.ts:64 | generated comparison 8 | `` }.length>0` `` → `` }.length<=0` `` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:65 | predicate | ` slot?.url ` → ` !(slot?.url) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:65 | predicate | ` feed ` → ` !(feed) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:66 | predicate | ` slot?.metadata && strip ` → ` !(slot?.metadata && strip) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:66 | operand | ` slot?.metadata ` → ` true ` | killed: G-32: each exit delimiters, strip traversal and nonempty metadata are pinned |
| compiler/codegen.ts:66 | operand | ` strip ` → ` true ` | equivalent: With strip false no generated code initializes $$meta, so the additional guarded metadata write is inert. |
| compiler/codegen.ts:66 | generated assignment 47 | `` `if($$meta){$$meta.dynamic=true;$$meta.nonempty&#124;&#124;=${ `` → `` `if($$meta){$$meta.dynamic=true;$$meta.nonempty=${ `` | killed: G-32: each exit delimiters, strip traversal and nonempty metadata are pinned |
| compiler/codegen.ts:66 | generated comparison 8 | `` }.length>0;}` `` → `` }.length<=0;}` `` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:74 | predicate | ` to > from ` → ` !(to > from) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:76 | predicate | ` value.startsWith('\r\n', from) ` → ` !(value.startsWith('\r\n', from)) ` | killed: G-32/P3: empty metadata removes static indentation across blocks and leaves values intact |
| compiler/codegen.ts:76 | predicate | ` value.startsWith('\n', from) ` → ` !(value.startsWith('\n', from)) ` | killed: G-32/P3: empty metadata removes static indentation across blocks and leaves values intact |
| compiler/codegen.ts:77 | predicate | ` trackIndent && newline ` → ` !(trackIndent && newline) ` | killed: G-32/P3: empty metadata removes static indentation across blocks and leaves values intact |
| compiler/codegen.ts:77 | operand | ` trackIndent ` → ` true ` | equivalent: When metadata tracking is off, $$skipNewline remains false; the additional literal branch emits the same text. |
| compiler/codegen.ts:77 | operand | ` newline ` → ` true ` | equivalent: When newline is zero, both generated branches emit exactly the same literal. |
| compiler/codegen.ts:77 | delete statement | `` body += `if($$skipNewline){${buffer}+='${escapeJs(value.slice(from + newline, to))}';}else{${buffer}+='${text}';}` `` → ` ; ` | killed: G-32/P3: empty metadata removes static indentation across blocks and leaves values intact |
| compiler/codegen.ts:78 | delete statement | `` body += `${buffer}+='${text}';` `` → ` ; ` | killed: G-43: a comment after a multiline config removes the indentation before the config |
| compiler/codegen.ts:79 | predicate | ` trackIndent ` → ` !(trackIndent) ` | killed: G-32: metadata indentation accumulates only static text and consumes one adjacent newline |
| compiler/codegen.ts:79 | delete statement | ` body += '$$skipNewline=false;' ` → ` ; ` | killed: G-32: metadata indentation accumulates only static text and consumes one adjacent newline |
| compiler/codegen.ts:80 | predicate | ` trackIndent ` → ` !(trackIndent) ` | killed: G-32/P3: empty metadata removes static indentation across blocks and leaves values intact |
| compiler/codegen.ts:83 | predicate | ` literal.charCodeAt(literal.length - trailing - 1) === 32 &#124;&#124; literal.charCodeAt(literal.length - trailing - 1) === 9 ` → ` !(literal.charCodeAt(literal.length - trailing - 1) === 32 &#124;&#124; literal.charCodeAt(literal.length - trailing - 1) === 9) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:83 | operand | ` literal.charCodeAt(literal.length - trailing - 1) === 32 ` → ` false ` | killed: G-32/P3: empty metadata removes static indentation across blocks and leaves values intact |
| compiler/codegen.ts:83 | operand | ` literal.charCodeAt(literal.length - trailing - 1) === 9 ` → ` false ` | killed: G-32/P3: empty metadata removes static indentation across blocks and leaves values intact |
| compiler/codegen.ts:83 | predicate | ` literal.charCodeAt(literal.length - trailing - 1) === 32 ` → ` !(literal.charCodeAt(literal.length - trailing - 1) === 32) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:83 | predicate | ` literal.charCodeAt(literal.length - trailing - 1) === 9 ` → ` !(literal.charCodeAt(literal.length - trailing - 1) === 9) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:83 | delete statement | ` trailing++ ` → ` ; ` | killed: G-32/P3: empty metadata removes static indentation across blocks and leaves values intact |
| compiler/codegen.ts:84 | delete statement | `` body += trailing === literal.length ? `$$indent+=${trailing};` : `$$indent=${trailing};` `` → ` ; ` | killed: G-32/P3: empty metadata removes static indentation across blocks and leaves values intact |
| compiler/codegen.ts:84 | predicate | ` trailing === literal.length ` → ` !(trailing === literal.length) ` | killed: G-32: metadata indentation accumulates only static text and consumes one adjacent newline |
| compiler/codegen.ts:86 | predicate | ` open?.url ` → ` !(open?.url) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:86 | delete statement | `` body += `$$url.feed('${text}');` `` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:87 | predicate | ` open?.tag && strip ` → ` !(open?.tag && strip) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:87 | operand | ` open?.tag ` → ` true ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:87 | operand | ` strip ` → ` true ` | equivalent: With strip false no generated code initializes $$meta, so the additional guarded literal metadata mark is inert. |
| compiler/codegen.ts:87 | delete statement | ` body += 'if($$meta)$$meta.nonempty=true;' ` → ` ; ` | killed: G-40: literal metadata after an empty write keeps its tag |
| compiler/codegen.ts:89 | delete statement | ` from = to ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:92 | predicate | ` record.kind ` → ` !(record.kind) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:93 | case comparison | ` 'tag-open' ` → ` "__mutation_unreachable_case__" ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:94 | predicate | ` !record.dynamic &#124;&#124; !strip ` → ` !(!record.dynamic &#124;&#124; !strip) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:94 | operand | ` !record.dynamic ` → ` false ` | equivalent: A static tag capture has no dynamic target and cannot remove output; later live tags initialize their own captures. |
| compiler/codegen.ts:94 | operand | ` !strip ` → ` false ` | equivalent: With strip false target and close handling remain disabled, making the extra tag capture inert. |
| compiler/codegen.ts:94 | negation | ` !record.dynamic ` → ` record.dynamic ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:94 | negation | ` !strip ` → ` strip ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:95 | delete statement | ` literal(record.at) ` → ` ; ` | killed: real metadata boundaries: inert contexts, quoted angles, branches, snippets, partials and markers |
| compiler/codegen.ts:96 | delete statement | `` body += `$$tag={start:${buffer}.length-$$indent,target:null,current:null};` `` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:99 | case comparison | ` 'target' ` → ` "__mutation_unreachable_case__" ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:100 | predicate | ` !record.tag.dynamic &#124;&#124; !strip ` → ` !(!record.tag.dynamic &#124;&#124; !strip) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:100 | operand | ` !record.tag.dynamic ` → ` false ` | killed: G-32: metadata targets and animation element names remain distinct |
| compiler/codegen.ts:100 | operand | ` !strip ` → ` false ` | killed: real metadata boundaries: inert contexts, quoted angles, branches, snippets, partials and markers |
| compiler/codegen.ts:100 | negation | ` !record.tag.dynamic ` → ` record.tag.dynamic ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:100 | negation | ` !strip ` → ` strip ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:102 | delete statement | ` body += '$$tag.current=$$tag.target?null:($$tag.target={dynamic:false,nonempty:false});' ` → ` ; ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:104 | case comparison | ` 'value-open' ` → ` "__mutation_unreachable_case__" ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:105 | predicate | ` !live(record) ` → ` !(!live(record)) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:105 | negation | ` !live(record) ` → ` live(record) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:106 | delete statement | ` literal(record.at) ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:107 | delete statement | ` open = record ` → ` ; ` | killed: P3 10 (G-18): standalone comments go as on main, across text nodes, after <meta> and at the end |
| compiler/codegen.ts:108 | predicate | ` record.url ` → ` !(record.url) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:108 | delete statement | `` body += `$$url=new $$UrlPrefix('${record.url}');` `` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:109 | predicate | ` record.tag && strip ` → ` !(record.tag && strip) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:109 | operand | ` record.tag ` → ` true ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:109 | operand | ` strip ` → ` true ` | killed: real metadata boundaries: inert contexts, quoted angles, branches, snippets, partials and markers |
| compiler/codegen.ts:109 | delete statement | ` body += '$$meta=$$tag.current;' ` → ` ; ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:111 | case comparison | ` 'value-close' ` → ` "__mutation_unreachable_case__" ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:112 | predicate | ` !open ` → ` !(!open) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:112 | negation | ` !open ` → ` open ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:113 | delete statement | ` literal(record.at) ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:114 | predicate | ` open.url ` → ` !(open.url) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:114 | delete statement | ` body += '$$url.check($$url.checkpoints > 0);' ` → ` ; ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:114 | generated comparison 31 | ` '$$url.check($$url.checkpoints > 0);' ` → ` '$$url.check($$url.checkpoints <= 0);' ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/codegen.ts:115 | delete statement | ` open = null ` → ` ; ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:117 | case comparison | ` 'tag-close' ` → ` "__mutation_unreachable_case__" ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:118 | predicate | ` !record.tag.dynamic &#124;&#124; !strip ` → ` !(!record.tag.dynamic &#124;&#124; !strip) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:118 | operand | ` !record.tag.dynamic ` → ` false ` | killed: G-32: metadata targets and animation element names remain distinct |
| compiler/codegen.ts:118 | operand | ` !strip ` → ` false ` | killed: real metadata boundaries: inert contexts, quoted angles, branches, snippets, partials and markers |
| compiler/codegen.ts:118 | negation | ` !record.tag.dynamic ` → ` record.tag.dynamic ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:118 | negation | ` !strip ` → ` strip ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:119 | delete statement | ` literal(record.at) ` → ` ; ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:121 | predicate | ` value.startsWith('\r\n', from) ` → ` !(value.startsWith('\r\n', from)) ` | killed: G-32/P3: empty metadata removes static indentation across blocks and leaves values intact |
| compiler/codegen.ts:121 | predicate | ` value.startsWith('\n', from) ` → ` !(value.startsWith('\n', from)) ` | killed: G-32/P3: empty metadata removes static indentation across blocks and leaves values intact |
| compiler/codegen.ts:122 | delete statement | `` body += `if($$tag.target?.dynamic&&!$$tag.target.nonempty){${buffer}=${buffer}.slice(0,$$tag.start);$$skipNewline=${newline.length === 0};}else{${buffer}+='${escapeJs(newline)}';$$skipNewline=false;}$$tag=null;` `` → ` ; ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:122 | generated operand 4 | `` `if($$tag.target?.dynamic&&!$$tag.target.nonempty){${ `` → `` `if(true&&!$$tag.target.nonempty){${ `` | killed: real metadata boundaries: inert contexts, quoted angles, branches, snippets, partials and markers |
| compiler/codegen.ts:122 | generated operand 27 | `` `if($$tag.target?.dynamic&&!$$tag.target.nonempty){${ `` → `` `if($$tag.target?.dynamic&&true){${ `` | killed: a value with the marks of stripEmptyMeta > leaves a meta element without a value to be removed, as before |
| compiler/codegen.ts:122 | predicate | ` newline.length === 0 ` → ` !(newline.length === 0) ` | killed: G-32/P3: empty metadata removes static indentation across blocks and leaves values intact |
| compiler/codegen.ts:123 | delete statement | ` from += newline.length ` → ` ; ` | killed: real metadata boundaries: inert contexts, quoted angles, branches, snippets, partials and markers |
| compiler/codegen.ts:128 | delete statement | ` literal(value.length) ` → ` ; ` | killed: G-43: a comment after a multiline config removes the indentation before the config |
| compiler/codegen.ts:144 | boolean | ` true ` → ` false ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:144 | negation | ` !node.raw ` → ` node.raw ` | killed: G-4 raw references and raw quote breakout stays outside the boundary |
| compiler/codegen.ts:175 | case comparison | ` 'snippet' ` → ` "__mutation_unreachable_case__" ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:178 | delete statement | `` body += `function ${variant.name}(${node.param ?? '$$unused'},$$url,$$meta){let ${snippetBuffer}='',$$tag=null,$$indent=0,$$skipNewline=false;` `` → ` ; ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:178 | drop generated declaration ,$$tag=null | `` }='',$$tag=null,$$indent=0,$$skipNewline=false;` `` → `` }='',$$indent=0,$$skipNewline=false;` `` | killed: G-16/G-18: JS-discarded data snippets keep metadata captures local |
| compiler/codegen.ts:178 | drop generated declaration ,$$indent=0 | `` }='',$$tag=null,$$indent=0,$$skipNewline=false;` `` → `` }='',$$tag=null,$$skipNewline=false;` `` | killed: G-40: removable metadata at the start of a snippet owns its indentation |
| compiler/codegen.ts:178 | drop generated declaration ,$$skipNewline=false | `` }='',$$tag=null,$$indent=0,$$skipNewline=false;` `` → `` }='',$$tag=null,$$indent=0;` `` | killed: G-40: snippets own the pending metadata newline flag |
| compiler/codegen.ts:179 | delete statement | ` emitNodes(variant.children, scope, snippetBuffer, node.param ? [node.param] : []) ` → ` ; ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/codegen.ts:179 | predicate | ` node.param ` → ` !(node.param) ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/codegen.ts:180 | delete statement | `` body += `return ${snippetBuffer};}` `` → ` ; ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:183 | predicate | ` node.js ` → ` !(node.js) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:183 | delete statement | `` body += `function ${node.name}(v){return ${node.js}(v);}` `` → ` ; ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:186 | case comparison | ` 'render' ` → ` "__mutation_unreachable_case__" ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/codegen.ts:190 | predicate | ` node.slot?.url ` → ` !(node.slot?.url) ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/codegen.ts:190 | delete statement | `` body += `{const ${checkpoint}=$$url.checkpoints;` `` → ` ; ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/codegen.ts:191 | delete statement | ` body += '{' ` → ` ; ` | killed: G-41: local names stay in their lexical scope without copying all visible names |
| compiler/codegen.ts:192 | delete statement | `` body += `const ${value}=${node.specialization ?? node.name}(${node.argument ? expressionCode(node.argument, scope) : 'undefined'},$$url,$$meta);` `` → ` ; ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/codegen.ts:192 | predicate | ` node.argument ` → ` !(node.argument) ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/codegen.ts:193 | delete statement | `` body += `${written(node.slot, value, false, false, `$$url.checkpoints!==${checkpoint}`)}${buffer}+=${value};${trackIndent ? '$$indent=0;$$skipNewline=false;' : ''}}` `` → ` ; ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/codegen.ts:193 | boolean | ` false ` → ` true ` | killed: G-32/G-36: cached suffix and write summaries apply to every caller value |
| compiler/codegen.ts:193 | boolean | ` false ` → ` true ` | equivalent: The escaped argument is unused when feed is false for a snippet that already fed its bytes. |
| compiler/codegen.ts:193 | generated comparison 18 | `` `$$url.checkpoints!==${ `` → `` `$$url.checkpoints===${ `` | killed: G-34/G-36: static-only snippets stay static; actual writes propagate through calls and cycles |
| compiler/codegen.ts:193 | predicate | ` trackIndent ` → ` !(trackIndent) ` | killed: G-32: metadata indentation accumulates only static text and consumes one adjacent newline |
| compiler/codegen.ts:196 | case comparison | ` 'js' ` → ` "__mutation_unreachable_case__" ` | killed: G-32/P3: JS inside a partial marks visible snippets and keeps the lexer line flag |
| compiler/codegen.ts:197 | delete statement | `` body += `{const $$j=$$str(${node.awaits ? `await (async()=>{${node.code}})()` : `(()=>{${node.code}})()`});` `` → ` ; ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:197 | predicate | ` node.awaits ` → ` !(node.awaits) ` | killed: P1 4 (G-16): {@js} calls the variant of a snippet for ordinary content, whatever was rendered first |
| compiler/codegen.ts:198 | delete statement | `` body += `${written(node.slot, '$$j', true)}${buffer}+=$$j;${trackIndent ? '$$indent=0;$$skipNewline=false;' : ''}}` `` → ` ; ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/codegen.ts:198 | boolean | ` true ` → ` false ` | killed: recursion, specialization, lexical bindings and JS retain their names and isolated buffers |
| compiler/codegen.ts:198 | predicate | ` trackIndent ` → ` !(trackIndent) ` | killed: G-32: metadata indentation accumulates only static text and consumes one adjacent newline |
| compiler/lexer.ts:88 | predicate | ` text.startsWith('{@js}', cursor) ` → ` !(text.startsWith('{@js}', cursor)) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/lexer.ts:90 | predicate | ` close < 0 ` → ` !(close < 0) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/lexer.ts:90 | delete statement | ` cursor++; ` → ` ; ` | killed: G-40: an unmatched JS delimiter advances as literal text |
| compiler/lexer.ts:91 | delete statement | ` pushText(cursor) ` → ` ; ` | killed: G-32: metadata indentation accumulates only static text and consumes one adjacent newline |
| compiler/lexer.ts:93 | delete statement | ` tokens.push({ kind: 'js', value: text.slice(cursor + 5, close), valueStart: cursor + 5, span: span(source, cursor, end) }) ` → ` ; ` | killed: G-32/P3: JS inside a partial marks visible snippets and keeps the lexer line flag |
| compiler/lexer.ts:94 | delete statement | ` cursor = end; ` → ` ; ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/lexer.ts:94 | delete statement | ` textStart = end; ` → ` ; ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/lexer.ts:94 | delete statement | ` lineIsWhitespace = false; ` → ` ; ` | killed: G-32/P3: JS inside a partial marks visible snippets and keeps the lexer line flag |
| compiler/lexer.ts:94 | boolean | ` false ` → ` true ` | killed: G-32/P3: JS inside a partial marks visible snippets and keeps the lexer line flag |
| compiler/index.ts:45 | boolean | ` false ` → ` true ` | killed: G-28: strip removes trailing static spaces only from the final root text |
| compiler/index.ts:46 | predicate | ` node.kind === 'text' ` → ` !(node.kind === 'text') ` | killed: G-32: static metadata, slot flags, strip boundaries and empty each paths are pinned |
| compiler/index.ts:46 | drop returned value | ` stripText(node, root && index === nodes.length - 1) ` → ` undefined ` | killed: G-32: static metadata, slot flags, strip boundaries and empty each paths are pinned |
| compiler/index.ts:46 | operand | ` root ` → ` true ` | killed: G-28: strip removes trailing static spaces only from the final root text |
| compiler/index.ts:46 | operand | ` index === nodes.length - 1 ` → ` true ` | killed: G-32: static metadata, slot flags, strip boundaries and empty each paths are pinned |
| compiler/index.ts:46 | predicate | ` index === nodes.length - 1 ` → ` !(index === nodes.length - 1) ` | killed: G-32: static metadata, slot flags, strip boundaries and empty each paths are pinned |
| compiler/index.ts:47 | predicate | ` node.kind === 'if' ` → ` !(node.kind === 'if') ` | killed: G-32: static metadata, slot flags, strip boundaries and empty each paths are pinned |
| compiler/index.ts:47 | drop returned value | ` { ...node, branches: node.branches.map(branch => ({ ...branch, children: stripStatic(branch.children) })) } ` → ` undefined ` | killed: G-32: static metadata, slot flags, strip boundaries and empty each paths are pinned |
| compiler/index.ts:48 | predicate | ` node.kind === 'each' &#124;&#124; node.kind === 'snippet' ` → ` !(node.kind === 'each' &#124;&#124; node.kind === 'snippet') ` | killed: G-32: static metadata, slot flags, strip boundaries and empty each paths are pinned |
| compiler/index.ts:48 | operand | ` node.kind === 'each' ` → ` false ` | killed: G-32: each exit delimiters, strip traversal and nonempty metadata are pinned |
| compiler/index.ts:48 | operand | ` node.kind === 'snippet' ` → ` false ` | killed: G-32: each exit delimiters, strip traversal and nonempty metadata are pinned |
| compiler/index.ts:48 | predicate | ` node.kind === 'each' ` → ` !(node.kind === 'each') ` | killed: G-32: static metadata, slot flags, strip boundaries and empty each paths are pinned |
| compiler/index.ts:48 | predicate | ` node.kind === 'snippet' ` → ` !(node.kind === 'snippet') ` | killed: G-32: static metadata, slot flags, strip boundaries and empty each paths are pinned |
| compiler/index.ts:48 | drop returned value | ` { ...node, children: stripStatic(node.children) } ` → ` undefined ` | killed: G-32: each exit delimiters, strip traversal and nonempty metadata are pinned |
| compiler/index.ts:49 | predicate | ` node.kind === 'partial' ` → ` !(node.kind === 'partial') ` | killed: G-32: each exit delimiters, strip traversal and nonempty metadata are pinned |
| compiler/index.ts:49 | drop returned value | ` { ...node, children: stripStatic(node.children ?? []) } ` → ` undefined ` | killed: G-32: each exit delimiters, strip traversal and nonempty metadata are pinned |
| compiler/index.ts:50 | drop returned value | ` node ` → ` undefined ` | killed: G-32: static metadata, slot flags, strip boundaries and empty each paths are pinned |
| compiler/index.ts:58 | predicate | ` options.includes ` → ` !(options.includes) ` | killed: G-40: reserved names diagnose declarations and partial declarations share their enclosing scope |
| compiler/index.ts:59 | delete statement | ` diagnostics.push(...lintAst(ast, options)) ` → ` ; ` | killed: compiler boundary diagnostics and independent existing helper branches |
| compiler/index.ts:60 | predicate | ` !diagnostics.some(item => item.severity === 'error') ` → ` !(!diagnostics.some(item => item.severity === 'error')) ` | killed: G-40: reserved names diagnose declarations and partial declarations share their enclosing scope |
| compiler/index.ts:60 | negation | ` !diagnostics.some(item => item.severity === 'error') ` → ` diagnostics.some(item => item.severity === 'error') ` | killed: G-40: reserved names diagnose declarations and partial declarations share their enclosing scope |
| compiler/index.ts:60 | predicate | ` item.severity === 'error' ` → ` !(item.severity === 'error') ` | killed: G-40: reserved names diagnose declarations and partial declarations share their enclosing scope |
| compiler/index.ts:61 | predicate | ` options.strip ` → ` !(options.strip) ` | killed: G-35: lint always returns a Promise; partials preserve context without a resolver |
| compiler/index.ts:61 | boolean | ` true ` → ` false ` | equivalent: In lint's temporary AST, the root flag only removes trailing static whitespace after >. It cannot change HTML context or refusal positions, and lint never returns rendered text. Compilation still uses the root flag for output. |
| compiler/index.ts:62 | delete statement | ` readContexts(prepared) ` → ` ; ` | killed: G-40/P3: rule 14 requires a dynamic write, including through snippets |
| compiler/index.ts:65 | predicate | ` !(error instanceof GalleyDiagnosticError) ` → ` !(!(error instanceof GalleyDiagnosticError)) ` | killed: compiler boundary diagnostics and independent existing helper branches |
| compiler/index.ts:65 | negation | ` !(error instanceof GalleyDiagnosticError) ` → ` (error instanceof GalleyDiagnosticError) ` | killed: compiler boundary diagnostics and independent existing helper branches |
| compiler/index.ts:66 | delete statement | ` diagnostics.push(error.diagnostic) ` → ` ; ` | killed: compiler boundary diagnostics and independent existing helper branches |
| compiler/index.ts:68 | drop returned value | ` diagnostics ` → ` undefined ` | killed: compiler boundary diagnostics and independent existing helper branches |
| compiler/index.ts:80 | predicate | ` options.allowCode === true ` → ` !(options.allowCode === true) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/index.ts:80 | boolean | ` true ` → ` false ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/index.ts:81 | predicate | ` options.knownFilters ` → ` !(options.knownFilters) ` | killed: AST compiler baseline > compile options pass known filters into diagnostics |
| compiler/index.ts:83 | predicate | ` diagnostic.severity === 'error' ` → ` !(diagnostic.severity === 'error') ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/index.ts:84 | predicate | ` fatal ` → ` !(fatal) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/index.ts:85 | predicate | ` options.strip ` → ` !(options.strip) ` | killed: G-43: a comment after a multiline config removes the indentation before the config |
| compiler/index.ts:85 | boolean | ` true ` → ` false ` | killed: G-28: strip removes trailing static spaces only from the final root text |
| compiler/index.ts:87 | predicate | ` program.async ` → ` !(program.async) ` | killed: G-40: compile and lint preserve async flags and debug output |
| compiler/index.ts:89 | drop returned value | ` { async: true, diagnostics, render, ...(options.debug ? { source: program.body } : {}) } ` → ` undefined ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/index.ts:89 | boolean | ` true ` → ` false ` | killed: G-40: compile and lint preserve async flags and debug output |
| compiler/index.ts:89 | predicate | ` options.debug ` → ` !(options.debug) ` | killed: G-40: compile and lint preserve async flags and debug output |
| compiler/index.ts:92 | drop returned value | ` { async: false, diagnostics, render, ...(options.debug ? { source: program.body } : {}) } ` → ` undefined ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/index.ts:92 | boolean | ` false ` → ` true ` | killed: G-40: compile and lint preserve async flags and debug output |
| compiler/index.ts:92 | predicate | ` options.debug ` → ` !(options.debug) ` | killed: G-36: literal scheme completions checkpoint attribute ends, including static snippets |
| compiler/lint.ts:5 | set 'String' | ` ['String', 'Object', 'Array', 'TypeError'] ` → ` ['Object', 'Array', 'TypeError'] ` | killed: what a template may not do to the generated code > a snippet or a constant may not take a global the generated code calls |
| compiler/lint.ts:5 | set 'Object' | ` ['String', 'Object', 'Array', 'TypeError'] ` → ` ['String', 'Array', 'TypeError'] ` | killed: what a template may not do to the generated code > a snippet or a constant may not take a global the generated code calls |
| compiler/lint.ts:5 | set 'Array' | ` ['String', 'Object', 'Array', 'TypeError'] ` → ` ['String', 'Object', 'TypeError'] ` | killed: what a template may not do to the generated code > a snippet or a constant may not take a global the generated code calls |
| compiler/lint.ts:5 | set 'TypeError' | ` ['String', 'Object', 'Array', 'TypeError'] ` → ` ['String', 'Object', 'Array'] ` | killed: what a template may not do to the generated code > a snippet or a constant may not take a global the generated code calls |
| compiler/lint.ts:17 | predicate | ` expr.kind === 'pipe' ` → ` !(expr.kind === 'pipe') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/lint.ts:19 | predicate | ` options.knownFilters && !options.knownFilters.has(pipe.name) ` → ` !(options.knownFilters && !options.knownFilters.has(pipe.name)) ` | killed: G-40: lint visits filter arguments and declaration expressions |
| compiler/lint.ts:19 | operand | ` options.knownFilters ` → ` true ` | killed: G-6 shared conversion for filters and outputs, with debug warnings and restoration |
| compiler/lint.ts:19 | operand | ` !options.knownFilters.has(pipe.name) ` → ` true ` | killed: G-40: lint visits filter arguments and declaration expressions |
| compiler/lint.ts:19 | negation | ` !options.knownFilters.has(pipe.name) ` → ` options.knownFilters.has(pipe.name) ` | killed: G-40: lint visits filter arguments and declaration expressions |
| compiler/lint.ts:19 | delete statement | `` report({ code: 'G3001', severity: 'warning', message: `Unknown pipe ${JSON.stringify(pipe.name)}`, span: pipe.span, help: 'Check the spelling or add the custom filter to knownFilters.' }) `` → ` ; ` | killed: G-40: lint visits filter arguments and declaration expressions |
| compiler/lint.ts:20 | delete statement | ` expression(arg) ` → ` ; ` | killed: G-40: lint visits filter arguments and declaration expressions |
| compiler/lint.ts:25 | predicate | ` current ` → ` !(current) ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/lint.ts:27 | predicate | ` snippet ` → ` !(snippet) ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/lint.ts:27 | drop returned value | ` snippet ` → ` undefined ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/lint.ts:31 | boolean | ` false ` → ` true ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/lint.ts:32 | predicate | ` sameScope ` → ` !(sameScope) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/lint.ts:35 | predicate | ` node.kind === 'partial' && node.children ` → ` !(node.kind === 'partial' && node.children) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/lint.ts:35 | operand | ` node.kind === 'partial' ` → ` true ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/lint.ts:35 | operand | ` node.children ` → ` true ` | killed: G-35: lint always returns a Promise; partials preserve context without a resolver |
| compiler/lint.ts:35 | predicate | ` node.kind === 'partial' ` → ` !(node.kind === 'partial') ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/lint.ts:35 | delete statement | ` declare(node.children); ` → ` ; ` | killed: DOCTYPE abrupt greater-than follows the browser; partial declarations retain lexical scope |
| compiler/lint.ts:36 | predicate | ` node.kind !== 'snippet' ` → ` !(node.kind !== 'snippet') ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/lint.ts:37 | delete statement | ` declarations.add(node) ` → ` ; ` | killed: G-40: lint resolves snippets through partial scopes and suppresses duplicate unused warnings |
| compiler/lint.ts:38 | predicate | ` local.has(node.name) ` → ` !(local.has(node.name)) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/lint.ts:39 | delete statement | ` duplicate.add(node) ` → ` ; ` | killed: G-40: lint resolves snippets through partial scopes and suppresses duplicate unused warnings |
| compiler/lint.ts:40 | delete statement | `` report({ code: 'G3003', severity: 'error', message: `Duplicate snippet ${JSON.stringify(node.name)} in the same block`, span: node.span, help: 'Rename one snippet or move it to a different lexical block.' }) `` → ` ; ` | killed: compiler boundary diagnostics and independent existing helper branches |
| compiler/lint.ts:41 | delete statement | ` local.set(node.name, node) ` → ` ; ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/lint.ts:44 | predicate | ` !sameScope ` → ` !(!sameScope) ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/lint.ts:44 | negation | ` !sameScope ` → ` sameScope ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/lint.ts:44 | delete statement | ` declare(nodes) ` → ` ; ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/lint.ts:45 | predicate | ` sameScope ` → ` !(sameScope) ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/lint.ts:47 | predicate | ` (node.kind === 'const' &#124;&#124; node.kind === 'snippet') && GENERATED_GLOBALS.has(node.name) ` → ` !((node.kind === 'const' &#124;&#124; node.kind === 'snippet') && GENERATED_GLOBALS.has(node.name)) ` | killed: G-42: a URL that is also a metadata target receives its end check |
| compiler/lint.ts:47 | operand | ` (node.kind === 'const' &#124;&#124; node.kind === 'snippet') ` → ` true ` | killed: G-40: reserved names diagnose declarations and partial declarations share their enclosing scope |
| compiler/lint.ts:47 | operand | ` GENERATED_GLOBALS.has(node.name) ` → ` true ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/lint.ts:47 | operand | ` node.kind === 'const' ` → ` false ` | killed: what a template may not do to the generated code > a snippet or a constant may not take a global the generated code calls |
| compiler/lint.ts:47 | operand | ` node.kind === 'snippet' ` → ` false ` | killed: what a template may not do to the generated code > a snippet or a constant may not take a global the generated code calls |
| compiler/lint.ts:47 | predicate | ` node.kind === 'const' ` → ` !(node.kind === 'const') ` | killed: what a template may not do to the generated code > a snippet or a constant may not take a global the generated code calls |
| compiler/lint.ts:47 | predicate | ` node.kind === 'snippet' ` → ` !(node.kind === 'snippet') ` | killed: what a template may not do to the generated code > a snippet or a constant may not take a global the generated code calls |
| compiler/lint.ts:47 | delete statement | `` report({ code: 'G3007', severity: 'error', message: `The name ${node.name} is needed by the generated code`, span: node.span }) `` → ` ; ` | killed: what a template may not do to the generated code > a snippet or a constant may not take a global the generated code calls |
| compiler/lint.ts:48 | predicate | ` node.kind ` → ` !(node.kind) ` | killed: G-40: lint visits filter arguments and declaration expressions |
| compiler/lint.ts:49 | case comparison | ` 'output' ` → ` "__mutation_unreachable_case__" ` | killed: G-40: lint visits filter arguments and declaration expressions |
| compiler/lint.ts:49 | delete statement | ` expression(node.expression); ` → ` ; ` | killed: G-40: lint visits filter arguments and declaration expressions |
| compiler/lint.ts:49 | predicate | ` node.raw ` → ` !(node.raw) ` | killed: G-40: lint visits filter arguments and declaration expressions |
| compiler/lint.ts:49 | delete statement | ` report({ code: 'G3002', severity: 'info', message: 'Raw output bypasses HTML escaping', span: node.span, help: 'Use raw output only for trusted HTML.' }); ` → ` ; ` | killed: P3 11 (G-18): lint keeps its warnings beside a context error, and reads contexts around a partial |
| compiler/lint.ts:50 | case comparison | ` 'const' ` → ` "__mutation_unreachable_case__" ` | killed: G-40: lint visits filter arguments and declaration expressions |
| compiler/lint.ts:50 | delete statement | ` expression(node.expression); ` → ` ; ` | killed: G-40: lint visits filter arguments and declaration expressions |
| compiler/lint.ts:51 | case comparison | ` 'if' ` → ` "__mutation_unreachable_case__" ` | killed: G-40: lint visits filter arguments and declaration expressions |
| compiler/lint.ts:51 | predicate | ` branch.condition ` → ` !(branch.condition) ` | killed: G-38: finished prefixes with no nonempty dynamic write render static fallbacks |
| compiler/lint.ts:51 | delete statement | ` expression(branch.condition); ` → ` ; ` | killed: G-40: lint visits filter arguments and declaration expressions |
| compiler/lint.ts:51 | delete statement | ` visit(branch.children, scope) ` → ` ; ` | killed: G-40/P3: lint and compile agree on generated global names |
| compiler/lint.ts:52 | case comparison | ` 'each' ` → ` "__mutation_unreachable_case__" ` | killed: G-40: lint visits filter arguments and declaration expressions |
| compiler/lint.ts:52 | delete statement | ` visit(node.children, scope); ` → ` ; ` | killed: G-40: lint visits filter arguments and declaration expressions |
| compiler/lint.ts:53 | case comparison | ` 'partial' ` → ` "__mutation_unreachable_case__" ` | killed: G-40: lint resolves snippets through partial scopes and suppresses duplicate unused warnings |
| compiler/lint.ts:53 | predicate | ` node.children ` → ` !(node.children) ` | killed: G-40: lint resolves snippets through partial scopes and suppresses duplicate unused warnings |
| compiler/lint.ts:53 | delete statement | ` visit(node.children, scope, true); ` → ` ; ` | killed: G-40: lint resolves snippets through partial scopes and suppresses duplicate unused warnings |
| compiler/lint.ts:53 | boolean | ` true ` → ` false ` | killed: G-40: reserved names diagnose declarations and partial declarations share their enclosing scope |
| compiler/lint.ts:54 | case comparison | ` 'snippet' ` → ` "__mutation_unreachable_case__" ` | killed: G-40: lint visits filter arguments and declaration expressions |
| compiler/lint.ts:54 | delete statement | ` visit(node.children, scope); ` → ` ; ` | killed: G-40: lint visits filter arguments and declaration expressions |
| compiler/lint.ts:55 | case comparison | ` 'render' ` → ` "__mutation_unreachable_case__" ` | killed: G-40: lint visits filter arguments and declaration expressions |
| compiler/lint.ts:57 | predicate | ` snippet ` → ` !(snippet) ` | killed: G-37: finished URL prefixes stop snippet cycles and character-reference colons |
| compiler/lint.ts:57 | delete statement | ` used.add(snippet) ` → ` ; ` | killed: G-40: lint visits filter arguments and declaration expressions |
| compiler/lint.ts:58 | delete statement | `` report({ code: 'G3005', severity: 'error', message: `Snippet ${JSON.stringify(node.name)} is not visible in this block`, span: node.span, help: 'Declare the snippet in this block or an enclosing block before rendering it.' }) `` → ` ; ` | killed: G-40: reserved names diagnose declarations and partial declarations share their enclosing scope |
| compiler/lint.ts:59 | predicate | ` node.argument ` → ` !(node.argument) ` | killed: G-36: literal scheme completions checkpoint attribute ends, including static snippets |
| compiler/lint.ts:59 | delete statement | ` expression(node.argument) ` → ` ; ` | killed: G-40: lint visits filter arguments and declaration expressions |
| compiler/lint.ts:62 | case comparison | ` 'js' ` → ` "__mutation_unreachable_case__" ` | killed: G-26: lint resolves partials before the same context and strip checks as galley |
| compiler/lint.ts:62 | predicate | ` !options.allowCode ` → ` !(!options.allowCode) ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/lint.ts:62 | negation | ` !options.allowCode ` → ` options.allowCode ` | killed: G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix |
| compiler/lint.ts:62 | delete statement | ` report({ code: 'G3004', severity: 'error', message: '{@js} requires allowCode: true', span: node.span }); ` → ` ; ` | killed: G-26: lint resolves partials before the same context and strip checks as galley |
| compiler/lint.ts:66 | delete statement | ` visit(ast.children, null) ` → ` ; ` | killed: what a template may not do to the generated code > a snippet or a constant may not take a global the generated code calls |
| compiler/lint.ts:67 | predicate | ` !used.has(node) && !duplicate.has(node) ` → ` !(!used.has(node) && !duplicate.has(node)) ` | killed: G-40: lint visits filter arguments and declaration expressions |
| compiler/lint.ts:67 | operand | ` !used.has(node) ` → ` true ` | killed: G-40: lint visits filter arguments and declaration expressions |
| compiler/lint.ts:67 | operand | ` !duplicate.has(node) ` → ` true ` | killed: G-40: lint resolves snippets through partial scopes and suppresses duplicate unused warnings |
| compiler/lint.ts:67 | negation | ` !used.has(node) ` → ` used.has(node) ` | killed: G-40: lint visits filter arguments and declaration expressions |
| compiler/lint.ts:67 | negation | ` !duplicate.has(node) ` → ` duplicate.has(node) ` | killed: G-40: reserved names diagnose declarations and partial declarations share their enclosing scope |
| compiler/lint.ts:67 | delete statement | `` report({ code: 'G3006', severity: 'warning', message: `Snippet ${JSON.stringify(node.name)} is never rendered`, span: node.span }) `` → ` ; ` | killed: G-40: lint resolves snippets through partial scopes and suppresses duplicate unused warnings |
| compiler/lint.ts:68 | drop returned value | ` diagnostics ` → ` undefined ` | killed: G-42: a URL that is also a metadata target receives its end check |

1078 generated; 1059 killed; 19 equivalent; 0 unreviewed survivors.

Mutation inputs SHA-256: c350dd8ee4b33de98e04bafdc86252b09e7d4ba0b64b939b910adc3dfb72263b
