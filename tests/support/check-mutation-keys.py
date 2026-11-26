"""Keys follow mutated code and its semantic context, independent of earlier source lines."""
from pathlib import Path
import json
import subprocess
import tempfile

root = Path(__file__).resolve().parents[2]
generator = str(root / 'tests/support/generate-mutants.ts')

def generate_mutations(directory):
    return json.loads(subprocess.run(['bun', generator], cwd=directory, capture_output=True, encoding='utf-8', check=True, timeout=30).stdout)

original = generate_mutations(root)
with tempfile.TemporaryDirectory(prefix='galley-mutation-keys-') as directory:
    target = Path(directory)
    for file in {mutant['file'] for mutant in original}:
        path = target / file
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(('// Earlier unrelated source lines must not change equivalence keys.\n\n' + (root / file).read_text(encoding='utf-8')).encode('utf-8'))
    shifted = generate_mutations(target)
assert [m['id'] for m in original] == [m['id'] for m in shifted]
assert all(b['start'] > a['start'] for a, b in zip(original, shifted))
assert any(m['kind'] == 'delete statement' and '.push(' in m['before'] for m in original)
assert any(m['kind'] == 'delete statement' and ' = ' in m['before'] for m in original)
assert any(m['kind'] == 'drop returned value' for m in original)
assert any(m['kind'] == 'drop generated declaration ,$$indent=0' for m in original)
assert any(m['file'] == 'compiler/lint.ts' for m in original)
for file, statements in {
    'util.ts': ['candidate === value', 'pluralRules.size < 100', 'pluralRules.set(locale, rules)'],
    'compiler/filters.ts': ["'knownFilters' in options", "typeof filter !== 'function'", 'Object.create(null)', 'Object.freeze(filters)'],
    'compiler/stringify.ts': ['warnOnFailure = previous', 'new Error(`G5002:'],
    'compiler/analysis.ts': ["contains(nodes, 'js')", 'collectExpressionMetadata(node.collection, metadata)', 'collectExpressionMetadata(expression.operand, used)', 'checkNumbers(node.collection)', 'checkTemplateNumbers(node.fallback'],
    'compiler/expression.ts': ['checkLeadingZero(raw, at)', 'raw.length > 1', 'trimSpan(rawInput, atInput)', 'literal(raw, at)', 'checkRoots(expression.left)', 'checkRoots(expression.input)', 'splitTopLevel(raw, operator).length > 0', 'checkNumber(segment.number.raw', 'checkNumber(expression.raw, expression.span)'],
    'compiler/path.ts': ['checkPathRoots(segment.value)', "fail('G1106'", "fail('G1107'", 'checkLeadingZero(raw, at)'],
    'compiler/parser.ts': ["braces.set(token.span.start", "continuations === 'if'", 'fallback: fallback.children', 'checkPathRoots(collection)', 'checkRoots(argument)', 'seen.add(param)'],
    'compiler/index.ts': ['checkTemplateNumbers(ast.children)'],
}.items():
    for statement in statements:
        assert any(m['file'] == file and statement in m['before'] for m in original), statement
for statement in ['JSON.stringify(expression.value)', 'options.strictUndefined', 'condition ? input', 'checked(expressionCode(node.expression', 'checked(pathCode(node.collection', 'if(v===undefined)']:
    assert any(m['file'] == 'compiler/codegen.ts' and statement in m['before'] for m in original), statement
for kind in ['expression source offset', 'expression source length', 'span arithmetic']:
    assert any(m['file'] == 'compiler/parser.ts' and m['kind'] == kind for m in original), kind
for kind in ['cache bound below', 'cache bound above', 'registry prototype', 'registry freeze', 'pipe expression span', 'pipe result span', 'untrimmed pipe expression', 'nonadjacent brace escape']:
    assert any(m['kind'] == kind for m in original), kind
assert sum(m['kind'] == 'pipe name span' for m in original) == 2
assert sum(m['kind'] == 'pipe grouping help' for m in original) == 2
assert {m['before'] for m in original if m['kind'] == 'drop branch continuation'} == {"'if'", "'each'"}
assert sum(m['kind'] == 'repeat code option read' for m in original) == 3
assert sum(m['kind'] == 'async flag' for m in original) == 1
assert any(m['file'] == 'compiler/codegen.ts' and m['kind'] == 'drop generated one-based offset' for m in original)
for name in ['length', 'isFirst', 'isLast', 'position']:
    assert any(m['file'] == 'compiler/ast.ts' and m['kind'] == f"set '{name}'" for m in original), name
assert any(m['file'] == 'compiler/index.ts' and 'lint' in json.loads(m['id'])[1] for m in original)
for statement in ['scope.add(name);', 'localNames.push(name)', 'declare(name)', 'declare(node.name);', 'bindings.push(node.index)', 'scope.delete(name)']:
    assert any(m['file'] == 'compiler/codegen.ts' and statement in m['before'] for m in original), statement
for statement in ['newline = nextNewline;', "nextNewline = text.indexOf('\\n', newline + 1)", 'lineStart = newline + 1', 'lineIsWhitespace &&']:
    assert any(m['file'] == 'compiler/lexer.ts' and statement in m['before'] for m in original), statement
for statement in ['visit(node.children)', 'visit(children)']:
    assert any(m['file'] == 'compiler/analysis.ts' and m['kind'] == 'delete statement' and m['before'] == statement for m in original), statement
for file, context, statement in [
    ('compiler/codegen.ts', 'hasMetadata', 'hasMetadata(node.fallback'),
    ('compiler/index.ts', 'expandPartials', 'node.fallback'),
    ('compiler/analysis.ts', 'contains', 'contains(node.fallback'),
    ('compiler/analysis.ts', 'annotate', 'node.fallback'),
    ('compiler/index.ts', 'codeAllowed', 'options.allowCode === true'),
    ('compiler/codegen.ts', 'generate', 'async: allowCode'),
    ('compiler/context.ts', 'recordStart', 'currentVariant.start'),
    ('compiler/context.ts', 'visit', 'startCallers.push(currentVariant)'),
    ('compiler/context.ts', 'readContexts', 'caller.start = pendingStarts[index]!.start'),
    ('compiler/parser.ts', 'parseTokens', 'literalBraces.set(source, braces)'),
    ('compiler/parser.ts', 'parseChildren', "continuations === 'each'"),
]:
    assert any(m['file'] == file and context in json.loads(m['id'])[1] and statement in m['before'] for m in original), (file, context, statement)
print(f'{len(original)} stable keys; push, assignment, return, snippet state and lint mutations present')
