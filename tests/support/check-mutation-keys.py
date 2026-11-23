"""Keys follow mutated code and its semantic context, independent of earlier source lines."""
from pathlib import Path
import json
import subprocess
import tempfile

root = Path(__file__).resolve().parents[2]
generator = str(root / 'tests/support/generate-mutants.ts')

def inventory(directory):
    return json.loads(subprocess.run(['bun', generator], cwd=directory, capture_output=True, text=True, check=True, timeout=30).stdout)

original = inventory(root)
with tempfile.TemporaryDirectory(prefix='galley-mutation-keys-') as directory:
    target = Path(directory)
    for file in {mutant['file'] for mutant in original}:
        path = target / file
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text('// Earlier unrelated source lines must not change equivalence keys.\n\n' + (root / file).read_text())
    shifted = inventory(target)
assert [m['id'] for m in original] == [m['id'] for m in shifted]
assert all(b['start'] > a['start'] for a, b in zip(original, shifted))
assert any(m['kind'] == 'delete statement' and '.push(' in m['before'] for m in original)
assert any(m['kind'] == 'delete statement' and ' = ' in m['before'] for m in original)
assert any(m['kind'] == 'drop returned value' for m in original)
assert any(m['kind'] == 'drop generated declaration ,$$indent=0' for m in original)
assert any(m['file'] == 'compiler/lint.ts' for m in original)
assert any(m['file'] == 'compiler/index.ts' and 'lint' in json.loads(m['id'])[1] for m in original)
for statement in ['scope.add(name);', 'localNames.push(name)', 'declare(name)', 'declare(node.name);', 'bindings.push(node.index)', 'scope.delete(name)']:
    assert any(m['file'] == 'compiler/codegen.ts' and statement in m['before'] for m in original), statement
for statement in ['newline = nextNewline;', "nextNewline = text.indexOf('\\n', newline + 1)", 'lineStart = newline + 1', 'lineIsWhitespace &&']:
    assert any(m['file'] == 'compiler/lexer.ts' and statement in m['before'] for m in original), statement
print(f'{len(original)} stable keys; push, assignment, return, snippet state and lint mutations present')
