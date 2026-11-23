# Mechanical reader and URL mutations

| Location | Kind | Before → after | Result / reason |
|---|---|---|---|
| compiler/context.ts:7 | class "A" | ` /[A-Z]/g ` → ` /[BCDEFGHIJKLMNOPQRSTUVWXYZ]/g ` | killed |
| compiler/context.ts:7 | class "B" | ` /[A-Z]/g ` → ` /[ACDEFGHIJKLMNOPQRSTUVWXYZ]/g ` | killed |
| compiler/context.ts:7 | class "C" | ` /[A-Z]/g ` → ` /[ABDEFGHIJKLMNOPQRSTUVWXYZ]/g ` | killed |
| compiler/context.ts:7 | class "D" | ` /[A-Z]/g ` → ` /[ABCEFGHIJKLMNOPQRSTUVWXYZ]/g ` | killed |
| compiler/context.ts:7 | class "E" | ` /[A-Z]/g ` → ` /[ABCDFGHIJKLMNOPQRSTUVWXYZ]/g ` | killed |
| compiler/context.ts:7 | class "F" | ` /[A-Z]/g ` → ` /[ABCDEGHIJKLMNOPQRSTUVWXYZ]/g ` | killed |
| compiler/context.ts:7 | class "G" | ` /[A-Z]/g ` → ` /[ABCDEFHIJKLMNOPQRSTUVWXYZ]/g ` | killed |
| compiler/context.ts:7 | class "H" | ` /[A-Z]/g ` → ` /[ABCDEFGIJKLMNOPQRSTUVWXYZ]/g ` | killed |
| compiler/context.ts:7 | class "I" | ` /[A-Z]/g ` → ` /[ABCDEFGHJKLMNOPQRSTUVWXYZ]/g ` | killed |
| compiler/context.ts:7 | class "J" | ` /[A-Z]/g ` → ` /[ABCDEFGHIKLMNOPQRSTUVWXYZ]/g ` | killed |
| compiler/context.ts:7 | class "K" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJLMNOPQRSTUVWXYZ]/g ` | killed |
| compiler/context.ts:7 | class "L" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKMNOPQRSTUVWXYZ]/g ` | killed |
| compiler/context.ts:7 | class "M" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKLNOPQRSTUVWXYZ]/g ` | killed |
| compiler/context.ts:7 | class "N" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKLMOPQRSTUVWXYZ]/g ` | killed |
| compiler/context.ts:7 | class "O" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKLMNPQRSTUVWXYZ]/g ` | killed |
| compiler/context.ts:7 | class "P" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKLMNOQRSTUVWXYZ]/g ` | killed |
| compiler/context.ts:7 | class "Q" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKLMNOPRSTUVWXYZ]/g ` | killed |
| compiler/context.ts:7 | class "R" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKLMNOPQSTUVWXYZ]/g ` | killed |
| compiler/context.ts:7 | class "S" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKLMNOPQRTUVWXYZ]/g ` | killed |
| compiler/context.ts:7 | class "T" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKLMNOPQRSUVWXYZ]/g ` | killed |
| compiler/context.ts:7 | class "U" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKLMNOPQRSTVWXYZ]/g ` | killed |
| compiler/context.ts:7 | class "V" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKLMNOPQRSTUWXYZ]/g ` | killed |
| compiler/context.ts:7 | class "W" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKLMNOPQRSTUVXYZ]/g ` | killed |
| compiler/context.ts:7 | class "X" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKLMNOPQRSTUVWYZ]/g ` | killed |
| compiler/context.ts:7 | class "Y" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKLMNOPQRSTUVWXZ]/g ` | killed |
| compiler/context.ts:7 | class "Z" | ` /[A-Z]/g ` → ` /[ABCDEFGHIJKLMNOPQRSTUVWXY]/g ` | killed |
| compiler/context.ts:8 | class "\\t" | ` /[\t\n\f\r ]/ ` → ` /[\n\f\r ]/ ` | killed |
| compiler/context.ts:8 | class "\\n" | ` /[\t\n\f\r ]/ ` → ` /[\t\f\r ]/ ` | killed |
| compiler/context.ts:8 | class "\\f" | ` /[\t\n\f\r ]/ ` → ` /[\t\n\r ]/ ` | killed |
| compiler/context.ts:8 | class "\\r" | ` /[\t\n\f\r ]/ ` → ` /[\t\n\f ]/ ` | killed |
| compiler/context.ts:8 | class " " | ` /[\t\n\f\r ]/ ` → ` /[\t\n\f\r]/ ` | killed |
| compiler/context.ts:9 | set 'href' | ` ['href', 'src', 'action', 'formaction', 'poster', 'cite', 'xlink:href'] ` → ` ['src', 'action', 'formaction', 'poster', 'cite', 'xlink:href'] ` | killed |
| compiler/context.ts:9 | set 'src' | ` ['href', 'src', 'action', 'formaction', 'poster', 'cite', 'xlink:href'] ` → ` ['href', 'action', 'formaction', 'poster', 'cite', 'xlink:href'] ` | killed |
| compiler/context.ts:9 | set 'action' | ` ['href', 'src', 'action', 'formaction', 'poster', 'cite', 'xlink:href'] ` → ` ['href', 'src', 'formaction', 'poster', 'cite', 'xlink:href'] ` | killed |
| compiler/context.ts:9 | set 'formaction' | ` ['href', 'src', 'action', 'formaction', 'poster', 'cite', 'xlink:href'] ` → ` ['href', 'src', 'action', 'poster', 'cite', 'xlink:href'] ` | killed |
| compiler/context.ts:9 | set 'poster' | ` ['href', 'src', 'action', 'formaction', 'poster', 'cite', 'xlink:href'] ` → ` ['href', 'src', 'action', 'formaction', 'cite', 'xlink:href'] ` | killed |
| compiler/context.ts:9 | set 'cite' | ` ['href', 'src', 'action', 'formaction', 'poster', 'cite', 'xlink:href'] ` → ` ['href', 'src', 'action', 'formaction', 'poster', 'xlink:href'] ` | killed |
| compiler/context.ts:9 | set 'xlink:href' | ` ['href', 'src', 'action', 'formaction', 'poster', 'cite', 'xlink:href'] ` → ` ['href', 'src', 'action', 'formaction', 'poster', 'cite'] ` | killed |
| compiler/context.ts:10 | set 'set' | ` ['set', 'animate', 'animatemotion', 'animatetransform'] ` → ` ['animate', 'animatemotion', 'animatetransform'] ` | killed |
| compiler/context.ts:10 | set 'animate' | ` ['set', 'animate', 'animatemotion', 'animatetransform'] ` → ` ['set', 'animatemotion', 'animatetransform'] ` | killed |
| compiler/context.ts:10 | set 'animatemotion' | ` ['set', 'animate', 'animatemotion', 'animatetransform'] ` → ` ['set', 'animate', 'animatetransform'] ` | killed |
| compiler/context.ts:10 | set 'animatetransform' | ` ['set', 'animate', 'animatemotion', 'animatetransform'] ` → ` ['set', 'animate', 'animatemotion'] ` | killed |
| compiler/context.ts:11 | set 'to' | ` ['to', 'from', 'by', 'values'] ` → ` ['from', 'by', 'values'] ` | killed |
| compiler/context.ts:11 | set 'from' | ` ['to', 'from', 'by', 'values'] ` → ` ['to', 'by', 'values'] ` | killed |
| compiler/context.ts:11 | set 'by' | ` ['to', 'from', 'by', 'values'] ` → ` ['to', 'from', 'values'] ` | killed |
| compiler/context.ts:11 | set 'values' | ` ['to', 'from', 'by', 'values'] ` → ` ['to', 'from', 'by'] ` | killed |
| compiler/context.ts:12 | set 'script' | ` ['script', 'style', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript'] ` → ` ['style', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript'] ` | killed |
| compiler/context.ts:12 | set 'style' | ` ['script', 'style', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript'] ` → ` ['script', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript'] ` | killed |
| compiler/context.ts:12 | set 'title' | ` ['script', 'style', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript'] ` → ` ['script', 'style', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript'] ` | killed |
| compiler/context.ts:12 | set 'textarea' | ` ['script', 'style', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript'] ` → ` ['script', 'style', 'title', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript'] ` | killed |
| compiler/context.ts:12 | set 'xmp' | ` ['script', 'style', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript'] ` → ` ['script', 'style', 'title', 'textarea', 'iframe', 'noembed', 'noframes', 'noscript'] ` | killed |
| compiler/context.ts:12 | set 'iframe' | ` ['script', 'style', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript'] ` → ` ['script', 'style', 'title', 'textarea', 'xmp', 'noembed', 'noframes', 'noscript'] ` | killed |
| compiler/context.ts:12 | set 'noembed' | ` ['script', 'style', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript'] ` → ` ['script', 'style', 'title', 'textarea', 'xmp', 'iframe', 'noframes', 'noscript'] ` | killed |
| compiler/context.ts:12 | set 'noframes' | ` ['script', 'style', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript'] ` → ` ['script', 'style', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noscript'] ` | killed |
| compiler/context.ts:12 | set 'noscript' | ` ['script', 'style', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript'] ` → ` ['script', 'style', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes'] ` | killed |
| compiler/context.ts:13 | set 'foreignobject' | ` ['foreignobject', 'desc', 'mi', 'mo', 'mn', 'ms', 'mtext', 'annotation-xml'] ` → ` ['desc', 'mi', 'mo', 'mn', 'ms', 'mtext', 'annotation-xml'] ` | killed |
| compiler/context.ts:13 | set 'desc' | ` ['foreignobject', 'desc', 'mi', 'mo', 'mn', 'ms', 'mtext', 'annotation-xml'] ` → ` ['foreignobject', 'mi', 'mo', 'mn', 'ms', 'mtext', 'annotation-xml'] ` | killed |
| compiler/context.ts:13 | set 'mi' | ` ['foreignobject', 'desc', 'mi', 'mo', 'mn', 'ms', 'mtext', 'annotation-xml'] ` → ` ['foreignobject', 'desc', 'mo', 'mn', 'ms', 'mtext', 'annotation-xml'] ` | killed |
| compiler/context.ts:13 | set 'mo' | ` ['foreignobject', 'desc', 'mi', 'mo', 'mn', 'ms', 'mtext', 'annotation-xml'] ` → ` ['foreignobject', 'desc', 'mi', 'mn', 'ms', 'mtext', 'annotation-xml'] ` | killed |
| compiler/context.ts:13 | set 'mn' | ` ['foreignobject', 'desc', 'mi', 'mo', 'mn', 'ms', 'mtext', 'annotation-xml'] ` → ` ['foreignobject', 'desc', 'mi', 'mo', 'ms', 'mtext', 'annotation-xml'] ` | killed |
| compiler/context.ts:13 | set 'ms' | ` ['foreignobject', 'desc', 'mi', 'mo', 'mn', 'ms', 'mtext', 'annotation-xml'] ` → ` ['foreignobject', 'desc', 'mi', 'mo', 'mn', 'mtext', 'annotation-xml'] ` | killed |
| compiler/context.ts:13 | set 'mtext' | ` ['foreignobject', 'desc', 'mi', 'mo', 'mn', 'ms', 'mtext', 'annotation-xml'] ` → ` ['foreignobject', 'desc', 'mi', 'mo', 'mn', 'ms', 'annotation-xml'] ` | killed |
| compiler/context.ts:13 | set 'annotation-xml' | ` ['foreignobject', 'desc', 'mi', 'mo', 'mn', 'ms', 'mtext', 'annotation-xml'] ` → ` ['foreignobject', 'desc', 'mi', 'mo', 'mn', 'ms', 'mtext'] ` | killed |
| compiler/context.ts:14 | predicate | ` text.length > 80 ` → ` !(text.length > 80) ` | killed |
| compiler/context.ts:15 | operand | ` (tag === 'meta' && attribute === 'content') ` → ` false ` | killed |
| compiler/context.ts:15 | operand | ` (tag === 'link' && attribute === 'href') ` → ` false ` | killed |
| compiler/context.ts:15 | operand | ` tag === 'meta' ` → ` true ` | killed |
| compiler/context.ts:15 | operand | ` attribute === 'content' ` → ` true ` | killed |
| compiler/context.ts:15 | predicate | ` tag === 'meta' ` → ` !(tag === 'meta') ` | killed |
| compiler/context.ts:15 | predicate | ` attribute === 'content' ` → ` !(attribute === 'content') ` | killed |
| compiler/context.ts:15 | operand | ` tag === 'link' ` → ` true ` | killed |
| compiler/context.ts:15 | operand | ` attribute === 'href' ` → ` true ` | killed |
| compiler/context.ts:15 | predicate | ` tag === 'link' ` → ` !(tag === 'link') ` | killed |
| compiler/context.ts:15 | predicate | ` attribute === 'href' ` → ` !(attribute === 'href') ` | killed |
| compiler/context.ts:28 | predicate | ` typeof at === 'function' ` → ` !(typeof at === 'function') ` | killed |
| compiler/context.ts:41 | boolean | ` false ` → ` true ` | equivalent: Delimited is unused in data; every start tag initializes it before attribute reading. |
| compiler/context.ts:41 | boolean | ` false ` → ` true ` | killed |
| compiler/context.ts:42 | operand | ` a.owner === b.owner && a.svg === b.svg && a.math === b.math && a.template === b.template && a.tagId === b.tagId ` → ` true ` | killed |
| compiler/context.ts:42 | operand | ` a.quote === b.quote ` → ` true ` | killed |
| compiler/context.ts:42 | operand | ` a.owner === b.owner && a.svg === b.svg && a.math === b.math && a.template === b.template ` → ` true ` | killed |
| compiler/context.ts:42 | operand | ` a.tagId === b.tagId ` → ` true ` | killed |
| compiler/context.ts:42 | operand | ` a.owner === b.owner && a.svg === b.svg && a.math === b.math ` → ` true ` | killed |
| compiler/context.ts:42 | operand | ` a.template === b.template ` → ` true ` | killed |
| compiler/context.ts:42 | operand | ` a.owner === b.owner && a.svg === b.svg ` → ` true ` | killed |
| compiler/context.ts:42 | operand | ` a.math === b.math ` → ` true ` | killed |
| compiler/context.ts:42 | operand | ` a.owner === b.owner ` → ` true ` | killed |
| compiler/context.ts:42 | operand | ` a.svg === b.svg ` → ` true ` | killed |
| compiler/context.ts:42 | predicate | ` a.owner === b.owner ` → ` !(a.owner === b.owner) ` | killed |
| compiler/context.ts:42 | predicate | ` a.svg === b.svg ` → ` !(a.svg === b.svg) ` | killed |
| compiler/context.ts:42 | predicate | ` a.math === b.math ` → ` !(a.math === b.math) ` | killed |
| compiler/context.ts:42 | predicate | ` a.template === b.template ` → ` !(a.template === b.template) ` | killed |
| compiler/context.ts:42 | predicate | ` a.tagId === b.tagId ` → ` !(a.tagId === b.tagId) ` | killed |
| compiler/context.ts:42 | predicate | ` a.quote === b.quote ` → ` !(a.quote === b.quote) ` | killed |
| compiler/context.ts:43 | operand | ` context.tag ` → ` false ` | killed |
| compiler/context.ts:43 | operand | ` context.owner ` → ` false ` | killed |
| compiler/context.ts:43 | predicate | ` context.attribute ` → ` !(context.attribute) ` | killed |
| compiler/context.ts:46 | predicate | ` (context.state === 'double' &#124;&#124; context.state === 'single' &#124;&#124; context.state === 'before-value')   && ANIMATION_ELEMENTS.has(context.tag) && ANIMATION_VALUES.has(context.attribute) ` → ` !((context.state === 'double' &#124;&#124; context.state === 'single' &#124;&#124; context.state === 'before-value')   && ANIMATION_ELEMENTS.has(context.tag) && ANIMATION_VALUES.has(context.attribute)) ` | killed |
| compiler/context.ts:46 | operand | ` (context.state === 'double' &#124;&#124; context.state === 'single' &#124;&#124; context.state === 'before-value')   && ANIMATION_ELEMENTS.has(context.tag) ` → ` true ` | killed |
| compiler/context.ts:47 | operand | ` ANIMATION_VALUES.has(context.attribute) ` → ` true ` | killed |
| compiler/context.ts:46 | operand | ` (context.state === 'double' &#124;&#124; context.state === 'single' &#124;&#124; context.state === 'before-value') ` → ` true ` | killed |
| compiler/context.ts:47 | operand | ` ANIMATION_ELEMENTS.has(context.tag) ` → ` true ` | killed |
| compiler/context.ts:46 | operand | ` context.state === 'double' &#124;&#124; context.state === 'single' ` → ` false ` | killed |
| compiler/context.ts:46 | operand | ` context.state === 'before-value' ` → ` false ` | killed |
| compiler/context.ts:46 | operand | ` context.state === 'double' ` → ` false ` | killed |
| compiler/context.ts:46 | operand | ` context.state === 'single' ` → ` false ` | killed |
| compiler/context.ts:46 | predicate | ` context.state === 'double' ` → ` !(context.state === 'double') ` | killed |
| compiler/context.ts:46 | predicate | ` context.state === 'single' ` → ` !(context.state === 'single') ` | killed |
| compiler/context.ts:46 | predicate | ` context.state === 'before-value' ` → ` !(context.state === 'before-value') ` | killed |
| compiler/context.ts:49 | delete statement | ` refuse('G3016', where, context, '15', where.source.text.slice(where.start, where.end)) ` → ` ; ` | killed |
| compiler/context.ts:67 | predicate | ` tag === 'select' &#124;&#124; tag === 'frameset' &#124;&#124; tag === 'plaintext' &#124;&#124; (tag === 'col' && context.template > 0) ` → ` !(tag === 'select' &#124;&#124; tag === 'frameset' &#124;&#124; tag === 'plaintext' &#124;&#124; (tag === 'col' && context.template > 0)) ` | killed |
| compiler/context.ts:67 | operand | ` tag === 'select' &#124;&#124; tag === 'frameset' &#124;&#124; tag === 'plaintext' ` → ` false ` | killed |
| compiler/context.ts:67 | operand | ` (tag === 'col' && context.template > 0) ` → ` false ` | killed |
| compiler/context.ts:67 | operand | ` tag === 'select' &#124;&#124; tag === 'frameset' ` → ` false ` | killed |
| compiler/context.ts:67 | operand | ` tag === 'plaintext' ` → ` false ` | killed |
| compiler/context.ts:67 | operand | ` tag === 'select' ` → ` false ` | killed |
| compiler/context.ts:67 | operand | ` tag === 'frameset' ` → ` false ` | killed |
| compiler/context.ts:67 | predicate | ` tag === 'select' ` → ` !(tag === 'select') ` | killed |
| compiler/context.ts:67 | predicate | ` tag === 'frameset' ` → ` !(tag === 'frameset') ` | killed |
| compiler/context.ts:67 | predicate | ` tag === 'plaintext' ` → ` !(tag === 'plaintext') ` | killed |
| compiler/context.ts:67 | operand | ` tag === 'col' ` → ` true ` | killed |
| compiler/context.ts:67 | operand | ` context.template > 0 ` → ` true ` | killed |
| compiler/context.ts:67 | predicate | ` tag === 'col' ` → ` !(tag === 'col') ` | killed |
| compiler/context.ts:67 | predicate | ` context.template > 0 ` → ` !(context.template > 0) ` | killed |
| compiler/context.ts:67 | delete statement | ` refuse('G3013', at, context, '9', tag) ` → ` ; ` | killed |
| compiler/context.ts:69 | predicate | ` tag === 'template' ` → ` !(tag === 'template') ` | killed |
| compiler/context.ts:69 | delete statement | ` context.template++ ` → ` ; ` | killed |
| compiler/context.ts:70 | predicate | ` (tag === 'svg' &#124;&#124; tag === 'math') && !selfClosing ` → ` !((tag === 'svg' &#124;&#124; tag === 'math') && !selfClosing) ` | killed |
| compiler/context.ts:70 | operand | ` (tag === 'svg' &#124;&#124; tag === 'math') ` → ` true ` | killed |
| compiler/context.ts:70 | operand | ` !selfClosing ` → ` true ` | killed |
| compiler/context.ts:70 | operand | ` tag === 'svg' ` → ` false ` | killed |
| compiler/context.ts:70 | operand | ` tag === 'math' ` → ` false ` | killed |
| compiler/context.ts:70 | predicate | ` tag === 'svg' ` → ` !(tag === 'svg') ` | killed |
| compiler/context.ts:70 | predicate | ` tag === 'math' ` → ` !(tag === 'math') ` | killed |
| compiler/context.ts:70 | negation | ` !selfClosing ` → ` selfClosing ` | killed |
| compiler/context.ts:70 | delete statement | ` context[tag]++ ` → ` ; ` | killed |
| compiler/context.ts:71 | predicate | ` context.svg + context.math > 0 ` → ` !(context.svg + context.math > 0) ` | killed |
| compiler/context.ts:72 | operand | ` TEXT_ELEMENTS.has(tag) ` → ` false ` | killed |
| compiler/context.ts:72 | operand | ` (foreign && INTEGRATION.has(tag)) ` → ` false ` | killed |
| compiler/context.ts:72 | operand | ` foreign ` → ` true ` | killed |
| compiler/context.ts:72 | operand | ` INTEGRATION.has(tag) ` → ` true ` | killed |
| compiler/context.ts:73 | predicate | ` TEXT_ELEMENTS.has(tag) && selfClosing ` → ` !(TEXT_ELEMENTS.has(tag) && selfClosing) ` | killed |
| compiler/context.ts:73 | operand | ` TEXT_ELEMENTS.has(tag) ` → ` true ` | killed |
| compiler/context.ts:73 | operand | ` selfClosing ` → ` true ` | killed |
| compiler/context.ts:73 | delete statement | ` refuse('G3013', at, context, '5', tag) ` → ` ; ` | killed |
| compiler/context.ts:74 | delete statement | ` Object.assign(context, { state: 'data', tag: '', attribute: '', delimited: false, tagId: 0, quote: 0, tagAt: null, capture: null }) ` → ` ; ` | killed |
| compiler/context.ts:74 | boolean | ` false ` → ` true ` | equivalent: Delimited is unused after a completed tag; the next start tag initializes it. |
| compiler/context.ts:75 | predicate | ` text && !selfClosing ` → ` !(text && !selfClosing) ` | killed |
| compiler/context.ts:75 | operand | ` text ` → ` true ` | killed |
| compiler/context.ts:75 | operand | ` !selfClosing ` → ` true ` | killed |
| compiler/context.ts:75 | negation | ` !selfClosing ` → ` selfClosing ` | killed |
| compiler/context.ts:75 | delete statement | ` Object.assign(context, { state: 'text', owner: tag, strict: foreign }) ` → ` ; ` | killed |
| compiler/context.ts:78 | class "A" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([BCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "B" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ACDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "C" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "D" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "E" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "F" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "G" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "H" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "I" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "J" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "K" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "L" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "M" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "N" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "O" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "P" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "Q" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "R" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "S" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "T" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "U" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "V" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "W" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "X" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "Y" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "Z" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "a" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZbcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "b" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZacdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "c" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "d" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "e" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdfghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "f" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "g" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefhijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "h" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "i" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghjklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "j" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "k" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijlmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "l" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "m" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklnopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "n" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmopqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "o" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnpqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "p" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnoqrstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "q" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnoprstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "r" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqstuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "s" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrtuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "t" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrsuvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "u" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstvwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "v" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuwxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "w" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvxyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "x" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwyz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "y" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxz][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "z" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxy][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "\\t" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([A-Za-z][^\n\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "\\n" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([A-Za-z][^\t\f\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "\\f" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([A-Za-z][^\t\n\r \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "\\r" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([A-Za-z][^\t\n\f \/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class " " | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([A-Za-z][^\t\n\f\r\/>]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "\\/" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([A-Za-z][^\t\n\f\r >]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class ">" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([A-Za-z][^\t\n\f\r \/]*)[\t\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "\\t" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\n\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "\\n" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\f\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "\\f" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\r ]*>/ ` | killed |
| compiler/context.ts:78 | class "\\r" | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f ]*>/ ` | killed |
| compiler/context.ts:78 | class " " | ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/ ` → ` /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r]*>/ ` | killed |
| compiler/context.ts:79 | predicate | `` !match &#124;&#124; /[<"'=`\0]/.test(match[1]!) `` → `` !(!match &#124;&#124; /[<"'=`\0]/.test(match[1]!)) `` | killed |
| compiler/context.ts:79 | operand | ` !match ` → ` false ` | killed |
| compiler/context.ts:79 | operand | `` /[<"'=`\0]/.test(match[1]!) `` → ` false ` | killed |
| compiler/context.ts:79 | negation | ` !match ` → ` match ` | killed |
| compiler/context.ts:79 | class "<" | `` /[<"'=`\0]/ `` → `` /["'=`\0]/ `` | killed |
| compiler/context.ts:79 | class "\"" | `` /[<"'=`\0]/ `` → `` /[<'=`\0]/ `` | killed |
| compiler/context.ts:79 | class "'" | `` /[<"'=`\0]/ `` → `` /[<"=`\0]/ `` | killed |
| compiler/context.ts:79 | class "=" | `` /[<"'=`\0]/ `` → `` /[<"'`\0]/ `` | killed |
| compiler/context.ts:79 | class "`" | `` /[<"'=`\0]/ `` → ` /[<"'=\0]/ ` | killed |
| compiler/context.ts:79 | class "\\0" | `` /[<"'=`\0]/ `` → `` /[<"'=`]/ `` | killed |
| compiler/context.ts:79 | drop returned value | ` refuse('G3014', where, context, '6', value.slice(at)) ` → ` undefined ` | killed |
| compiler/context.ts:81 | predicate | ` name === 'svg' &#124;&#124; name === 'math' &#124;&#124; name === 'template' ` → ` !(name === 'svg' &#124;&#124; name === 'math' &#124;&#124; name === 'template') ` | killed |
| compiler/context.ts:81 | operand | ` name === 'svg' &#124;&#124; name === 'math' ` → ` false ` | killed |
| compiler/context.ts:81 | operand | ` name === 'template' ` → ` false ` | killed |
| compiler/context.ts:81 | operand | ` name === 'svg' ` → ` false ` | killed |
| compiler/context.ts:81 | operand | ` name === 'math' ` → ` false ` | killed |
| compiler/context.ts:81 | predicate | ` name === 'svg' ` → ` !(name === 'svg') ` | killed |
| compiler/context.ts:81 | predicate | ` name === 'math' ` → ` !(name === 'math') ` | killed |
| compiler/context.ts:81 | predicate | ` name === 'template' ` → ` !(name === 'template') ` | killed |
| compiler/context.ts:81 | delete statement | ` context[name] = Math.max(0, context[name] - 1) ` → ` ; ` | killed |
| compiler/context.ts:81 | remove clamp | ` Math.max(0, context[name] - 1) ` → ` context[name] - 1 ` | killed |
| compiler/context.ts:82 | drop returned value | ` at + match[0].length ` → ` undefined ` | killed |
| compiler/context.ts:90 | predicate | ` index < value.length ` → ` !(index < value.length) ` | killed |
| compiler/context.ts:92 | predicate | ` context.state ` → ` !(context.state) ` | killed |
| compiler/context.ts:93 | case comparison | ` 'data' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/context.ts:95 | predicate | ` less < 0 ` → ` !(less < 0) ` | killed |
| compiler/context.ts:95 | delete statement | ` index = value.length; ` → ` ; ` | killed |
| compiler/context.ts:97 | predicate | ` rest.startsWith('<!--') ` → ` !(rest.startsWith('<!--')) ` | killed |
| compiler/context.ts:99 | predicate | ` close < 0 ` → ` !(close < 0) ` | killed |
| compiler/context.ts:100 | predicate | ` value.startsWith('>', body) &#124;&#124; value.startsWith('->', body) &#124;&#124; bang ` → ` !(value.startsWith('>', body) &#124;&#124; value.startsWith('->', body) &#124;&#124; bang) ` | killed |
| compiler/context.ts:100 | operand | ` value.startsWith('>', body) &#124;&#124; value.startsWith('->', body) ` → ` false ` | killed |
| compiler/context.ts:100 | operand | ` bang ` → ` false ` | killed |
| compiler/context.ts:100 | operand | ` value.startsWith('>', body) ` → ` false ` | killed |
| compiler/context.ts:100 | operand | ` value.startsWith('->', body) ` → ` false ` | killed |
| compiler/context.ts:100 | delete statement | ` refuse('G3014', at(less), context, '7', rest) ` → ` ; ` | killed |
| compiler/context.ts:101 | predicate | ` close < 0 ` → ` !(close < 0) ` | killed |
| compiler/context.ts:101 | delete statement | ` refuse(tagFollows ? 'G3013' : 'G3014', at(less), context, '7', rest) ` → ` ; ` | killed |
| compiler/context.ts:101 | predicate | ` tagFollows ` → ` !(tagFollows) ` | killed |
| compiler/context.ts:102 | delete statement | ` index = close + 3 ` → ` ; ` | killed |
| compiler/context.ts:103 | predicate | ` /^<!doctype[\t\n\f\r ]/i.test(rest) ` → ` !(/^<!doctype[\t\n\f\r ]/i.test(rest)) ` | killed |
| compiler/context.ts:103 | class "\\t" | ` /^<!doctype[\t\n\f\r ]/i ` → ` /^<!doctype[\n\f\r ]/i ` | killed |
| compiler/context.ts:103 | class "\\n" | ` /^<!doctype[\t\n\f\r ]/i ` → ` /^<!doctype[\t\f\r ]/i ` | killed |
| compiler/context.ts:103 | class "\\f" | ` /^<!doctype[\t\n\f\r ]/i ` → ` /^<!doctype[\t\n\r ]/i ` | killed |
| compiler/context.ts:103 | class "\\r" | ` /^<!doctype[\t\n\f\r ]/i ` → ` /^<!doctype[\t\n\f ]/i ` | killed |
| compiler/context.ts:103 | class " " | ` /^<!doctype[\t\n\f\r ]/i ` → ` /^<!doctype[\t\n\f\r]/i ` | killed |
| compiler/context.ts:104 | class "<" | ` /^![^<>]*>/ ` → ` /^![^>]*>/ ` | killed |
| compiler/context.ts:104 | class ">" | ` /^![^<>]*>/ ` → ` /^![^<]*>/ ` | equivalent: Greedily consuming additional > characters in DOCTYPE can consume only ordinary data, since < remains excluded. |
| compiler/context.ts:105 | predicate | ` !close ` → ` !(!close) ` | killed |
| compiler/context.ts:105 | negation | ` !close ` → ` close ` | killed |
| compiler/context.ts:105 | delete statement | ` refuse(tagFollows ? 'G3013' : 'G3014', at(less), context, '7', rest) ` → ` ; ` | killed |
| compiler/context.ts:105 | predicate | ` tagFollows ` → ` !(tagFollows) ` | killed |
| compiler/context.ts:106 | delete statement | ` index = less + 1 + close![0].length ` → ` ; ` | killed |
| compiler/context.ts:107 | predicate | ` rest.startsWith('</') ` → ` !(rest.startsWith('</')) ` | killed |
| compiler/context.ts:107 | delete statement | ` index = endTag(value, less, context, () => at(less)) ` → ` ; ` | killed |
| compiler/context.ts:109 | class "A" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([BCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "B" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ACDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "C" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "D" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "E" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "F" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "G" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "H" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "I" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "J" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "K" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "L" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "M" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "N" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "O" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "P" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOQRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "Q" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPRSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "R" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQSTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "S" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRTUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "T" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSUVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "U" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTVWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "V" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUWXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "W" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "X" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWYZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "Y" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "Z" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYabcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "a" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZbcdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "b" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZacdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "c" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabdefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "d" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcefghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "e" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdfghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "f" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "g" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefhijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "h" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgijklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "i" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghjklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "j" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "k" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijlmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "l" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "m" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklnopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "n" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmopqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "o" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnpqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "p" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnoqrstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "q" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnoprstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "r" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqstuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "s" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrtuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "t" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrsuvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "u" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstvwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "v" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuwxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "w" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvxyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "x" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwyz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "y" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxz][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "z" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxy][^\t\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "\\t" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([A-Za-z][^\n\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "\\n" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([A-Za-z][^\t\f\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "\\f" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([A-Za-z][^\t\n\r \/>]*)/ ` | killed |
| compiler/context.ts:109 | class "\\r" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([A-Za-z][^\t\n\f \/>]*)/ ` | killed |
| compiler/context.ts:109 | class " " | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([A-Za-z][^\t\n\f\r\/>]*)/ ` | killed |
| compiler/context.ts:109 | class "\\/" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([A-Za-z][^\t\n\f\r >]*)/ ` | killed |
| compiler/context.ts:109 | class ">" | ` /^<([A-Za-z][^\t\n\f\r \/>]*)/ ` → ` /^<([A-Za-z][^\t\n\f\r \/]*)/ ` | killed |
| compiler/context.ts:110 | predicate | `` !name &#124;&#124; /[<"'=`\0]/.test(name[1]!) `` → `` !(!name &#124;&#124; /[<"'=`\0]/.test(name[1]!)) `` | killed |
| compiler/context.ts:110 | operand | ` !name ` → ` false ` | killed |
| compiler/context.ts:110 | operand | `` /[<"'=`\0]/.test(name[1]!) `` → ` false ` | killed |
| compiler/context.ts:110 | negation | ` !name ` → ` name ` | killed |
| compiler/context.ts:110 | class "<" | `` /[<"'=`\0]/ `` → `` /["'=`\0]/ `` | killed |
| compiler/context.ts:110 | class "\"" | `` /[<"'=`\0]/ `` → `` /[<'=`\0]/ `` | killed |
| compiler/context.ts:110 | class "'" | `` /[<"'=`\0]/ `` → `` /[<"=`\0]/ `` | killed |
| compiler/context.ts:110 | class "=" | `` /[<"'=`\0]/ `` → `` /[<"'`\0]/ `` | killed |
| compiler/context.ts:110 | class "`" | `` /[<"'=`\0]/ `` → ` /[<"'=\0]/ ` | killed |
| compiler/context.ts:110 | class "\\0" | `` /[<"'=`\0]/ `` → `` /[<"'=`]/ `` | killed |
| compiler/context.ts:110 | drop returned value | ` refuse('G3014', at(less), context, '1/2', rest) ` → ` undefined ` | killed |
| compiler/context.ts:111 | delete statement | ` Object.assign(context, { state: 'tag', tag: asciiLower(name[1]!), attribute: '', delimited: false, tagId: ++identity, tagAt: () => at(less) }) ` → ` ; ` | killed |
| compiler/context.ts:111 | boolean | ` false ` → ` true ` | killed |
| compiler/context.ts:112 | predicate | ` context.tag === 'meta' &#124;&#124; context.tag === 'link' ` → ` !(context.tag === 'meta' &#124;&#124; context.tag === 'link') ` | killed |
| compiler/context.ts:112 | operand | ` context.tag === 'meta' ` → ` false ` | killed |
| compiler/context.ts:112 | operand | ` context.tag === 'link' ` → ` false ` | killed |
| compiler/context.ts:112 | predicate | ` context.tag === 'meta' ` → ` !(context.tag === 'meta') ` | killed |
| compiler/context.ts:112 | predicate | ` context.tag === 'link' ` → ` !(context.tag === 'link') ` | killed |
| compiler/context.ts:113 | delete statement | ` context.capture = { kind: 'tag-open', at: less, dynamic: false } ` → ` ; ` | killed |
| compiler/context.ts:113 | boolean | ` false ` → ` true ` | equivalent: An unused static tag capture has no dynamic target, so it cannot remove output. |
| compiler/context.ts:114 | delete statement | ` records.push(context.capture) ` → ` ; ` | killed |
| compiler/context.ts:116 | delete statement | ` index = less + name[0].length ` → ` ; ` | killed |
| compiler/context.ts:120 | case comparison | ` 'tag' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/context.ts:121 | predicate | ` SPACE.test(char) ` → ` !(SPACE.test(char)) ` | killed |
| compiler/context.ts:121 | delete statement | ` context.delimited = true; ` → ` ; ` | killed |
| compiler/context.ts:121 | boolean | ` true ` → ` false ` | killed |
| compiler/context.ts:121 | delete statement | ` index++; ` → ` ; ` | killed |
| compiler/context.ts:122 | predicate | ` char === '>' &#124;&#124; value.startsWith('/>', index) ` → ` !(char === '>' &#124;&#124; value.startsWith('/>', index)) ` | killed |
| compiler/context.ts:122 | operand | ` char === '>' ` → ` false ` | killed |
| compiler/context.ts:122 | operand | ` value.startsWith('/>', index) ` → ` false ` | killed |
| compiler/context.ts:122 | predicate | ` char === '>' ` → ` !(char === '>') ` | killed |
| compiler/context.ts:123 | delete statement | ` index += char === '>' ? 1 : 2 ` → ` ; ` | killed |
| compiler/context.ts:123 | predicate | ` char === '>' ` → ` !(char === '>') ` | killed |
| compiler/context.ts:124 | predicate | ` context.capture ` → ` !(context.capture) ` | killed |
| compiler/context.ts:124 | delete statement | ` records.push({ kind: 'tag-close', at: index, tag: context.capture }) ` → ` ; ` | killed |
| compiler/context.ts:125 | delete statement | ` finishTag(context, char !== '>') ` → ` ; ` | killed |
| compiler/context.ts:125 | predicate | ` char !== '>' ` → ` !(char !== '>') ` | killed |
| compiler/context.ts:128 | predicate | ` char === '/' &#124;&#124; char === '=' &#124;&#124; !context.delimited ` → ` !(char === '/' &#124;&#124; char === '=' &#124;&#124; !context.delimited) ` | killed |
| compiler/context.ts:128 | operand | ` char === '/' &#124;&#124; char === '=' ` → ` false ` | killed |
| compiler/context.ts:128 | operand | ` !context.delimited ` → ` false ` | killed |
| compiler/context.ts:128 | operand | ` char === '/' ` → ` false ` | killed |
| compiler/context.ts:128 | operand | ` char === '=' ` → ` false ` | killed |
| compiler/context.ts:128 | predicate | ` char === '/' ` → ` !(char === '/') ` | killed |
| compiler/context.ts:128 | predicate | ` char === '=' ` → ` !(char === '=') ` | killed |
| compiler/context.ts:128 | negation | ` !context.delimited ` → ` context.delimited ` | killed |
| compiler/context.ts:128 | delete statement | ` refuse('G3014', at(index), context, '3/5', value.slice(index)) ` → ` ; ` | killed |
| compiler/context.ts:129 | class "\\t" | ` /^[^\t\n\f\r \/>=]+/ ` → ` /^[^\n\f\r \/>=]+/ ` | killed |
| compiler/context.ts:129 | class "\\n" | ` /^[^\t\n\f\r \/>=]+/ ` → ` /^[^\t\f\r \/>=]+/ ` | killed |
| compiler/context.ts:129 | class "\\f" | ` /^[^\t\n\f\r \/>=]+/ ` → ` /^[^\t\n\r \/>=]+/ ` | killed |
| compiler/context.ts:129 | class "\\r" | ` /^[^\t\n\f\r \/>=]+/ ` → ` /^[^\t\n\f \/>=]+/ ` | killed |
| compiler/context.ts:129 | class " " | ` /^[^\t\n\f\r \/>=]+/ ` → ` /^[^\t\n\f\r\/>=]+/ ` | killed |
| compiler/context.ts:129 | class "\\/" | ` /^[^\t\n\f\r \/>=]+/ ` → ` /^[^\t\n\f\r >=]+/ ` | killed |
| compiler/context.ts:129 | class ">" | ` /^[^\t\n\f\r \/>=]+/ ` → ` /^[^\t\n\f\r \/=]+/ ` | killed |
| compiler/context.ts:129 | class "=" | ` /^[^\t\n\f\r \/>=]+/ ` → ` /^[^\t\n\f\r \/>]+/ ` | killed |
| compiler/context.ts:130 | predicate | `` /["'<`\0]/.test(name) `` → `` !(/["'<`\0]/.test(name)) `` | killed |
| compiler/context.ts:130 | class "\"" | `` /["'<`\0]/ `` → `` /['<`\0]/ `` | killed |
| compiler/context.ts:130 | class "'" | `` /["'<`\0]/ `` → `` /["<`\0]/ `` | killed |
| compiler/context.ts:130 | class "<" | `` /["'<`\0]/ `` → `` /["'`\0]/ `` | killed |
| compiler/context.ts:130 | class "`" | `` /["'<`\0]/ `` → ` /["'<\0]/ ` | killed |
| compiler/context.ts:130 | class "\\0" | `` /["'<`\0]/ `` → `` /["'<`]/ `` | killed |
| compiler/context.ts:130 | delete statement | ` refuse('G3014', at(index), context, '3', name) ` → ` ; ` | killed |
| compiler/context.ts:131 | delete statement | ` context.attribute = asciiLower(name) ` → ` ; ` | killed |
| compiler/context.ts:132 | delete statement | ` context.delimited = false ` → ` ; ` | killed |
| compiler/context.ts:132 | boolean | ` false ` → ` true ` | killed |
| compiler/context.ts:133 | delete statement | ` index += name.length ` → ` ; ` | killed |
| compiler/context.ts:134 | predicate | ` isTarget(context.tag, context.attribute) ` → ` !(isTarget(context.tag, context.attribute)) ` | killed |
| compiler/context.ts:134 | delete statement | ` records.push({ kind: 'target', at: index, tag: context.capture! }) ` → ` ; ` | killed |
| compiler/context.ts:135 | predicate | ` value[index] === '=' ` → ` !(value[index] === '=') ` | killed |
| compiler/context.ts:135 | delete statement | ` context.state = 'before-value'; ` → ` ; ` | killed |
| compiler/context.ts:135 | delete statement | ` index++ ` → ` ; ` | killed |
| compiler/context.ts:136 | predicate | ` SPACE.test(value[index]!) ` → ` !(SPACE.test(value[index]!)) ` | killed |
| compiler/context.ts:136 | delete statement | ` context.state = 'after-name' ` → ` ; ` | killed |
| compiler/context.ts:139 | case comparison | ` 'after-name' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/context.ts:140 | predicate | ` SPACE.test(char) ` → ` !(SPACE.test(char)) ` | killed |
| compiler/context.ts:140 | delete statement | ` index++; ` → ` ; ` | killed |
| compiler/context.ts:141 | predicate | ` char === '=' ` → ` !(char === '=') ` | killed |
| compiler/context.ts:141 | delete statement | ` context.state = 'before-value'; ` → ` ; ` | killed |
| compiler/context.ts:141 | delete statement | ` index++ ` → ` ; ` | killed |
| compiler/context.ts:142 | delete statement | ` Object.assign(context, { state: 'tag', delimited: true, attribute: '' }) ` → ` ; ` | killed |
| compiler/context.ts:142 | boolean | ` true ` → ` false ` | killed |
| compiler/context.ts:144 | case comparison | ` 'before-value' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/context.ts:145 | predicate | ` SPACE.test(char) ` → ` !(SPACE.test(char)) ` | killed |
| compiler/context.ts:145 | delete statement | ` index++; ` → ` ; ` | killed |
| compiler/context.ts:146 | predicate | ` char === '"' &#124;&#124; char === "'" ` → ` !(char === '"' &#124;&#124; char === "'") ` | killed |
| compiler/context.ts:146 | operand | ` char === '"' ` → ` false ` | killed |
| compiler/context.ts:146 | operand | ` char === "'" ` → ` false ` | killed |
| compiler/context.ts:146 | predicate | ` char === '"' ` → ` !(char === '"') ` | killed |
| compiler/context.ts:146 | predicate | ` char === "'" ` → ` !(char === "'") ` | killed |
| compiler/context.ts:147 | delete statement | ` context.state = char === '"' ? 'double' : 'single'; ` → ` ; ` | killed |
| compiler/context.ts:147 | predicate | ` char === '"' ` → ` !(char === '"') ` | killed |
| compiler/context.ts:147 | delete statement | ` context.quote = ++identity; ` → ` ; ` | killed |
| compiler/context.ts:147 | delete statement | ` index++ ` → ` ; ` | killed |
| compiler/context.ts:148 | predicate | ` value.indexOf(char, index) < 0 ` → ` !(value.indexOf(char, index) < 0) ` | killed |
| compiler/context.ts:150 | predicate | ` URL_ATTRIBUTES.has(context.attribute) ` → ` !(URL_ATTRIBUTES.has(context.attribute)) ` | killed |
| compiler/context.ts:152 | delete statement | ` prefix?.feed(ampersand < 0 ? startText : startText.slice(0, ampersand)) ` → ` ; ` | killed |
| compiler/context.ts:152 | predicate | ` ampersand < 0 ` → ` !(ampersand < 0) ` | killed |
| compiler/context.ts:153 | predicate | ` prefix && !prefix.settled ` → ` !(prefix && !prefix.settled) ` | killed |
| compiler/context.ts:153 | operand | ` prefix ` → ` true ` | killed |
| compiler/context.ts:153 | operand | ` !prefix.settled ` → ` true ` | killed |
| compiler/context.ts:153 | negation | ` !prefix.settled ` → ` prefix.settled ` | killed |
| compiler/context.ts:154 | predicate | ` isTarget(context.tag, context.attribute) ` → ` !(isTarget(context.tag, context.attribute)) ` | killed |
| compiler/context.ts:155 | predicate | ` url !== null &#124;&#124; tag ` → ` !(url !== null &#124;&#124; tag) ` | killed |
| compiler/context.ts:155 | operand | ` url !== null ` → ` false ` | killed |
| compiler/context.ts:155 | operand | ` tag ` → ` false ` | killed |
| compiler/context.ts:155 | predicate | ` url !== null ` → ` !(url !== null) ` | killed |
| compiler/context.ts:155 | delete statement | ` context.open = { kind: 'value-open', at: index, url, tag, dynamic: false }; ` → ` ; ` | killed |
| compiler/context.ts:155 | boolean | ` false ` → ` true ` | killed |
| compiler/context.ts:155 | delete statement | ` records.push(context.open) ` → ` ; ` | killed |
| compiler/context.ts:156 | predicate | ` prefix && !prefix.settled && (prefix.forbidden &#124;&#124; ampersand >= 0) ` → ` !(prefix && !prefix.settled && (prefix.forbidden &#124;&#124; ampersand >= 0)) ` | killed |
| compiler/context.ts:156 | operand | ` prefix && !prefix.settled ` → ` true ` | killed |
| compiler/context.ts:156 | operand | ` (prefix.forbidden &#124;&#124; ampersand >= 0) ` → ` true ` | killed |
| compiler/context.ts:156 | operand | ` prefix ` → ` true ` | killed |
| compiler/context.ts:156 | operand | ` !prefix.settled ` → ` true ` | killed |
| compiler/context.ts:156 | negation | ` !prefix.settled ` → ` prefix.settled ` | killed |
| compiler/context.ts:156 | operand | ` prefix.forbidden ` → ` false ` | killed |
| compiler/context.ts:156 | operand | ` ampersand >= 0 ` → ` false ` | killed |
| compiler/context.ts:156 | predicate | ` ampersand >= 0 ` → ` !(ampersand >= 0) ` | killed |
| compiler/context.ts:156 | delete statement | ` starts.push({ value: context.open, text: value.slice(start), at: offset => at(start + offset), forbidden: prefix.forbidden }) ` → ` ; ` | killed |
| compiler/context.ts:161 | class "\\t" | ` /^[^\t\n\f\r >]+/ ` → ` /^[^\n\f\r >]+/ ` | killed |
| compiler/context.ts:161 | class "\\n" | ` /^[^\t\n\f\r >]+/ ` → ` /^[^\t\f\r >]+/ ` | killed |
| compiler/context.ts:161 | class "\\f" | ` /^[^\t\n\f\r >]+/ ` → ` /^[^\t\n\r >]+/ ` | killed |
| compiler/context.ts:161 | class "\\r" | ` /^[^\t\n\f\r >]+/ ` → ` /^[^\t\n\f >]+/ ` | killed |
| compiler/context.ts:161 | class " " | ` /^[^\t\n\f\r >]+/ ` → ` /^[^\t\n\f\r>]+/ ` | killed |
| compiler/context.ts:161 | class ">" | ` /^[^\t\n\f\r >]+/ ` → ` /^[^\t\n\f\r ]+/ ` | killed |
| compiler/context.ts:162 | predicate | `` !unquoted &#124;&#124; /["'<=`]/.test(unquoted[0]) &#124;&#124; index + unquoted[0].length === value.length `` → `` !(!unquoted &#124;&#124; /["'<=`]/.test(unquoted[0]) &#124;&#124; index + unquoted[0].length === value.length) `` | killed |
| compiler/context.ts:162 | operand | `` !unquoted &#124;&#124; /["'<=`]/.test(unquoted[0]) `` → ` false ` | killed |
| compiler/context.ts:162 | operand | ` index + unquoted[0].length === value.length ` → ` false ` | killed |
| compiler/context.ts:162 | operand | ` !unquoted ` → ` false ` | killed |
| compiler/context.ts:162 | operand | `` /["'<=`]/.test(unquoted[0]) `` → ` false ` | killed |
| compiler/context.ts:162 | negation | ` !unquoted ` → ` unquoted ` | killed |
| compiler/context.ts:162 | class "\"" | `` /["'<=`]/ `` → `` /['<=`]/ `` | killed |
| compiler/context.ts:162 | class "'" | `` /["'<=`]/ `` → `` /["<=`]/ `` | killed |
| compiler/context.ts:162 | class "<" | `` /["'<=`]/ `` → `` /["'=`]/ `` | killed |
| compiler/context.ts:162 | class "=" | `` /["'<=`]/ `` → `` /["'<`]/ `` | killed |
| compiler/context.ts:162 | class "`" | `` /["'<=`]/ `` → ` /["'<=]/ ` | killed |
| compiler/context.ts:162 | predicate | ` index + unquoted[0].length === value.length ` → ` !(index + unquoted[0].length === value.length) ` | killed |
| compiler/context.ts:162 | drop returned value | ` refuse('G3014', at(index), context, '4', value.slice(index)) ` → ` undefined ` | killed |
| compiler/context.ts:163 | delete statement | ` index += unquoted[0].length ` → ` ; ` | killed |
| compiler/context.ts:164 | delete statement | ` Object.assign(context, { state: 'tag', attribute: '', delimited: false }) ` → ` ; ` | killed |
| compiler/context.ts:164 | boolean | ` false ` → ` true ` | equivalent: An unquoted value must end in the same text at whitespace or >; both consume or overwrite delimited. |
| compiler/context.ts:167 | case comparison | ` 'double' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/context.ts:167 | case comparison | ` 'single' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/context.ts:168 | predicate | ` context.state === 'double' ` → ` !(context.state === 'double') ` | killed |
| compiler/context.ts:169 | predicate | ` close < 0 ` → ` !(close < 0) ` | killed |
| compiler/context.ts:169 | delete statement | ` index = value.length; ` → ` ; ` | killed |
| compiler/context.ts:170 | predicate | ` context.open ` → ` !(context.open) ` | killed |
| compiler/context.ts:170 | delete statement | ` records.push({ kind: 'value-close', at: close }) ` → ` ; ` | killed |
| compiler/context.ts:171 | delete statement | ` index = close + 1 ` → ` ; ` | killed |
| compiler/context.ts:172 | delete statement | ` Object.assign(context, { state: 'tag', attribute: '', delimited: false, quote: 0, open: null }) ` → ` ; ` | killed |
| compiler/context.ts:172 | boolean | ` false ` → ` true ` | killed |
| compiler/context.ts:175 | case comparison | ` 'text' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/context.ts:177 | predicate | ` less < 0 ` → ` !(less < 0) ` | killed |
| compiler/context.ts:177 | delete statement | ` index = value.length; ` → ` ; ` | killed |
| compiler/context.ts:180 | predicate | ` rest.startsWith(end) && /^[\t\n\f\r \/>]/.test(rest.slice(end.length)) ` → ` !(rest.startsWith(end) && /^[\t\n\f\r \/>]/.test(rest.slice(end.length))) ` | killed |
| compiler/context.ts:180 | operand | ` rest.startsWith(end) ` → ` true ` | killed |
| compiler/context.ts:180 | operand | ` /^[\t\n\f\r \/>]/.test(rest.slice(end.length)) ` → ` true ` | killed |
| compiler/context.ts:180 | class "\\t" | ` /^[\t\n\f\r \/>]/ ` → ` /^[\n\f\r \/>]/ ` | killed |
| compiler/context.ts:180 | class "\\n" | ` /^[\t\n\f\r \/>]/ ` → ` /^[\t\f\r \/>]/ ` | killed |
| compiler/context.ts:180 | class "\\f" | ` /^[\t\n\f\r \/>]/ ` → ` /^[\t\n\r \/>]/ ` | killed |
| compiler/context.ts:180 | class "\\r" | ` /^[\t\n\f\r \/>]/ ` → ` /^[\t\n\f \/>]/ ` | killed |
| compiler/context.ts:180 | class " " | ` /^[\t\n\f\r \/>]/ ` → ` /^[\t\n\f\r\/>]/ ` | killed |
| compiler/context.ts:180 | class "\\/" | ` /^[\t\n\f\r \/>]/ ` → ` /^[\t\n\f\r >]/ ` | killed |
| compiler/context.ts:180 | class ">" | ` /^[\t\n\f\r \/>]/ ` → ` /^[\t\n\f\r \/]/ ` | killed |
| compiler/context.ts:181 | delete statement | ` Object.assign(context, { state: 'data', owner: '', strict: false }) ` → ` ; ` | killed |
| compiler/context.ts:181 | boolean | ` false ` → ` true ` | killed |
| compiler/context.ts:184 | predicate | ` ((end + '>').startsWith(rest) &#124;&#124; (context.owner === 'script' && '<!--'.startsWith(rest))) ` → ` !(((end + '>').startsWith(rest) &#124;&#124; (context.owner === 'script' && '<!--'.startsWith(rest)))) ` | killed |
| compiler/context.ts:184 | operand | ` (end + '>').startsWith(rest) ` → ` false ` | killed |
| compiler/context.ts:184 | operand | ` (context.owner === 'script' && '<!--'.startsWith(rest)) ` → ` false ` | killed |
| compiler/context.ts:184 | operand | ` context.owner === 'script' ` → ` true ` | killed |
| compiler/context.ts:184 | operand | ` '<!--'.startsWith(rest) ` → ` true ` | killed |
| compiler/context.ts:184 | predicate | ` context.owner === 'script' ` → ` !(context.owner === 'script') ` | killed |
| compiler/context.ts:184 | delete statement | ` refuse('G3014', at(less), context, '8', rest) ` → ` ; ` | killed |
| compiler/context.ts:185 | predicate | ` context.strict &#124;&#124; (context.owner === 'script' && rest.startsWith('<!--')) ` → ` !(context.strict &#124;&#124; (context.owner === 'script' && rest.startsWith('<!--'))) ` | killed |
| compiler/context.ts:185 | operand | ` context.strict ` → ` false ` | killed |
| compiler/context.ts:185 | operand | ` (context.owner === 'script' && rest.startsWith('<!--')) ` → ` false ` | killed |
| compiler/context.ts:185 | operand | ` context.owner === 'script' ` → ` true ` | killed |
| compiler/context.ts:185 | operand | ` rest.startsWith('<!--') ` → ` true ` | killed |
| compiler/context.ts:185 | predicate | ` context.owner === 'script' ` → ` !(context.owner === 'script') ` | killed |
| compiler/context.ts:185 | delete statement | ` refuse('G3013', at(less), context, '8/13', rest) ` → ` ; ` | killed |
| compiler/context.ts:186 | delete statement | ` index = less + 1 ` → ` ; ` | killed |
| compiler/context.ts:191 | drop returned value | ` { ...node, records, ...(open ? { open } : {}) } ` → ` undefined ` | killed |
| compiler/context.ts:191 | predicate | ` open ` → ` !(open) ` | killed |
| compiler/context.ts:194 | predicate | ` context.state === 'after-name' ` → ` !(context.state === 'after-name') ` | killed |
| compiler/context.ts:194 | delete statement | ` Object.assign(context, { state: 'tag', delimited: true, attribute: '' }) ` → ` ; ` | killed |
| compiler/context.ts:194 | boolean | ` true ` → ` false ` | killed |
| compiler/context.ts:195 | predicate | ` context.state === 'tag' ` → ` !(context.state === 'tag') ` | killed |
| compiler/context.ts:195 | delete statement | ` context.attribute = '' ` → ` ; ` | killed |
| compiler/context.ts:196 | predicate | ` context.state === 'before-value' ` → ` !(context.state === 'before-value') ` | killed |
| compiler/context.ts:196 | delete statement | ` refuse(code, where, context, '11', where.source.text.slice(where.start, where.end)) ` → ` ; ` | killed |
| compiler/context.ts:198 | boolean | ` false ` → ` true ` | killed |
| compiler/context.ts:199 | predicate | ` context.state === 'data' ` → ` !(context.state === 'data') ` | killed |
| compiler/context.ts:199 | predicate | ` context.state === 'text' ` → ` !(context.state === 'text') ` | killed |
| compiler/context.ts:200 | predicate | ` context.state === 'double' &#124;&#124; context.state === 'single' ` → ` !(context.state === 'double' &#124;&#124; context.state === 'single') ` | killed |
| compiler/context.ts:200 | operand | ` context.state === 'double' ` → ` false ` | killed |
| compiler/context.ts:200 | operand | ` context.state === 'single' ` → ` false ` | killed |
| compiler/context.ts:200 | predicate | ` context.state === 'double' ` → ` !(context.state === 'double') ` | killed |
| compiler/context.ts:200 | predicate | ` context.state === 'single' ` → ` !(context.state === 'single') ` | killed |
| compiler/context.ts:202 | predicate | ` value ` → ` !(value) ` | killed |
| compiler/context.ts:202 | delete statement | ` value.dynamic = true; ` → ` ; ` | killed |
| compiler/context.ts:202 | boolean | ` true ` → ` false ` | killed |
| compiler/context.ts:202 | predicate | ` !render ` → ` !(!render) ` | killed |
| compiler/context.ts:202 | negation | ` !render ` → ` render ` | killed |
| compiler/context.ts:202 | delete statement | ` actualWrites.add(value); ` → ` ; ` | killed |
| compiler/context.ts:202 | predicate | ` value.tag ` → ` !(value.tag) ` | killed |
| compiler/context.ts:202 | delete statement | ` value.tag.dynamic = true ` → ` ; ` | killed |
| compiler/context.ts:202 | boolean | ` true ` → ` false ` | killed |
| compiler/context.ts:203 | drop returned value | ` { place, url: value?.url != null, metadata: value?.tag != null } ` → ` undefined ` | killed |
| compiler/context.ts:203 | predicate | ` value?.url != null ` → ` !(value?.url != null) ` | killed |
| compiler/context.ts:203 | predicate | ` value?.tag != null ` → ` !(value?.tag != null) ` | killed |
| compiler/context.ts:205 | predicate | ` context.state === 'data' &#124;&#124; context.state === 'text' ` → ` !(context.state === 'data' &#124;&#124; context.state === 'text') ` | killed |
| compiler/context.ts:205 | operand | ` context.state === 'data' ` → ` false ` | killed |
| compiler/context.ts:205 | operand | ` context.state === 'text' ` → ` false ` | killed |
| compiler/context.ts:205 | predicate | ` context.state === 'data' ` → ` !(context.state === 'data') ` | killed |
| compiler/context.ts:205 | predicate | ` context.state === 'text' ` → ` !(context.state === 'text') ` | killed |
| compiler/context.ts:206 | predicate | ` context.strict && (opaque &#124;&#124; context.owner === 'script' &#124;&#124; context.owner === 'style') ` → ` !(context.strict && (opaque &#124;&#124; context.owner === 'script' &#124;&#124; context.owner === 'style')) ` | killed |
| compiler/context.ts:206 | operand | ` context.strict ` → ` true ` | killed |
| compiler/context.ts:206 | operand | ` (opaque &#124;&#124; context.owner === 'script' &#124;&#124; context.owner === 'style') ` → ` true ` | killed |
| compiler/context.ts:206 | operand | ` opaque &#124;&#124; context.owner === 'script' ` → ` false ` | killed |
| compiler/context.ts:206 | operand | ` context.owner === 'style' ` → ` false ` | killed |
| compiler/context.ts:206 | operand | ` opaque ` → ` false ` | killed |
| compiler/context.ts:206 | operand | ` context.owner === 'script' ` → ` false ` | killed |
| compiler/context.ts:206 | predicate | ` context.owner === 'script' ` → ` !(context.owner === 'script') ` | killed |
| compiler/context.ts:206 | predicate | ` context.owner === 'style' ` → ` !(context.owner === 'style') ` | killed |
| compiler/context.ts:206 | delete statement | ` refuse('G3013', at, context, '13', at.source.text.slice(at.start, at.end)) ` → ` ; ` | killed |
| compiler/context.ts:207 | drop returned value | ` { place, url: false, metadata: false } ` → ` undefined ` | killed |
| compiler/context.ts:207 | boolean | ` false ` → ` true ` | killed |
| compiler/context.ts:207 | boolean | ` false ` → ` true ` | killed |
| compiler/context.ts:209 | drop returned value | ` refuse(opaque &#124;&#124; render ? 'G3009' : 'G3008', at, context, '10', at.source.text.slice(at.start, at.end)) ` → ` undefined ` | killed |
| compiler/context.ts:209 | predicate | ` opaque &#124;&#124; render ` → ` !(opaque &#124;&#124; render) ` | killed |
| compiler/context.ts:209 | operand | ` opaque ` → ` false ` | killed |
| compiler/context.ts:209 | operand | ` render ` → ` false ` | killed |
| compiler/context.ts:213 | predicate | ` node.kind === 'snippet' ` → ` !(node.kind === 'snippet') ` | killed |
| compiler/context.ts:213 | delete statement | ` scope.bindings.set(node.name, { node, scope, list: [], variants: new Map(), active: null }) ` → ` ; ` | killed |
| compiler/context.ts:214 | predicate | ` node.kind === 'partial' ` → ` !(node.kind === 'partial') ` | killed |
| compiler/context.ts:214 | delete statement | ` declare(node.children ?? [], scope) ` → ` ; ` | killed |
| compiler/context.ts:218 | delete statement | ` declare(nodes, scope); ` → ` ; ` | killed |
| compiler/context.ts:218 | drop returned value | ` scope ` → ` undefined ` | killed |
| compiler/context.ts:226 | predicate | ` outer ` → ` !(outer) ` | killed |
| compiler/context.ts:226 | delete statement | ` previous.set(name, outer); ` → ` ; ` | killed |
| compiler/context.ts:226 | delete statement | ` unmarked.delete(outer) ` → ` ; ` | killed |
| compiler/context.ts:227 | delete statement | ` visible.set(name, binding); ` → ` ; ` | killed |
| compiler/context.ts:227 | delete statement | ` unmarked.add(binding) ` → ` ; ` | killed |
| compiler/context.ts:230 | predicate | ` node.kind === 'js' ` → ` !(node.kind === 'js') ` | killed |
| compiler/context.ts:231 | delete statement | ` scripted.add(binding.node) ` → ` ; ` | killed |
| compiler/context.ts:232 | delete statement | ` unmarked.clear() ` → ` ; ` | killed |
| compiler/context.ts:233 | predicate | ` node.kind === 'partial' ` → ` !(node.kind === 'partial') ` | killed |
| compiler/context.ts:233 | delete statement | ` markScripted(node.children ?? [], { parent: scope, bindings: new Map() }) ` → ` ; ` | killed |
| compiler/context.ts:234 | predicate | ` node.kind === 'if' ` → ` !(node.kind === 'if') ` | killed |
| compiler/context.ts:234 | delete statement | ` markScripted(branch.children, openScope(branch.children, scope)) ` → ` ; ` | killed |
| compiler/context.ts:235 | predicate | ` node.kind === 'each' &#124;&#124; node.kind === 'snippet' ` → ` !(node.kind === 'each' &#124;&#124; node.kind === 'snippet') ` | killed |
| compiler/context.ts:235 | operand | ` node.kind === 'each' ` → ` false ` | killed |
| compiler/context.ts:235 | operand | ` node.kind === 'snippet' ` → ` false ` | killed |
| compiler/context.ts:235 | predicate | ` node.kind === 'each' ` → ` !(node.kind === 'each') ` | killed |
| compiler/context.ts:235 | predicate | ` node.kind === 'snippet' ` → ` !(node.kind === 'snippet') ` | killed |
| compiler/context.ts:235 | delete statement | ` markScripted(node.children, openScope(node.children, scope)) ` → ` ; ` | killed |
| compiler/context.ts:237 | delete statement | ` visible.delete(name); ` → ` ; ` | killed |
| compiler/context.ts:237 | delete statement | ` unmarked.delete(binding) ` → ` ; ` | killed |
| compiler/context.ts:239 | delete statement | ` visible.set(name, binding) ` → ` ; ` | killed |
| compiler/context.ts:240 | predicate | ` !scripted.has(binding.node) ` → ` !(!scripted.has(binding.node)) ` | killed |
| compiler/context.ts:240 | negation | ` !scripted.has(binding.node) ` → ` scripted.has(binding.node) ` | killed |
| compiler/context.ts:240 | delete statement | ` unmarked.add(binding) ` → ` ; ` | killed |
| compiler/context.ts:244 | predicate | ` current ` → ` !(current) ` | killed |
| compiler/context.ts:244 | predicate | ` binding ` → ` !(binding) ` | killed |
| compiler/context.ts:244 | drop returned value | ` binding ` → ` undefined ` | killed |
| compiler/context.ts:247 | boolean | ` true ` → ` false ` | killed |
| compiler/context.ts:250 | predicate | ` last?.kind === 'text' && last.value.length ` → ` !(last?.kind === 'text' && last.value.length) ` | killed |
| compiler/context.ts:250 | operand | ` last?.kind === 'text' ` → ` true ` | killed |
| compiler/context.ts:250 | operand | ` last.value.length ` → ` true ` | killed |
| compiler/context.ts:250 | predicate | ` last?.kind === 'text' ` → ` !(last?.kind === 'text') ` | killed |
| compiler/context.ts:251 | predicate | ` closes ` → ` !(closes) ` | killed |
| compiler/context.ts:251 | delete statement | ` animationValue(exit, end) ` → ` ; ` | killed |
| compiler/context.ts:252 | delete statement | ` boundary(exit, end, code) ` → ` ; ` | killed |
| compiler/context.ts:253 | predicate | ` !same(entry, exit) ` → ` !(!same(entry, exit)) ` | killed |
| compiler/context.ts:253 | negation | ` !same(entry, exit) ` → ` same(entry, exit) ` | killed |
| compiler/context.ts:253 | delete statement | ` refuse(code, end, entry, '11', describe(exit)) ` → ` ; ` | killed |
| compiler/context.ts:254 | drop returned value | ` { children: result, delimited: exit.delimited } ` → ` undefined ` | killed |
| compiler/context.ts:257 | key entry.state | ` [entry.state, entry.tag, entry.attribute, entry.owner, entry.svg, entry.math, entry.template, entry.open?.url != null] ` → ` [entry.tag, entry.attribute, entry.owner, entry.svg, entry.math, entry.template, entry.open?.url != null] ` | killed |
| compiler/context.ts:257 | key entry.tag | ` [entry.state, entry.tag, entry.attribute, entry.owner, entry.svg, entry.math, entry.template, entry.open?.url != null] ` → ` [entry.state, entry.attribute, entry.owner, entry.svg, entry.math, entry.template, entry.open?.url != null] ` | killed |
| compiler/context.ts:257 | key entry.attribute | ` [entry.state, entry.tag, entry.attribute, entry.owner, entry.svg, entry.math, entry.template, entry.open?.url != null] ` → ` [entry.state, entry.tag, entry.owner, entry.svg, entry.math, entry.template, entry.open?.url != null] ` | killed |
| compiler/context.ts:257 | key entry.owner | ` [entry.state, entry.tag, entry.attribute, entry.owner, entry.svg, entry.math, entry.template, entry.open?.url != null] ` → ` [entry.state, entry.tag, entry.attribute, entry.svg, entry.math, entry.template, entry.open?.url != null] ` | killed |
| compiler/context.ts:257 | key entry.svg | ` [entry.state, entry.tag, entry.attribute, entry.owner, entry.svg, entry.math, entry.template, entry.open?.url != null] ` → ` [entry.state, entry.tag, entry.attribute, entry.owner, entry.math, entry.template, entry.open?.url != null] ` | killed |
| compiler/context.ts:257 | key entry.math | ` [entry.state, entry.tag, entry.attribute, entry.owner, entry.svg, entry.math, entry.template, entry.open?.url != null] ` → ` [entry.state, entry.tag, entry.attribute, entry.owner, entry.svg, entry.template, entry.open?.url != null] ` | killed |
| compiler/context.ts:257 | key entry.template | ` [entry.state, entry.tag, entry.attribute, entry.owner, entry.svg, entry.math, entry.template, entry.open?.url != null] ` → ` [entry.state, entry.tag, entry.attribute, entry.owner, entry.svg, entry.math, entry.open?.url != null] ` | killed |
| compiler/context.ts:257 | key entry.open?.url != null | ` [entry.state, entry.tag, entry.attribute, entry.owner, entry.svg, entry.math, entry.template, entry.open?.url != null] ` → ` [entry.state, entry.tag, entry.attribute, entry.owner, entry.svg, entry.math, entry.template] ` | killed |
| compiler/context.ts:257 | predicate | ` entry.open?.url != null ` → ` !(entry.open?.url != null) ` | equivalent: Negating a boolean key component is bijective and preserves exactly the same variant partitions. |
| compiler/context.ts:259 | predicate | ` known ` → ` !(known) ` | killed |
| compiler/context.ts:259 | drop returned value | ` known.name ` → ` undefined ` | killed |
| compiler/context.ts:260 | predicate | ` binding.active ` → ` !(binding.active) ` | killed |
| compiler/context.ts:260 | delete statement | ` refuse('G3011', at, binding.active, '11', describe(entry)) ` → ` ; ` | killed |
| compiler/context.ts:261 | boolean | ` false ` → ` true ` | killed |
| compiler/context.ts:262 | delete statement | ` variants.set(variant.name, variant) ` → ` ; ` | killed |
| compiler/context.ts:263 | delete statement | ` binding.variants.set(key, variant); ` → ` ; ` | killed |
| compiler/context.ts:263 | delete statement | ` binding.list.push(variant); ` → ` ; ` | killed |
| compiler/context.ts:263 | delete statement | ` binding.active = entry ` → ` ; ` | killed |
| compiler/context.ts:264 | delete statement | ` variant.children = path(binding.node.children, entry, openScope(binding.node.children, binding.scope), 'G3011', binding.node.span).children ` → ` ; ` | killed |
| compiler/context.ts:265 | delete statement | ` binding.active = null ` → ` ; ` | killed |
| compiler/context.ts:266 | drop returned value | ` variant.name ` → ` undefined ` | killed |
| compiler/context.ts:268 | boolean | ` false ` → ` true ` | killed |
| compiler/context.ts:271 | predicate | ` node.kind === 'text' ` → ` !(node.kind === 'text') ` | killed |
| compiler/context.ts:271 | delete statement | ` result.push(read(node, context, index + 1 < nodes.length &#124;&#124; closes)); ` → ` ; ` | killed |
| compiler/context.ts:271 | operand | ` index + 1 < nodes.length ` → ` false ` | killed |
| compiler/context.ts:271 | operand | ` closes ` → ` false ` | killed |
| compiler/context.ts:271 | predicate | ` index + 1 < nodes.length ` → ` !(index + 1 < nodes.length) ` | killed |
| compiler/context.ts:272 | delete statement | ` animationValue(context, node.span) ` → ` ; ` | killed |
| compiler/context.ts:273 | predicate | ` node.kind === 'const' ` → ` !(node.kind === 'const') ` | killed |
| compiler/context.ts:273 | delete statement | ` boundary(context, node.span); ` → ` ; ` | killed |
| compiler/context.ts:273 | delete statement | ` result.push(node); ` → ` ; ` | killed |
| compiler/context.ts:274 | predicate | ` node.kind === 'snippet' ` → ` !(node.kind === 'snippet') ` | killed |
| compiler/context.ts:275 | delete statement | ` boundary(context, node.span) ` → ` ; ` | killed |
| compiler/context.ts:277 | delete statement | ` result.push({ ...node, variants: binding.list, ...(scripted.has(node) ? { js: specialize(binding, data(), node.span) } : {}) }); ` → ` ; ` | killed |
| compiler/context.ts:277 | predicate | ` scripted.has(node) ` → ` !(scripted.has(node)) ` | killed |
| compiler/context.ts:279 | predicate | ` node.kind === 'output' &#124;&#124; node.kind === 'js' ` → ` !(node.kind === 'output' &#124;&#124; node.kind === 'js') ` | killed |
| compiler/context.ts:279 | operand | ` node.kind === 'output' ` → ` false ` | killed |
| compiler/context.ts:279 | operand | ` node.kind === 'js' ` → ` false ` | killed |
| compiler/context.ts:279 | predicate | ` node.kind === 'output' ` → ` !(node.kind === 'output') ` | killed |
| compiler/context.ts:279 | predicate | ` node.kind === 'js' ` → ` !(node.kind === 'js') ` | killed |
| compiler/context.ts:279 | delete statement | ` result.push({ ...node, slot: slot(context, node.span, node.kind === 'js' &#124;&#124; node.raw) }); ` → ` ; ` | killed |
| compiler/context.ts:279 | operand | ` node.kind === 'js' ` → ` false ` | killed |
| compiler/context.ts:279 | operand | ` node.raw ` → ` false ` | killed |
| compiler/context.ts:279 | predicate | ` node.kind === 'js' ` → ` !(node.kind === 'js') ` | killed |
| compiler/context.ts:280 | delete statement | ` boundary(context, node.span, node.kind === 'render' ? 'G3009' : node.kind === 'partial' ? 'G3011' : 'G3010') ` → ` ; ` | killed |
| compiler/context.ts:280 | predicate | ` node.kind === 'render' ` → ` !(node.kind === 'render') ` | killed |
| compiler/context.ts:280 | predicate | ` node.kind === 'partial' ` → ` !(node.kind === 'partial') ` | killed |
| compiler/context.ts:281 | predicate | ` node.kind ` → ` !(node.kind) ` | killed |
| compiler/context.ts:282 | case comparison | ` 'if' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/context.ts:285 | predicate | ` node.branches[node.branches.length - 1]!.condition !== null ` → ` !(node.branches[node.branches.length - 1]!.condition !== null) ` | killed |
| compiler/context.ts:285 | delete statement | ` ends.push(context.delimited) ` → ` ; ` | killed |
| compiler/context.ts:286 | delete statement | ` context.delimited = ends.every(Boolean) ` → ` ; ` | killed |
| compiler/context.ts:287 | delete statement | ` result.push({ ...node, branches: node.branches.map((branch, index) => ({ ...branch, children: paths[index]!.children })) }); ` → ` ; ` | killed |
| compiler/context.ts:289 | case comparison | ` 'each' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/context.ts:290 | boolean | ` false ` → ` true ` | killed |
| compiler/context.ts:291 | delete statement | ` context.delimited &&= body.delimited ` → ` ; ` | killed |
| compiler/context.ts:291 | assignment condition | ` context.delimited &&= body.delimited ` → ` context.delimited = body.delimited ` | killed |
| compiler/context.ts:291 | assignment operand | ` body.delimited ` → ` true ` | killed |
| compiler/context.ts:292 | delete statement | ` result.push({ ...node, children: body.children }); ` → ` ; ` | killed |
| compiler/context.ts:294 | case comparison | ` 'partial' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/context.ts:295 | boolean | ` false ` → ` true ` | killed |
| compiler/context.ts:296 | delete statement | ` context.delimited = body.delimited; ` → ` ; ` | killed |
| compiler/context.ts:296 | delete statement | ` result.push(...body.children); ` → ` ; ` | killed |
| compiler/context.ts:298 | case comparison | ` 'render' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/context.ts:301 | predicate | ` ANIMATION_ELEMENTS.has(context.tag) ` → ` !(ANIMATION_ELEMENTS.has(context.tag)) ` | killed |
| compiler/context.ts:301 | delete statement | ` specialization = specialize(resolve(scope, node.name), context, node.span) ` → ` ; ` | killed |
| compiler/context.ts:302 | boolean | ` false ` → ` true ` | killed |
| compiler/context.ts:302 | boolean | ` true ` → ` false ` | killed |
| compiler/context.ts:303 | delete statement | ` specialization ??= specialize(resolve(scope, node.name), context, node.span) ` → ` ; ` | killed |
| compiler/context.ts:304 | predicate | ` context.open ` → ` !(context.open) ` | killed |
| compiler/context.ts:304 | delete statement | ` renderWrites.push({ value: context.open, name: specialization }) ` → ` ; ` | killed |
| compiler/context.ts:305 | delete statement | ` result.push({ ...node, slot: written, specialization }); ` → ` ; ` | killed |
| compiler/context.ts:309 | drop returned value | ` result ` → ` undefined ` | killed |
| compiler/context.ts:312 | delete statement | ` markScripted(ast.children, scope) ` → ` ; ` | killed |
| compiler/context.ts:314 | predicate | ` context.state !== 'data' ` → ` !(context.state !== 'data') ` | killed |
| compiler/context.ts:314 | delete statement | ` refuse('G3012', { ...ast.span, start: ast.span.end }, context, '12', describe(context)) ` → ` ; ` | killed |
| compiler/context.ts:320 | predicate | ` node.kind === 'output' &#124;&#124; node.kind === 'js' ` → ` !(node.kind === 'output' &#124;&#124; node.kind === 'js') ` | killed |
| compiler/context.ts:320 | operand | ` node.kind === 'output' ` → ` false ` | killed |
| compiler/context.ts:320 | operand | ` node.kind === 'js' ` → ` false ` | killed |
| compiler/context.ts:320 | predicate | ` node.kind === 'output' ` → ` !(node.kind === 'output') ` | killed |
| compiler/context.ts:320 | predicate | ` node.kind === 'js' ` → ` !(node.kind === 'js') ` | killed |
| compiler/context.ts:320 | delete statement | ` variant.writes = true ` → ` ; ` | killed |
| compiler/context.ts:320 | boolean | ` true ` → ` false ` | killed |
| compiler/context.ts:321 | predicate | ` node.kind === 'render' ` → ` !(node.kind === 'render') ` | killed |
| compiler/context.ts:323 | delete statement | ` list.push(variant); ` → ` ; ` | killed |
| compiler/context.ts:323 | delete statement | ` callers.set(name, list) ` → ` ; ` | killed |
| compiler/context.ts:324 | predicate | ` node.kind === 'if' ` → ` !(node.kind === 'if') ` | killed |
| compiler/context.ts:324 | delete statement | ` inspect(branch.children, variant) ` → ` ; ` | killed |
| compiler/context.ts:325 | predicate | ` node.kind === 'each' ` → ` !(node.kind === 'each') ` | killed |
| compiler/context.ts:325 | delete statement | ` inspect(node.children, variant) ` → ` ; ` | killed |
| compiler/context.ts:328 | delete statement | ` inspect(variant.children, variant); ` → ` ; ` | killed |
| compiler/context.ts:328 | predicate | ` variant.writes ` → ` !(variant.writes) ` | killed |
| compiler/context.ts:328 | delete statement | ` pending.push(variant) ` → ` ; ` | killed |
| compiler/context.ts:329 | predicate | ` index < pending.length ` → ` !(index < pending.length) ` | killed |
| compiler/context.ts:330 | predicate | ` !caller.writes ` → ` !(!caller.writes) ` | killed |
| compiler/context.ts:330 | negation | ` !caller.writes ` → ` caller.writes ` | killed |
| compiler/context.ts:330 | delete statement | ` caller.writes = true; ` → ` ; ` | killed |
| compiler/context.ts:330 | boolean | ` true ` → ` false ` | killed |
| compiler/context.ts:330 | delete statement | ` pending.push(caller) ` → ` ; ` | killed |
| compiler/context.ts:332 | predicate | ` variants.get(render.name)!.writes ` → ` !(variants.get(render.name)!.writes) ` | killed |
| compiler/context.ts:332 | delete statement | ` actualWrites.add(render.value) ` → ` ; ` | killed |
| compiler/context.ts:333 | predicate | ` actualWrites.has(start.value) ` → ` !(actualWrites.has(start.value)) ` | killed |
| compiler/context.ts:334 | predicate | ` start.forbidden ` → ` !(start.forbidden) ` | killed |
| compiler/context.ts:334 | delete statement | `` fail('G3015', `HTML context URL; forbidden static prefix: ${excerpt(start.text)}`, start.at(0), 'Use a relative URL, or http:, https:, mailto: or tel:, before a dynamic value.') `` → ` ; ` | killed |
| compiler/context.ts:335 | delete statement | `` fail('G3015', `HTML context URL; rule 14: ${excerpt(start.text)}`, start.at(start.text.indexOf('&')), 'Write the character itself, not a reference, before a value in a URL.') `` → ` ; ` | killed |
| compiler/context.ts:337 | drop returned value | ` { ...ast, children } ` → ` undefined ` | killed |
| compiler/url.ts:3 | set 'http' | ` ['http', 'https', 'mailto', 'tel'] ` → ` ['https', 'mailto', 'tel'] ` | killed |
| compiler/url.ts:3 | set 'https' | ` ['http', 'https', 'mailto', 'tel'] ` → ` ['http', 'mailto', 'tel'] ` | killed |
| compiler/url.ts:3 | set 'mailto' | ` ['http', 'https', 'mailto', 'tel'] ` → ` ['http', 'https', 'tel'] ` | killed |
| compiler/url.ts:3 | set 'tel' | ` ['http', 'https', 'mailto', 'tel'] ` → ` ['http', 'https', 'mailto'] ` | killed |
| compiler/url.ts:5 | operand | ` (code >= 97 && code <= 122) ` → ` false ` | killed |
| compiler/url.ts:5 | operand | ` (code >= 65 && code <= 90) ` → ` false ` | killed |
| compiler/url.ts:5 | operand | ` code >= 97 ` → ` true ` | killed |
| compiler/url.ts:5 | operand | ` code <= 122 ` → ` true ` | killed |
| compiler/url.ts:5 | predicate | ` code >= 97 ` → ` !(code >= 97) ` | killed |
| compiler/url.ts:5 | predicate | ` code <= 122 ` → ` !(code <= 122) ` | killed |
| compiler/url.ts:5 | operand | ` code >= 65 ` → ` true ` | killed |
| compiler/url.ts:5 | operand | ` code <= 90 ` → ` true ` | killed |
| compiler/url.ts:5 | predicate | ` code >= 65 ` → ` !(code >= 65) ` | killed |
| compiler/url.ts:5 | predicate | ` code <= 90 ` → ` !(code <= 90) ` | killed |
| compiler/url.ts:6 | operand | ` code >= 48 ` → ` true ` | killed |
| compiler/url.ts:6 | operand | ` code <= 57 ` → ` true ` | killed |
| compiler/url.ts:6 | predicate | ` code >= 48 ` → ` !(code >= 48) ` | killed |
| compiler/url.ts:6 | predicate | ` code <= 57 ` → ` !(code <= 57) ` | killed |
| compiler/url.ts:18 | drop returned value | ` this.mode === 'relative' &#124;&#124; this.mode === 'allowed' ` → ` undefined ` | killed |
| compiler/url.ts:18 | operand | ` this.mode === 'relative' ` → ` false ` | killed |
| compiler/url.ts:18 | operand | ` this.mode === 'allowed' ` → ` false ` | killed |
| compiler/url.ts:18 | predicate | ` this.mode === 'relative' ` → ` !(this.mode === 'relative') ` | killed |
| compiler/url.ts:18 | predicate | ` this.mode === 'allowed' ` → ` !(this.mode === 'allowed') ` | killed |
| compiler/url.ts:20 | drop returned value | ` this.mode === 'forbidden' ` → ` undefined ` | killed |
| compiler/url.ts:20 | predicate | ` this.mode === 'forbidden' ` → ` !(this.mode === 'forbidden') ` | killed |
| compiler/url.ts:24 | predicate | ` code === TAB &#124;&#124; code === LF &#124;&#124; code === CR ` → ` !(code === TAB &#124;&#124; code === LF &#124;&#124; code === CR) ` | killed |
| compiler/url.ts:24 | operand | ` code === TAB &#124;&#124; code === LF ` → ` false ` | killed |
| compiler/url.ts:24 | operand | ` code === CR ` → ` false ` | killed |
| compiler/url.ts:24 | operand | ` code === TAB ` → ` false ` | killed |
| compiler/url.ts:24 | operand | ` code === LF ` → ` false ` | killed |
| compiler/url.ts:24 | predicate | ` code === TAB ` → ` !(code === TAB) ` | killed |
| compiler/url.ts:24 | predicate | ` code === LF ` → ` !(code === LF) ` | killed |
| compiler/url.ts:24 | predicate | ` code === CR ` → ` !(code === CR) ` | killed |
| compiler/url.ts:25 | predicate | ` this.mode === 'leading' ` → ` !(this.mode === 'leading') ` | killed |
| compiler/url.ts:26 | predicate | ` code <= SPACE ` → ` !(code <= SPACE) ` | killed |
| compiler/url.ts:27 | predicate | ` code === SLASH &#124;&#124; code === BACKSLASH ` → ` !(code === SLASH &#124;&#124; code === BACKSLASH) ` | killed |
| compiler/url.ts:27 | operand | ` code === SLASH ` → ` false ` | killed |
| compiler/url.ts:27 | operand | ` code === BACKSLASH ` → ` false ` | killed |
| compiler/url.ts:27 | predicate | ` code === SLASH ` → ` !(code === SLASH) ` | killed |
| compiler/url.ts:27 | predicate | ` code === BACKSLASH ` → ` !(code === BACKSLASH) ` | killed |
| compiler/url.ts:27 | delete statement | ` this.mode = 'slash'; ` → ` ; ` | killed |
| compiler/url.ts:28 | predicate | ` !isLetter(code) ` → ` !(!isLetter(code)) ` | killed |
| compiler/url.ts:28 | negation | ` !isLetter(code) ` → ` isLetter(code) ` | killed |
| compiler/url.ts:28 | delete statement | ` this.mode = 'relative'; ` → ` ; ` | killed |
| compiler/url.ts:29 | delete statement | ` this.mode = 'scheme' ` → ` ; ` | killed |
| compiler/url.ts:30 | predicate | ` this.mode === 'slash' ` → ` !(this.mode === 'slash') ` | killed |
| compiler/url.ts:31 | delete statement | ` this.mode = code === SLASH &#124;&#124; code === BACKSLASH ? 'forbidden' : 'relative' ` → ` ; ` | killed |
| compiler/url.ts:31 | predicate | ` code === SLASH &#124;&#124; code === BACKSLASH ` → ` !(code === SLASH &#124;&#124; code === BACKSLASH) ` | killed |
| compiler/url.ts:31 | operand | ` code === SLASH ` → ` false ` | killed |
| compiler/url.ts:31 | operand | ` code === BACKSLASH ` → ` false ` | killed |
| compiler/url.ts:31 | predicate | ` code === SLASH ` → ` !(code === SLASH) ` | killed |
| compiler/url.ts:31 | predicate | ` code === BACKSLASH ` → ` !(code === BACKSLASH) ` | killed |
| compiler/url.ts:34 | predicate | ` this.mode !== 'scheme' ` → ` !(this.mode !== 'scheme') ` | killed |
| compiler/url.ts:35 | predicate | ` code === COLON ` → ` !(code === COLON) ` | killed |
| compiler/url.ts:36 | boolean | ` false ` → ` true ` | killed |
| compiler/url.ts:37 | predicate | ` index < SCHEMES.length ` → ` !(index < SCHEMES.length) ` | killed |
| compiler/url.ts:37 | delete statement | ` allowed &#124;&#124;= (this.schemes & (1 << index)) !== 0 && SCHEMES[index]!.length === this.schemeLength ` → ` ; ` | killed |
| compiler/url.ts:37 | assignment condition | ` allowed &#124;&#124;= (this.schemes & (1 << index)) !== 0 && SCHEMES[index]!.length === this.schemeLength ` → ` allowed = (this.schemes & (1 << index)) !== 0 && SCHEMES[index]!.length === this.schemeLength ` | killed |
| compiler/url.ts:37 | assignment operand | ` (this.schemes & (1 << index)) !== 0 && SCHEMES[index]!.length === this.schemeLength ` → ` false ` | killed |
| compiler/url.ts:37 | operand | ` (this.schemes & (1 << index)) !== 0 ` → ` true ` | killed |
| compiler/url.ts:37 | operand | ` SCHEMES[index]!.length === this.schemeLength ` → ` true ` | killed |
| compiler/url.ts:37 | predicate | ` (this.schemes & (1 << index)) !== 0 ` → ` !((this.schemes & (1 << index)) !== 0) ` | killed |
| compiler/url.ts:37 | predicate | ` SCHEMES[index]!.length === this.schemeLength ` → ` !(SCHEMES[index]!.length === this.schemeLength) ` | killed |
| compiler/url.ts:38 | delete statement | ` this.mode = allowed ? 'allowed' : 'forbidden' ` → ` ; ` | killed |
| compiler/url.ts:38 | predicate | ` allowed ` → ` !(allowed) ` | killed |
| compiler/url.ts:39 | predicate | ` isLetter(code) &#124;&#124; isDigit(code) &#124;&#124; code === PLUS &#124;&#124; code === MINUS &#124;&#124; code === PERIOD ` → ` !(isLetter(code) &#124;&#124; isDigit(code) &#124;&#124; code === PLUS &#124;&#124; code === MINUS &#124;&#124; code === PERIOD) ` | killed |
| compiler/url.ts:39 | operand | ` isLetter(code) &#124;&#124; isDigit(code) &#124;&#124; code === PLUS &#124;&#124; code === MINUS ` → ` false ` | killed |
| compiler/url.ts:39 | operand | ` code === PERIOD ` → ` false ` | killed |
| compiler/url.ts:39 | operand | ` isLetter(code) &#124;&#124; isDigit(code) &#124;&#124; code === PLUS ` → ` false ` | killed |
| compiler/url.ts:39 | operand | ` code === MINUS ` → ` false ` | killed |
| compiler/url.ts:39 | operand | ` isLetter(code) &#124;&#124; isDigit(code) ` → ` false ` | killed |
| compiler/url.ts:39 | operand | ` code === PLUS ` → ` false ` | killed |
| compiler/url.ts:39 | operand | ` isLetter(code) ` → ` false ` | killed |
| compiler/url.ts:39 | operand | ` isDigit(code) ` → ` false ` | killed |
| compiler/url.ts:39 | predicate | ` code === PLUS ` → ` !(code === PLUS) ` | killed |
| compiler/url.ts:39 | predicate | ` code === MINUS ` → ` !(code === MINUS) ` | killed |
| compiler/url.ts:39 | predicate | ` code === PERIOD ` → ` !(code === PERIOD) ` | killed |
| compiler/url.ts:41 | predicate | ` index < SCHEMES.length ` → ` !(index < SCHEMES.length) ` | killed |
| compiler/url.ts:41 | predicate | ` SCHEMES[index]!.charCodeAt(this.schemeLength) !== (code &#124; 32) ` → ` !(SCHEMES[index]!.charCodeAt(this.schemeLength) !== (code &#124; 32)) ` | killed |
| compiler/url.ts:41 | delete statement | ` this.schemes &= ~(1 << index) ` → ` ; ` | killed |
| compiler/url.ts:43 | predicate | ` this.schemes ` → ` !(this.schemes) ` | killed |
| compiler/url.ts:43 | delete statement | ` this.schemeLength++ ` → ` ; ` | killed |
| compiler/url.ts:44 | delete statement | ` this.mode = 'relative' ` → ` ; ` | killed |
| compiler/url.ts:48 | boolean | ` false ` → ` true ` | killed |
| compiler/url.ts:49 | predicate | ` text === '' &#124;&#124; this.settled ` → ` !(text === '' &#124;&#124; this.settled) ` | killed |
| compiler/url.ts:49 | operand | ` text === '' ` → ` false ` | equivalent: Feeding empty text adds only an empty diagnostic chunk, scans nothing and leaves every check unchanged. |
| compiler/url.ts:49 | operand | ` this.settled ` → ` false ` | equivalent: A settled prefix skips the scan loop and can never report the extra diagnostic chunks. |
| compiler/url.ts:49 | predicate | ` text === '' ` → ` !(text === '') ` | killed |
| compiler/url.ts:50 | delete statement | ` this.chunks.push(text) ` → ` ; ` | killed |
| compiler/url.ts:51 | predicate | ` this.mode === 'forbidden' &#124;&#124; this.mode === 'undecided' ` → ` !(this.mode === 'forbidden' &#124;&#124; this.mode === 'undecided') ` | killed |
| compiler/url.ts:51 | operand | ` this.mode === 'forbidden' ` → ` false ` | killed |
| compiler/url.ts:51 | operand | ` this.mode === 'undecided' ` → ` false ` | killed |
| compiler/url.ts:51 | predicate | ` this.mode === 'forbidden' ` → ` !(this.mode === 'forbidden') ` | killed |
| compiler/url.ts:51 | predicate | ` this.mode === 'undecided' ` → ` !(this.mode === 'undecided') ` | killed |
| compiler/url.ts:52 | predicate | ` index < text.length && !this.settled ` → ` !(index < text.length && !this.settled) ` | killed |
| compiler/url.ts:52 | operand | ` index < text.length ` → ` true ` | killed |
| compiler/url.ts:52 | operand | ` !this.settled ` → ` true ` | killed |
| compiler/url.ts:52 | predicate | ` index < text.length ` → ` !(index < text.length) ` | killed |
| compiler/url.ts:52 | negation | ` !this.settled ` → ` this.settled ` | killed |
| compiler/url.ts:54 | predicate | ` code === AMPERSAND && !escaped ` → ` !(code === AMPERSAND && !escaped) ` | killed |
| compiler/url.ts:54 | operand | ` code === AMPERSAND ` → ` true ` | killed |
| compiler/url.ts:54 | operand | ` !escaped ` → ` true ` | killed |
| compiler/url.ts:54 | predicate | ` code === AMPERSAND ` → ` !(code === AMPERSAND) ` | killed |
| compiler/url.ts:54 | negation | ` !escaped ` → ` escaped ` | killed |
| compiler/url.ts:54 | delete statement | ` this.mode = 'undecided'; ` → ` ; ` | killed |
| compiler/url.ts:55 | delete statement | ` this.read(code === 0 ? 0xfffd : code) ` → ` ; ` | killed |
| compiler/url.ts:55 | predicate | ` code === 0 ` → ` !(code === 0) ` | killed |
| compiler/url.ts:60 | predicate | ` !nonempty ` → ` !(!nonempty) ` | killed |
| compiler/url.ts:60 | negation | ` !nonempty ` → ` nonempty ` | killed |
| compiler/url.ts:61 | delete statement | ` this.checkpoints++ ` → ` ; ` | killed |
| compiler/url.ts:62 | predicate | ` this.settled ` → ` !(this.settled) ` | killed |
| compiler/url.ts:63 | predicate | ` this.mode === 'forbidden' &#124;&#124; this.mode === 'undecided' ` → ` !(this.mode === 'forbidden' &#124;&#124; this.mode === 'undecided') ` | killed |
| compiler/url.ts:63 | operand | ` this.mode === 'forbidden' ` → ` false ` | killed |
| compiler/url.ts:63 | operand | ` this.mode === 'undecided' ` → ` false ` | killed |
| compiler/url.ts:63 | predicate | ` this.mode === 'forbidden' ` → ` !(this.mode === 'forbidden') ` | killed |
| compiler/url.ts:63 | predicate | ` this.mode === 'undecided' ` → ` !(this.mode === 'undecided') ` | killed |
| compiler/url.ts:63 | predicate | ` this.mode === 'undecided' ` → ` !(this.mode === 'undecided') ` | killed |
| compiler/codegen.ts:62 | predicate | ` record?.dynamic && (record.url !== null &#124;&#124; (record.tag !== null && strip)) ` → ` !(record?.dynamic && (record.url !== null &#124;&#124; (record.tag !== null && strip))) ` | killed |
| compiler/codegen.ts:62 | operand | ` record?.dynamic ` → ` true ` | killed |
| compiler/codegen.ts:62 | operand | ` (record.url !== null &#124;&#124; (record.tag !== null && strip)) ` → ` true ` | equivalent: Records have URL or metadata; with strip false an extra metadata-only cut writes identical literals and performs no work at render. |
| compiler/codegen.ts:62 | operand | ` record.url !== null ` → ` false ` | killed |
| compiler/codegen.ts:62 | operand | ` (record.tag !== null && strip) ` → ` false ` | killed |
| compiler/codegen.ts:62 | predicate | ` record.url !== null ` → ` !(record.url !== null) ` | killed |
| compiler/codegen.ts:62 | operand | ` record.tag !== null ` → ` true ` | equivalent: A record without a URL necessarily has a metadata tag; with a URL the other OR operand already holds. |
| compiler/codegen.ts:62 | operand | ` strip ` → ` true ` | equivalent: With strip false an extra metadata-only cut writes identical literals; all metadata actions still have strip guards. |
| compiler/codegen.ts:62 | predicate | ` record.tag !== null ` → ` !(record.tag !== null) ` | killed |
| compiler/codegen.ts:64 | boolean | ` false ` → ` true ` | killed |
| compiler/codegen.ts:64 | generated comparison 8 | `` }.length>0` `` → `` }.length<=0` `` | killed |
| compiler/codegen.ts:65 | predicate | ` slot?.url ` → ` !(slot?.url) ` | killed |
| compiler/codegen.ts:65 | predicate | ` feed ` → ` !(feed) ` | killed |
| compiler/codegen.ts:66 | predicate | ` slot?.metadata && strip ` → ` !(slot?.metadata && strip) ` | killed |
| compiler/codegen.ts:66 | operand | ` slot?.metadata ` → ` true ` | killed |
| compiler/codegen.ts:66 | operand | ` strip ` → ` true ` | equivalent: With strip false no generated code initializes $$meta, so the additional guarded metadata write is inert. |
| compiler/codegen.ts:66 | generated assignment 47 | `` `if($$meta){$$meta.dynamic=true;$$meta.nonempty&#124;&#124;=${ `` → `` `if($$meta){$$meta.dynamic=true;$$meta.nonempty=${ `` | killed |
| compiler/codegen.ts:66 | generated comparison 8 | `` }.length>0;}` `` → `` }.length<=0;}` `` | killed |
| compiler/codegen.ts:74 | predicate | ` to > from ` → ` !(to > from) ` | killed |
| compiler/codegen.ts:76 | predicate | ` value.startsWith('\r\n', from) ` → ` !(value.startsWith('\r\n', from)) ` | killed |
| compiler/codegen.ts:76 | predicate | ` value.startsWith('\n', from) ` → ` !(value.startsWith('\n', from)) ` | killed |
| compiler/codegen.ts:77 | predicate | ` trackIndent && newline ` → ` !(trackIndent && newline) ` | killed |
| compiler/codegen.ts:77 | operand | ` trackIndent ` → ` true ` | equivalent: When metadata tracking is off, $$skipNewline remains false; the additional literal branch emits the same text. |
| compiler/codegen.ts:77 | operand | ` newline ` → ` true ` | equivalent: When newline is zero, both generated branches emit exactly the same literal. |
| compiler/codegen.ts:77 | delete statement | `` body += `if($$skipNewline){${buffer}+='${escapeJs(value.slice(from + newline, to))}';}else{${buffer}+='${text}';}` `` → ` ; ` | killed |
| compiler/codegen.ts:78 | delete statement | `` body += `${buffer}+='${text}';` `` → ` ; ` | killed |
| compiler/codegen.ts:79 | predicate | ` trackIndent ` → ` !(trackIndent) ` | killed |
| compiler/codegen.ts:79 | delete statement | ` body += '$$skipNewline=false;' ` → ` ; ` | killed |
| compiler/codegen.ts:80 | predicate | ` trackIndent ` → ` !(trackIndent) ` | killed |
| compiler/codegen.ts:83 | predicate | ` literal.charCodeAt(literal.length - trailing - 1) === 32 &#124;&#124; literal.charCodeAt(literal.length - trailing - 1) === 9 ` → ` !(literal.charCodeAt(literal.length - trailing - 1) === 32 &#124;&#124; literal.charCodeAt(literal.length - trailing - 1) === 9) ` | killed |
| compiler/codegen.ts:83 | operand | ` literal.charCodeAt(literal.length - trailing - 1) === 32 ` → ` false ` | killed |
| compiler/codegen.ts:83 | operand | ` literal.charCodeAt(literal.length - trailing - 1) === 9 ` → ` false ` | killed |
| compiler/codegen.ts:83 | predicate | ` literal.charCodeAt(literal.length - trailing - 1) === 32 ` → ` !(literal.charCodeAt(literal.length - trailing - 1) === 32) ` | killed |
| compiler/codegen.ts:83 | predicate | ` literal.charCodeAt(literal.length - trailing - 1) === 9 ` → ` !(literal.charCodeAt(literal.length - trailing - 1) === 9) ` | killed |
| compiler/codegen.ts:83 | delete statement | ` trailing++ ` → ` ; ` | killed |
| compiler/codegen.ts:84 | delete statement | `` body += trailing === literal.length ? `$$indent+=${trailing};` : `$$indent=${trailing};` `` → ` ; ` | killed |
| compiler/codegen.ts:84 | predicate | ` trailing === literal.length ` → ` !(trailing === literal.length) ` | killed |
| compiler/codegen.ts:86 | predicate | ` open?.url ` → ` !(open?.url) ` | killed |
| compiler/codegen.ts:86 | delete statement | `` body += `$$url.feed('${text}');` `` → ` ; ` | killed |
| compiler/codegen.ts:87 | predicate | ` open?.tag && strip ` → ` !(open?.tag && strip) ` | killed |
| compiler/codegen.ts:87 | operand | ` open?.tag ` → ` true ` | killed |
| compiler/codegen.ts:87 | operand | ` strip ` → ` true ` | equivalent: With strip false no generated code initializes $$meta, so the additional guarded literal metadata mark is inert. |
| compiler/codegen.ts:87 | delete statement | ` body += 'if($$meta)$$meta.nonempty=true;' ` → ` ; ` | killed |
| compiler/codegen.ts:89 | delete statement | ` from = to ` → ` ; ` | killed |
| compiler/codegen.ts:92 | predicate | ` record.kind ` → ` !(record.kind) ` | killed |
| compiler/codegen.ts:93 | case comparison | ` 'tag-open' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/codegen.ts:94 | predicate | ` !record.dynamic &#124;&#124; !strip ` → ` !(!record.dynamic &#124;&#124; !strip) ` | killed |
| compiler/codegen.ts:94 | operand | ` !record.dynamic ` → ` false ` | equivalent: A static tag capture has no dynamic target and cannot remove output; later live tags initialize their own captures. |
| compiler/codegen.ts:94 | operand | ` !strip ` → ` false ` | equivalent: With strip false target and close handling remain disabled, making the extra tag capture inert. |
| compiler/codegen.ts:94 | negation | ` !record.dynamic ` → ` record.dynamic ` | killed |
| compiler/codegen.ts:94 | negation | ` !strip ` → ` strip ` | killed |
| compiler/codegen.ts:95 | delete statement | ` literal(record.at) ` → ` ; ` | killed |
| compiler/codegen.ts:96 | delete statement | `` body += `$$tag={start:${buffer}.length-$$indent,target:null,current:null};` `` → ` ; ` | killed |
| compiler/codegen.ts:99 | case comparison | ` 'target' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/codegen.ts:100 | predicate | ` !record.tag.dynamic &#124;&#124; !strip ` → ` !(!record.tag.dynamic &#124;&#124; !strip) ` | killed |
| compiler/codegen.ts:100 | operand | ` !record.tag.dynamic ` → ` false ` | killed |
| compiler/codegen.ts:100 | operand | ` !strip ` → ` false ` | killed |
| compiler/codegen.ts:100 | negation | ` !record.tag.dynamic ` → ` record.tag.dynamic ` | killed |
| compiler/codegen.ts:100 | negation | ` !strip ` → ` strip ` | killed |
| compiler/codegen.ts:102 | delete statement | ` body += '$$tag.current=$$tag.target?null:($$tag.target={dynamic:false,nonempty:false});' ` → ` ; ` | killed |
| compiler/codegen.ts:104 | case comparison | ` 'value-open' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/codegen.ts:105 | predicate | ` !live(record) ` → ` !(!live(record)) ` | killed |
| compiler/codegen.ts:105 | negation | ` !live(record) ` → ` live(record) ` | killed |
| compiler/codegen.ts:106 | delete statement | ` literal(record.at) ` → ` ; ` | killed |
| compiler/codegen.ts:107 | delete statement | ` open = record ` → ` ; ` | killed |
| compiler/codegen.ts:108 | predicate | ` record.url ` → ` !(record.url) ` | killed |
| compiler/codegen.ts:108 | delete statement | `` body += `$$url=new $$UrlPrefix('${record.url}');` `` → ` ; ` | killed |
| compiler/codegen.ts:109 | predicate | ` record.tag && strip ` → ` !(record.tag && strip) ` | killed |
| compiler/codegen.ts:109 | operand | ` record.tag ` → ` true ` | killed |
| compiler/codegen.ts:109 | operand | ` strip ` → ` true ` | killed |
| compiler/codegen.ts:109 | delete statement | ` body += '$$meta=$$tag.current;' ` → ` ; ` | killed |
| compiler/codegen.ts:111 | case comparison | ` 'value-close' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/codegen.ts:112 | predicate | ` !open ` → ` !(!open) ` | killed |
| compiler/codegen.ts:112 | negation | ` !open ` → ` open ` | killed |
| compiler/codegen.ts:113 | delete statement | ` literal(record.at) ` → ` ; ` | killed |
| compiler/codegen.ts:114 | predicate | ` open.url ` → ` !(open.url) ` | killed |
| compiler/codegen.ts:114 | delete statement | ` body += '$$url.check($$url.checkpoints > 0);' ` → ` ; ` | killed |
| compiler/codegen.ts:114 | generated comparison 31 | ` '$$url.check($$url.checkpoints > 0);' ` → ` '$$url.check($$url.checkpoints <= 0);' ` | killed |
| compiler/codegen.ts:115 | delete statement | ` open = null ` → ` ; ` | killed |
| compiler/codegen.ts:117 | case comparison | ` 'tag-close' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/codegen.ts:118 | predicate | ` !record.tag.dynamic &#124;&#124; !strip ` → ` !(!record.tag.dynamic &#124;&#124; !strip) ` | killed |
| compiler/codegen.ts:118 | operand | ` !record.tag.dynamic ` → ` false ` | killed |
| compiler/codegen.ts:118 | operand | ` !strip ` → ` false ` | killed |
| compiler/codegen.ts:118 | negation | ` !record.tag.dynamic ` → ` record.tag.dynamic ` | killed |
| compiler/codegen.ts:118 | negation | ` !strip ` → ` strip ` | killed |
| compiler/codegen.ts:119 | delete statement | ` literal(record.at) ` → ` ; ` | killed |
| compiler/codegen.ts:121 | predicate | ` value.startsWith('\r\n', from) ` → ` !(value.startsWith('\r\n', from)) ` | killed |
| compiler/codegen.ts:121 | predicate | ` value.startsWith('\n', from) ` → ` !(value.startsWith('\n', from)) ` | killed |
| compiler/codegen.ts:122 | delete statement | `` body += `if($$tag.target?.dynamic&&!$$tag.target.nonempty){${buffer}=${buffer}.slice(0,$$tag.start);$$skipNewline=${newline.length === 0};}else{${buffer}+='${escapeJs(newline)}';$$skipNewline=false;}$$tag=null;` `` → ` ; ` | killed |
| compiler/codegen.ts:122 | generated operand 4 | `` `if($$tag.target?.dynamic&&!$$tag.target.nonempty){${ `` → `` `if(true&&!$$tag.target.nonempty){${ `` | killed |
| compiler/codegen.ts:122 | generated operand 27 | `` `if($$tag.target?.dynamic&&!$$tag.target.nonempty){${ `` → `` `if($$tag.target?.dynamic&&true){${ `` | killed |
| compiler/codegen.ts:122 | predicate | ` newline.length === 0 ` → ` !(newline.length === 0) ` | killed |
| compiler/codegen.ts:123 | delete statement | ` from += newline.length ` → ` ; ` | killed |
| compiler/codegen.ts:128 | delete statement | ` literal(value.length) ` → ` ; ` | killed |
| compiler/codegen.ts:134 | predicate | ` !scope.has(name) ` → ` !(!scope.has(name)) ` | killed |
| compiler/codegen.ts:134 | negation | ` !scope.has(name) ` → ` scope.has(name) ` | killed |
| compiler/codegen.ts:134 | delete statement | ` scope.add(name); ` → ` ; ` | killed |
| compiler/codegen.ts:134 | delete statement | ` localNames.push(name) ` → ` ; ` | killed |
| compiler/codegen.ts:136 | delete statement | ` declare(name) ` → ` ; ` | killed |
| compiler/codegen.ts:138 | predicate | ` node.kind ` → ` !(node.kind) ` | killed |
| compiler/codegen.ts:139 | case comparison | ` 'text' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/codegen.ts:139 | delete statement | ` emitText(node, buffer); ` → ` ; ` | killed |
| compiler/codegen.ts:140 | case comparison | ` 'output' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/codegen.ts:143 | delete statement | `` body += `{const ${value}=$$str(${expr})${node.raw ? '' : ".replace(/[&<>'\"]/g,c=>$$html[c])"};` `` → ` ; ` | killed |
| compiler/codegen.ts:143 | predicate | ` node.raw ` → ` !(node.raw) ` | killed |
| compiler/codegen.ts:143 | generated comparison 13 | ` ".replace(/[&<>'\"]/g,c=>$$html[c])" ` → ` ".replace(/[&>=>'\"]/g,c=>$$html[c])" ` | killed |
| compiler/codegen.ts:143 | generated comparison 14 | ` ".replace(/[&<>'\"]/g,c=>$$html[c])" ` → ` ".replace(/[&<<='\"]/g,c=>$$html[c])" ` | killed |
| compiler/codegen.ts:144 | delete statement | `` body += `${written(node.slot, value, true, !node.raw)}${buffer}+=${value};${trackIndent ? '$$indent=0;$$skipNewline=false;' : ''}}` `` → ` ; ` | killed |
| compiler/codegen.ts:144 | boolean | ` true ` → ` false ` | killed |
| compiler/codegen.ts:144 | negation | ` !node.raw ` → ` node.raw ` | killed |
| compiler/codegen.ts:144 | predicate | ` trackIndent ` → ` !(trackIndent) ` | killed |
| compiler/codegen.ts:147 | case comparison | ` 'const' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/codegen.ts:148 | delete statement | `` body += `const ${node.name}=(${expressionCode(node.expression, scope)}??'');`; `` → ` ; ` | killed |
| compiler/codegen.ts:148 | delete statement | ` declare(node.name); ` → ` ; ` | killed |
| compiler/codegen.ts:149 | case comparison | ` 'if' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/codegen.ts:150 | delete statement | `` node.branches.forEach((branch, index) => {       body += index === 0 ? `if(${expressionCode(branch.condition!, scope)}){` : branch.condition ? `else if(${expressionCode(branch.condition, scope)}){` : 'else{'       emitNodes(branch.children, scope, buffer)       body += '}'      }) `` → ` ; ` | killed |
| compiler/codegen.ts:151 | delete statement | `` body += index === 0 ? `if(${expressionCode(branch.condition!, scope)}){` : branch.condition ? `else if(${expressionCode(branch.condition, scope)}){` : 'else{' `` → ` ; ` | killed |
| compiler/codegen.ts:151 | predicate | ` index === 0 ` → ` !(index === 0) ` | killed |
| compiler/codegen.ts:151 | predicate | ` branch.condition ` → ` !(branch.condition) ` | killed |
| compiler/codegen.ts:152 | delete statement | ` emitNodes(branch.children, scope, buffer) ` → ` ; ` | killed |
| compiler/codegen.ts:153 | delete statement | ` body += '}' ` → ` ; ` | killed |
| compiler/codegen.ts:157 | case comparison | ` 'each' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/codegen.ts:160 | predicate | ` metadata.size > 0 ` → ` !(metadata.size > 0) ` | killed |
| compiler/codegen.ts:161 | operand | ` metadata.has('isFirst') ` → ` false ` | killed |
| compiler/codegen.ts:161 | operand | ` metadata.has('isLast') ` → ` false ` | killed |
| compiler/codegen.ts:162 | delete statement | `` body += `{const ${collection}=${pathCode(node.collection, scope)};if(${collection}){const ${array}=Array.isArray(${collection});` `` → ` ; ` | killed |
| compiler/codegen.ts:163 | predicate | ` needsCount ` → ` !(needsCount) ` | killed |
| compiler/codegen.ts:163 | delete statement | `` body += `const ${count}=${array}?${collection}.length:Object.keys(${collection}).length;` `` → ` ; ` | killed |
| compiler/codegen.ts:164 | predicate | ` node.index ` → ` !(node.index) ` | killed |
| compiler/codegen.ts:164 | delete statement | ` bindings.push(node.index) ` → ` ; ` | killed |
| compiler/codegen.ts:165 | predicate | ` needsCounter ` → ` !(needsCounter) ` | killed |
| compiler/codegen.ts:165 | delete statement | `` body += `let $$n${id}=0;` `` → ` ; ` | killed |
| compiler/codegen.ts:166 | predicate | ` node.index ` → ` !(node.index) ` | killed |
| compiler/codegen.ts:166 | delete statement | `` body += `for(const [${node.index},${node.item}] of ${array}?${collection}.entries():Object.entries(${collection})){` `` → ` ; ` | killed |
| compiler/codegen.ts:167 | delete statement | `` body += `for(const ${node.item} of (${array}?${collection}:Object.values(${collection}))){` `` → ` ; ` | killed |
| compiler/codegen.ts:168 | predicate | ` metadata.has('length') ` → ` !(metadata.has('length')) ` | killed |
| compiler/codegen.ts:168 | delete statement | `` body += `const length=${count};` `` → ` ; ` | killed |
| compiler/codegen.ts:169 | predicate | ` metadata.has('isFirst') ` → ` !(metadata.has('isFirst')) ` | killed |
| compiler/codegen.ts:169 | delete statement | `` body += `const isFirst=$$n${id}===0;` `` → ` ; ` | killed |
| compiler/codegen.ts:169 | generated comparison 1 | `` }===0;` `` → `` }!==0;` `` | killed |
| compiler/codegen.ts:170 | predicate | ` metadata.has('isLast') ` → ` !(metadata.has('isLast')) ` | killed |
| compiler/codegen.ts:170 | delete statement | `` body += `const isLast=$$n${id}===${count}-1;` `` → ` ; ` | killed |
| compiler/codegen.ts:170 | generated comparison 1 | ` }===${ ` → ` }!==${ ` | killed |
| compiler/codegen.ts:171 | delete statement | ` emitNodes(node.children, scope, buffer, bindings) ` → ` ; ` | killed |
| compiler/codegen.ts:172 | delete statement | `` body += `${needsCounter ? `$$n${id}++;` : ''}}}}` `` → ` ; ` | killed |
| compiler/codegen.ts:172 | predicate | ` needsCounter ` → ` !(needsCounter) ` | killed |
| compiler/codegen.ts:175 | case comparison | ` 'snippet' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/codegen.ts:178 | delete statement | `` body += `function ${variant.name}(${node.param ?? '$$unused'},$$url,$$meta){let ${snippetBuffer}='',$$tag=null,$$indent=0,$$skipNewline=false;` `` → ` ; ` | killed |
| compiler/codegen.ts:178 | drop generated declaration ,$$tag=null | `` }='',$$tag=null,$$indent=0,$$skipNewline=false;` `` → `` }='',$$indent=0,$$skipNewline=false;` `` | killed |
| compiler/codegen.ts:178 | drop generated declaration ,$$indent=0 | `` }='',$$tag=null,$$indent=0,$$skipNewline=false;` `` → `` }='',$$tag=null,$$skipNewline=false;` `` | killed |
| compiler/codegen.ts:178 | drop generated declaration ,$$skipNewline=false | `` }='',$$tag=null,$$indent=0,$$skipNewline=false;` `` → `` }='',$$tag=null,$$indent=0;` `` | killed |
| compiler/codegen.ts:179 | delete statement | ` emitNodes(variant.children, scope, snippetBuffer, node.param ? [node.param] : []) ` → ` ; ` | killed |
| compiler/codegen.ts:179 | predicate | ` node.param ` → ` !(node.param) ` | killed |
| compiler/codegen.ts:180 | delete statement | `` body += `return ${snippetBuffer};}` `` → ` ; ` | killed |
| compiler/codegen.ts:183 | predicate | ` node.js ` → ` !(node.js) ` | killed |
| compiler/codegen.ts:183 | delete statement | `` body += `function ${node.name}(v){return ${node.js}(v);}` `` → ` ; ` | killed |
| compiler/codegen.ts:186 | case comparison | ` 'render' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/codegen.ts:190 | predicate | ` node.slot?.url ` → ` !(node.slot?.url) ` | killed |
| compiler/codegen.ts:190 | delete statement | `` body += `{const ${checkpoint}=$$url.checkpoints;` `` → ` ; ` | killed |
| compiler/codegen.ts:191 | delete statement | ` body += '{' ` → ` ; ` | killed |
| compiler/codegen.ts:192 | delete statement | `` body += `const ${value}=${node.specialization ?? node.name}(${node.argument ? expressionCode(node.argument, scope) : 'undefined'},$$url,$$meta);` `` → ` ; ` | killed |
| compiler/codegen.ts:192 | predicate | ` node.argument ` → ` !(node.argument) ` | killed |
| compiler/codegen.ts:193 | delete statement | `` body += `${written(node.slot, value, false, false, `$$url.checkpoints!==${checkpoint}`)}${buffer}+=${value};${trackIndent ? '$$indent=0;$$skipNewline=false;' : ''}}` `` → ` ; ` | killed |
| compiler/codegen.ts:193 | boolean | ` false ` → ` true ` | killed |
| compiler/codegen.ts:193 | boolean | ` false ` → ` true ` | equivalent: The escaped argument is unused when feed is false for a snippet that already fed its bytes. |
| compiler/codegen.ts:193 | generated comparison 18 | `` `$$url.checkpoints!==${ `` → `` `$$url.checkpoints===${ `` | killed |
| compiler/codegen.ts:193 | predicate | ` trackIndent ` → ` !(trackIndent) ` | killed |
| compiler/codegen.ts:196 | case comparison | ` 'js' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/codegen.ts:197 | delete statement | `` body += `{const $$j=$$str(${node.awaits ? `await (async()=>{${node.code}})()` : `(()=>{${node.code}})()`});` `` → ` ; ` | killed |
| compiler/codegen.ts:197 | predicate | ` node.awaits ` → ` !(node.awaits) ` | killed |
| compiler/codegen.ts:198 | delete statement | `` body += `${written(node.slot, '$$j', true)}${buffer}+=$$j;${trackIndent ? '$$indent=0;$$skipNewline=false;' : ''}}` `` → ` ; ` | killed |
| compiler/codegen.ts:198 | boolean | ` true ` → ` false ` | killed |
| compiler/codegen.ts:198 | predicate | ` trackIndent ` → ` !(trackIndent) ` | killed |
| compiler/codegen.ts:200 | case comparison | ` 'partial' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/codegen.ts:200 | delete statement | `` fail('G4002', `Partial ${JSON.stringify(node.path)} was not expanded before code generation`, node.span) `` → ` ; ` | killed |
| compiler/codegen.ts:203 | delete statement | ` scope.delete(name) ` → ` ; ` | killed |
| compiler/lexer.ts:20 | predicate | ` nextNewline >= 0 && nextNewline < cursor ` → ` !(nextNewline >= 0 && nextNewline < cursor) ` | killed |
| compiler/lexer.ts:20 | operand | ` nextNewline >= 0 ` → ` true ` | killed |
| compiler/lexer.ts:20 | operand | ` nextNewline < cursor ` → ` true ` | killed |
| compiler/lexer.ts:20 | predicate | ` nextNewline >= 0 ` → ` !(nextNewline >= 0) ` | killed |
| compiler/lexer.ts:20 | predicate | ` nextNewline < cursor ` → ` !(nextNewline < cursor) ` | killed |
| compiler/lexer.ts:21 | delete statement | ` newline = nextNewline; ` → ` ; ` | killed |
| compiler/lexer.ts:21 | delete statement | ` nextNewline = text.indexOf('\n', newline + 1) ` → ` ; ` | killed |
| compiler/lexer.ts:24 | predicate | ` newline >= textStart ` → ` !(newline >= textStart) ` | killed |
| compiler/lexer.ts:25 | delete statement | ` lineStart = newline + 1 ` → ` ; ` | killed |
| compiler/lexer.ts:26 | drop returned value | ` text.slice(lineStart, cursor).trim() === '' ` → ` undefined ` | killed |
| compiler/lexer.ts:26 | predicate | ` text.slice(lineStart, cursor).trim() === '' ` → ` !(text.slice(lineStart, cursor).trim() === '') ` | killed |
| compiler/lexer.ts:28 | drop returned value | ` lineIsWhitespace && text.slice(textStart, cursor).trim() === '' ` → ` undefined ` | killed |
| compiler/lexer.ts:28 | operand | ` lineIsWhitespace ` → ` true ` | killed |
| compiler/lexer.ts:28 | operand | ` text.slice(textStart, cursor).trim() === '' ` → ` true ` | killed |
| compiler/lexer.ts:28 | predicate | ` text.slice(textStart, cursor).trim() === '' ` → ` !(text.slice(textStart, cursor).trim() === '') ` | killed |
| compiler/lexer.ts:88 | predicate | ` text.startsWith('{@js}', cursor) ` → ` !(text.startsWith('{@js}', cursor)) ` | killed |
| compiler/lexer.ts:90 | predicate | ` close < 0 ` → ` !(close < 0) ` | killed |
| compiler/lexer.ts:90 | delete statement | ` cursor++; ` → ` ; ` | killed |
| compiler/lexer.ts:91 | delete statement | ` pushText(cursor) ` → ` ; ` | killed |
| compiler/lexer.ts:93 | delete statement | ` tokens.push({ kind: 'js', value: text.slice(cursor + 5, close), valueStart: cursor + 5, span: span(source, cursor, end) }) ` → ` ; ` | killed |
| compiler/lexer.ts:94 | delete statement | ` cursor = end; ` → ` ; ` | killed |
| compiler/lexer.ts:94 | delete statement | ` textStart = end; ` → ` ; ` | killed |
| compiler/lexer.ts:94 | delete statement | ` lineIsWhitespace = false; ` → ` ; ` | killed |
| compiler/lexer.ts:94 | boolean | ` false ` → ` true ` | killed |
| compiler/index.ts:45 | boolean | ` false ` → ` true ` | killed |
| compiler/index.ts:46 | predicate | ` node.kind === 'text' ` → ` !(node.kind === 'text') ` | killed |
| compiler/index.ts:46 | drop returned value | ` stripText(node, root && index === nodes.length - 1) ` → ` undefined ` | killed |
| compiler/index.ts:46 | operand | ` root ` → ` true ` | killed |
| compiler/index.ts:46 | operand | ` index === nodes.length - 1 ` → ` true ` | killed |
| compiler/index.ts:46 | predicate | ` index === nodes.length - 1 ` → ` !(index === nodes.length - 1) ` | killed |
| compiler/index.ts:47 | predicate | ` node.kind === 'if' ` → ` !(node.kind === 'if') ` | killed |
| compiler/index.ts:47 | drop returned value | ` { ...node, branches: node.branches.map(branch => ({ ...branch, children: stripStatic(branch.children) })) } ` → ` undefined ` | killed |
| compiler/index.ts:48 | predicate | ` node.kind === 'each' &#124;&#124; node.kind === 'snippet' ` → ` !(node.kind === 'each' &#124;&#124; node.kind === 'snippet') ` | killed |
| compiler/index.ts:48 | operand | ` node.kind === 'each' ` → ` false ` | killed |
| compiler/index.ts:48 | operand | ` node.kind === 'snippet' ` → ` false ` | killed |
| compiler/index.ts:48 | predicate | ` node.kind === 'each' ` → ` !(node.kind === 'each') ` | killed |
| compiler/index.ts:48 | predicate | ` node.kind === 'snippet' ` → ` !(node.kind === 'snippet') ` | killed |
| compiler/index.ts:48 | drop returned value | ` { ...node, children: stripStatic(node.children) } ` → ` undefined ` | killed |
| compiler/index.ts:49 | predicate | ` node.kind === 'partial' ` → ` !(node.kind === 'partial') ` | killed |
| compiler/index.ts:49 | drop returned value | ` { ...node, children: stripStatic(node.children ?? []) } ` → ` undefined ` | killed |
| compiler/index.ts:50 | drop returned value | ` node ` → ` undefined ` | killed |
| compiler/index.ts:58 | predicate | ` options.includes ` → ` !(options.includes) ` | killed |
| compiler/index.ts:59 | delete statement | ` diagnostics.push(...lintAst(ast, options)) ` → ` ; ` | killed |
| compiler/index.ts:60 | predicate | ` !diagnostics.some(item => item.severity === 'error') ` → ` !(!diagnostics.some(item => item.severity === 'error')) ` | killed |
| compiler/index.ts:60 | negation | ` !diagnostics.some(item => item.severity === 'error') ` → ` diagnostics.some(item => item.severity === 'error') ` | killed |
| compiler/index.ts:60 | predicate | ` item.severity === 'error' ` → ` !(item.severity === 'error') ` | killed |
| compiler/index.ts:61 | predicate | ` options.strip ` → ` !(options.strip) ` | killed |
| compiler/index.ts:61 | boolean | ` true ` → ` false ` | killed |
| compiler/index.ts:62 | delete statement | ` readContexts(prepared) ` → ` ; ` | killed |
| compiler/index.ts:65 | predicate | ` !(error instanceof GalleyDiagnosticError) ` → ` !(!(error instanceof GalleyDiagnosticError)) ` | killed |
| compiler/index.ts:65 | negation | ` !(error instanceof GalleyDiagnosticError) ` → ` (error instanceof GalleyDiagnosticError) ` | killed |
| compiler/index.ts:66 | delete statement | ` diagnostics.push(error.diagnostic) ` → ` ; ` | killed |
| compiler/index.ts:68 | drop returned value | ` diagnostics ` → ` undefined ` | killed |
| compiler/index.ts:80 | predicate | ` options.allowCode === true ` → ` !(options.allowCode === true) ` | killed |
| compiler/index.ts:80 | boolean | ` true ` → ` false ` | killed |
| compiler/index.ts:81 | predicate | ` options.knownFilters ` → ` !(options.knownFilters) ` | killed |
| compiler/index.ts:83 | predicate | ` diagnostic.severity === 'error' ` → ` !(diagnostic.severity === 'error') ` | killed |
| compiler/index.ts:84 | predicate | ` fatal ` → ` !(fatal) ` | killed |
| compiler/index.ts:85 | predicate | ` options.strip ` → ` !(options.strip) ` | killed |
| compiler/index.ts:85 | boolean | ` true ` → ` false ` | killed |
| compiler/index.ts:87 | predicate | ` program.async ` → ` !(program.async) ` | killed |
| compiler/index.ts:89 | drop returned value | ` { async: true, diagnostics, render, ...(options.debug ? { source: program.body } : {}) } ` → ` undefined ` | killed |
| compiler/index.ts:89 | boolean | ` true ` → ` false ` | killed |
| compiler/index.ts:89 | predicate | ` options.debug ` → ` !(options.debug) ` | killed |
| compiler/index.ts:92 | drop returned value | ` { async: false, diagnostics, render, ...(options.debug ? { source: program.body } : {}) } ` → ` undefined ` | killed |
| compiler/index.ts:92 | boolean | ` false ` → ` true ` | killed |
| compiler/index.ts:92 | predicate | ` options.debug ` → ` !(options.debug) ` | killed |
| compiler/lint.ts:5 | set 'String' | ` ['String', 'Object', 'Array', 'TypeError'] ` → ` ['Object', 'Array', 'TypeError'] ` | killed |
| compiler/lint.ts:5 | set 'Object' | ` ['String', 'Object', 'Array', 'TypeError'] ` → ` ['String', 'Array', 'TypeError'] ` | killed |
| compiler/lint.ts:5 | set 'Array' | ` ['String', 'Object', 'Array', 'TypeError'] ` → ` ['String', 'Object', 'TypeError'] ` | killed |
| compiler/lint.ts:5 | set 'TypeError' | ` ['String', 'Object', 'Array', 'TypeError'] ` → ` ['String', 'Object', 'Array'] ` | killed |
| compiler/lint.ts:17 | predicate | ` expr.kind === 'pipe' ` → ` !(expr.kind === 'pipe') ` | killed |
| compiler/lint.ts:19 | predicate | ` options.knownFilters && !options.knownFilters.has(pipe.name) ` → ` !(options.knownFilters && !options.knownFilters.has(pipe.name)) ` | killed |
| compiler/lint.ts:19 | operand | ` options.knownFilters ` → ` true ` | killed |
| compiler/lint.ts:19 | operand | ` !options.knownFilters.has(pipe.name) ` → ` true ` | killed |
| compiler/lint.ts:19 | negation | ` !options.knownFilters.has(pipe.name) ` → ` options.knownFilters.has(pipe.name) ` | killed |
| compiler/lint.ts:19 | delete statement | `` report({ code: 'G3001', severity: 'warning', message: `Unknown pipe ${JSON.stringify(pipe.name)}`, span: pipe.span, help: 'Check the spelling or add the custom filter to knownFilters.' }) `` → ` ; ` | killed |
| compiler/lint.ts:20 | delete statement | ` expression(arg) ` → ` ; ` | killed |
| compiler/lint.ts:25 | predicate | ` current ` → ` !(current) ` | killed |
| compiler/lint.ts:27 | predicate | ` snippet ` → ` !(snippet) ` | killed |
| compiler/lint.ts:27 | drop returned value | ` snippet ` → ` undefined ` | killed |
| compiler/lint.ts:31 | boolean | ` false ` → ` true ` | killed |
| compiler/lint.ts:32 | predicate | ` sameScope ` → ` !(sameScope) ` | killed |
| compiler/lint.ts:35 | predicate | ` node.kind === 'partial' && node.children ` → ` !(node.kind === 'partial' && node.children) ` | killed |
| compiler/lint.ts:35 | operand | ` node.kind === 'partial' ` → ` true ` | killed |
| compiler/lint.ts:35 | operand | ` node.children ` → ` true ` | killed |
| compiler/lint.ts:35 | predicate | ` node.kind === 'partial' ` → ` !(node.kind === 'partial') ` | killed |
| compiler/lint.ts:35 | delete statement | ` declare(node.children); ` → ` ; ` | killed |
| compiler/lint.ts:36 | predicate | ` node.kind !== 'snippet' ` → ` !(node.kind !== 'snippet') ` | killed |
| compiler/lint.ts:37 | delete statement | ` declarations.add(node) ` → ` ; ` | killed |
| compiler/lint.ts:38 | predicate | ` local.has(node.name) ` → ` !(local.has(node.name)) ` | killed |
| compiler/lint.ts:39 | delete statement | ` duplicate.add(node) ` → ` ; ` | killed |
| compiler/lint.ts:40 | delete statement | `` report({ code: 'G3003', severity: 'error', message: `Duplicate snippet ${JSON.stringify(node.name)} in the same block`, span: node.span, help: 'Rename one snippet or move it to a different lexical block.' }) `` → ` ; ` | killed |
| compiler/lint.ts:41 | delete statement | ` local.set(node.name, node) ` → ` ; ` | killed |
| compiler/lint.ts:44 | predicate | ` !sameScope ` → ` !(!sameScope) ` | killed |
| compiler/lint.ts:44 | negation | ` !sameScope ` → ` sameScope ` | killed |
| compiler/lint.ts:44 | delete statement | ` declare(nodes) ` → ` ; ` | killed |
| compiler/lint.ts:45 | predicate | ` sameScope ` → ` !(sameScope) ` | killed |
| compiler/lint.ts:47 | predicate | ` (node.kind === 'const' &#124;&#124; node.kind === 'snippet') && GENERATED_GLOBALS.has(node.name) ` → ` !((node.kind === 'const' &#124;&#124; node.kind === 'snippet') && GENERATED_GLOBALS.has(node.name)) ` | killed |
| compiler/lint.ts:47 | operand | ` (node.kind === 'const' &#124;&#124; node.kind === 'snippet') ` → ` true ` | killed |
| compiler/lint.ts:47 | operand | ` GENERATED_GLOBALS.has(node.name) ` → ` true ` | killed |
| compiler/lint.ts:47 | operand | ` node.kind === 'const' ` → ` false ` | killed |
| compiler/lint.ts:47 | operand | ` node.kind === 'snippet' ` → ` false ` | killed |
| compiler/lint.ts:47 | predicate | ` node.kind === 'const' ` → ` !(node.kind === 'const') ` | killed |
| compiler/lint.ts:47 | predicate | ` node.kind === 'snippet' ` → ` !(node.kind === 'snippet') ` | killed |
| compiler/lint.ts:47 | delete statement | `` report({ code: 'G3007', severity: 'error', message: `The name ${node.name} is needed by the generated code`, span: node.span }) `` → ` ; ` | killed |
| compiler/lint.ts:48 | predicate | ` node.kind ` → ` !(node.kind) ` | killed |
| compiler/lint.ts:49 | case comparison | ` 'output' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/lint.ts:49 | delete statement | ` expression(node.expression); ` → ` ; ` | killed |
| compiler/lint.ts:49 | predicate | ` node.raw ` → ` !(node.raw) ` | killed |
| compiler/lint.ts:49 | delete statement | ` report({ code: 'G3002', severity: 'info', message: 'Raw output bypasses HTML escaping', span: node.span, help: 'Use raw output only for trusted HTML.' }); ` → ` ; ` | killed |
| compiler/lint.ts:50 | case comparison | ` 'const' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/lint.ts:50 | delete statement | ` expression(node.expression); ` → ` ; ` | killed |
| compiler/lint.ts:51 | case comparison | ` 'if' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/lint.ts:51 | predicate | ` branch.condition ` → ` !(branch.condition) ` | killed |
| compiler/lint.ts:51 | delete statement | ` expression(branch.condition); ` → ` ; ` | killed |
| compiler/lint.ts:51 | delete statement | ` visit(branch.children, scope) ` → ` ; ` | killed |
| compiler/lint.ts:52 | case comparison | ` 'each' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/lint.ts:52 | delete statement | ` visit(node.children, scope); ` → ` ; ` | killed |
| compiler/lint.ts:53 | case comparison | ` 'partial' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/lint.ts:53 | predicate | ` node.children ` → ` !(node.children) ` | killed |
| compiler/lint.ts:53 | delete statement | ` visit(node.children, scope, true); ` → ` ; ` | killed |
| compiler/lint.ts:53 | boolean | ` true ` → ` false ` | killed |
| compiler/lint.ts:54 | case comparison | ` 'snippet' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/lint.ts:54 | delete statement | ` visit(node.children, scope); ` → ` ; ` | killed |
| compiler/lint.ts:55 | case comparison | ` 'render' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/lint.ts:57 | predicate | ` snippet ` → ` !(snippet) ` | killed |
| compiler/lint.ts:57 | delete statement | ` used.add(snippet) ` → ` ; ` | killed |
| compiler/lint.ts:58 | delete statement | `` report({ code: 'G3005', severity: 'error', message: `Snippet ${JSON.stringify(node.name)} is not visible in this block`, span: node.span, help: 'Declare the snippet in this block or an enclosing block before rendering it.' }) `` → ` ; ` | killed |
| compiler/lint.ts:59 | predicate | ` node.argument ` → ` !(node.argument) ` | killed |
| compiler/lint.ts:59 | delete statement | ` expression(node.argument) ` → ` ; ` | killed |
| compiler/lint.ts:62 | case comparison | ` 'js' ` → ` "__mutation_unreachable_case__" ` | killed |
| compiler/lint.ts:62 | predicate | ` !options.allowCode ` → ` !(!options.allowCode) ` | killed |
| compiler/lint.ts:62 | negation | ` !options.allowCode ` → ` options.allowCode ` | killed |
| compiler/lint.ts:62 | delete statement | ` report({ code: 'G3004', severity: 'error', message: '{@js} requires allowCode: true', span: node.span }); ` → ` ; ` | killed |
| compiler/lint.ts:66 | delete statement | ` visit(ast.children, null) ` → ` ; ` | killed |
| compiler/lint.ts:67 | predicate | ` !used.has(node) && !duplicate.has(node) ` → ` !(!used.has(node) && !duplicate.has(node)) ` | killed |
| compiler/lint.ts:67 | operand | ` !used.has(node) ` → ` true ` | killed |
| compiler/lint.ts:67 | operand | ` !duplicate.has(node) ` → ` true ` | killed |
| compiler/lint.ts:67 | negation | ` !used.has(node) ` → ` used.has(node) ` | killed |
| compiler/lint.ts:67 | negation | ` !duplicate.has(node) ` → ` duplicate.has(node) ` | killed |
| compiler/lint.ts:67 | delete statement | `` report({ code: 'G3006', severity: 'warning', message: `Snippet ${JSON.stringify(node.name)} is never rendered`, span: node.span }) `` → ` ; ` | killed |
| compiler/lint.ts:68 | drop returned value | ` diagnostics ` → ` undefined ` | killed |

1146 generated; 1128 killed; 18 equivalent; 0 unreviewed survivors.
1 fallback kills confirmed by a second full-suite run.

Mutation inputs SHA-256: 33cf90607025f8739aa4ae6f8dce1835ff998d681c9e4f47b221e4fc6041969f
