"""Generate reader/URL mutations in a copy; reuse only a complete, matching reviewed run."""
from pathlib import Path
import hashlib
import json
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / 'differential/MUTATIONS.md'
# The generator owns the mutated-file list; the focused test selection is a separate execution concern.
TESTS = ['tests/' + name for name in ['strict-acceptor.test.ts', 'mechanical-reader.test.ts', 'second-correction.test.ts', 'url-static-start.test.ts', 'url-static-suffix.test.ts', 'url-end-check.test.ts', 'mutation-flow.test.ts', 'lint-mutations.test.ts', 'third-correction.test.ts', 'fourth-correction.test.ts', 'growth-semantics.test.ts', 'config-regression.test.ts', 'comment-search.test.ts', 'lint-async.test.ts', 'context-model.test.ts', 'url-attributes.test.ts', 'review-findings.test.ts', 'stripped-marks.test.ts', 'compiler.test.ts', 'loops.test.ts']]
FAILURE = re.compile(r'^\(fail\) (.+?)(?: \[[0-9.]+ms\])?$', re.MULTILINE)
HASH_LINE = 'Mutation inputs SHA-256: '


def input_hash(mutations):
    # All tests and support files matter: survivors run the full suite. Hash paths as well as contents.
    paths = {m['file'] for m in mutations} | {'tests/mutate-context.py', 'bunfig.toml', 'package.json', 'bun.lock'}
    paths |= {p.relative_to(ROOT).as_posix() for p in (ROOT / 'tests').rglob('*') if p.is_file() and p.suffix in {'.ts', '.py', '.json'}}
    # Include unmutated compiler/runtime dependencies too: changing them can change whether a mutant dies.
    paths |= {p.relative_to(ROOT).as_posix() for p in (ROOT / 'compiler').glob('*.ts')}
    paths |= {'index.ts', 'util.ts', 'types.ts', 'differential/corpus.json', 'differential/pins.json'}
    paths |= {p.relative_to(ROOT).as_posix() for p in (ROOT / 'differential').glob('*.ts')}
    digest = hashlib.sha256()
    for name in sorted(paths):
        contents = (ROOT / name).read_bytes()
        digest.update(name.encode() + b'\0' + str(len(contents)).encode() + b'\0' + contents)
    version = subprocess.run(['bun', '--version'], capture_output=True, check=True, timeout=10).stdout
    digest.update(version)
    return digest.hexdigest()


def code_span(value):
    fence = '`' * (1 + max((len(run) for run in re.findall(r'`+', value)), default=0))
    return f'{fence} {escape(value)} {fence}'


def escape(value):
    return value.replace('|', '&#124;').replace('\n', ' ').replace('\t', ' ')


def run():
    if sys.argv[1:] not in ([], ['--force']):
        raise SystemExit('usage: python3 tests/mutate-context.py [--force]')
    result = subprocess.run(['bun', 'tests/support/generate-mutants.ts'], cwd=ROOT, capture_output=True, text=True, check=True, timeout=30)
    mutations = json.loads(result.stdout)
    fingerprint = input_hash(mutations)
    previous = REPORT.read_text().splitlines()
    if sys.argv[1:] != ['--force'] and previous and previous[-1] == HASH_LINE + fingerprint:
        print('Mutation inputs unchanged; using differential/MUTATIONS.md.')
        return
    equivalents = json.loads((ROOT / 'tests/support/mutation-equivalents.json').read_text())
    assert not set(equivalents) - {m['id'] for m in mutations}, 'Stale equivalence entries'
    rows, survivors = [], []
    with tempfile.TemporaryDirectory(prefix='galley-mutations-') as directory:
        target = Path(directory)
        # Copy only execution inputs. Neither evidence nor the working compiler is ever mutated.
        for name in ['compiler', 'tests', 'differential']:
            shutil.copytree(ROOT / name, target / name)
        for name in ['index.ts', 'types.ts', 'util.ts', 'package.json', 'bunfig.toml', 'tsconfig.json', 'tsconfig.typecheck.json']:
            shutil.copyfile(ROOT / name, target / name)
        (target / 'node_modules').symlink_to(ROOT / 'node_modules', target_is_directory=True)
        focused = ['bun', 'test', '--bail', '--preload', './tests/support/mutation-budget.ts', '--test-name-pattern', '^(?!G-29:)', *TESTS]
        full = ['bun', 'test', '--bail', '--preload', './tests/support/mutation-budget.ts']
        subprocess.run(focused, cwd=target, capture_output=True, text=True, check=True, timeout=30)
        for index, mutant in enumerate(mutations):
            file = target / mutant['file']
            original = file.read_text()
            assert original[mutant['start']:mutant['end']] == mutant['before']
            file.write_text(original[:mutant['start']] + mutant['after'] + original[mutant['end']:])
            try:
                result = subprocess.run(focused, cwd=target, capture_output=True, text=True, timeout=15)
                failures = FAILURE.findall(result.stdout + result.stderr)
                if result.returncode and not failures:
                    raise RuntimeError(f'Mutation machinery failed: {mutant}\n{result.stdout}{result.stderr}')
                reason = equivalents.get(mutant['id'])
                if not failures and not reason:
                    result = subprocess.run(full, cwd=target, capture_output=True, text=True, timeout=180)
                    failures = FAILURE.findall(result.stdout + result.stderr)
                    if result.returncode and not failures:
                        raise RuntimeError(f'Full mutation gate failed: {mutant}\n{result.stdout}{result.stderr}')
            finally:
                file.write_text(original)
            if failures:
                assert not reason, f'Obsolete equivalence, now killed: {mutant["id"]}'
                status = 'killed: ' + failures[0]
            elif reason:
                status = 'equivalent: ' + reason
            else:
                status = 'SURVIVED'
                survivors.append(mutant)
            rows.append({**mutant, 'status': status})
            if index % 25 == 0:
                print(f'{index + 1}/{len(mutations)}, {len(survivors)} unreviewed survivors', flush=True)
    report = ['# Mechanical reader and URL mutations', '', '| Location | Kind | Before → after | Result / reason |', '|---|---|---|---|']
    for row in rows:
        report.append(f'| {row["file"]}:{row["line"]} | {escape(row["kind"])} | {code_span(row["before"])} → {code_span(row["after"])} | {escape(row["status"])} |')
    summary = f'{len(rows)} generated; {sum(r["status"].startswith("killed") for r in rows)} killed; {sum(r["status"].startswith("equivalent") for r in rows)} equivalent; {len(survivors)} unreviewed survivors.'
    report.extend(['', summary, ''])
    if not survivors:
        report.append(HASH_LINE + fingerprint)
    REPORT.write_text('\n'.join(report) + '\n')
    print(summary)
    if survivors:
        raise SystemExit('Unreviewed survivors; see differential/MUTATIONS.md (cache not updated).')


if __name__ == '__main__':
    run()
