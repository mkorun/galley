"""Generate reader/URL mutations in a copy; reuse only a complete, matching reviewed run."""
from pathlib import Path
import hashlib
import json
import os
import re
import shutil
import signal
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / 'differential/MUTATIONS.md'
COPY_FILES = ['index.ts', 'types.ts', 'util.ts', 'bun.lock', 'bunfig.toml', 'tsconfig.json', 'tsconfig.typecheck.json', 'check.sh']
# The generator owns the mutated-file list; the focused test selection is a separate execution concern.
TESTS = ['tests/' + name for name in ['strict-acceptor.test.ts', 'mechanical-reader.test.ts', 'second-correction.test.ts', 'url-static-start.test.ts', 'url-static-suffix.test.ts', 'url-end-check.test.ts', 'mutation-flow.test.ts', 'lint-mutations.test.ts', 'third-correction.test.ts', 'fourth-correction.test.ts', 'growth-semantics.test.ts', 'config-regression.test.ts', 'comment-search.test.ts', 'lint-async.test.ts', 'context-model.test.ts', 'url-attributes.test.ts', 'review-findings.test.ts', 'stripped-marks.test.ts', 'compiler.test.ts', 'loops.test.ts', 'snippets.test.ts']]
FAILURE = re.compile(r'^\(fail\) (.+?)(?: \[[0-9.]+ms\])?$', re.MULTILINE)
HASH_LINE = 'Mutation inputs SHA-256: '
CHILD_ENV = os.environ | {'NO_COLOR': '1'}
CHILD_ENV.pop('FORCE_COLOR', None)


def copy_inputs(target):
    # One tracked list defines both the copy and its fingerprint. The report hashes itself separately.
    try:
        tracked = subprocess.run(['git', 'ls-files', '-z', '--', 'compiler', 'tests', 'differential'], cwd=ROOT,
                                 env=CHILD_ENV, capture_output=True, check=True, timeout=10)
    except FileNotFoundError as error:
        raise SystemExit('Mutation driver requires git on PATH') from error
    except subprocess.CalledProcessError as error:
        raise SystemExit('Mutation driver: git ls-files failed: ' + error.stderr.decode().strip()) from error
    except subprocess.TimeoutExpired as error:
        raise SystemExit('Mutation driver: git ls-files timeout after 10 seconds') from error
    tracked_paths = set(tracked.stdout.decode().split('\0')) - {''}
    if not tracked_paths:
        raise SystemExit('Mutation driver: git ls-files returned no files')
    paths = (tracked_paths - {'differential/MUTATIONS.md'}) | set(COPY_FILES)
    for name in sorted(paths):
        destination = target / name
        destination.parent.mkdir(parents=True, exist_ok=True)
        try:
            shutil.copyfile(ROOT / name, destination)
        except FileNotFoundError as error:
            raise SystemExit(f'Mutation driver: cannot copy tracked input {name}: file is missing') from error
    return sorted(paths)


def input_hash(target, paths):
    # Read the frozen copy: later edits in the working tree cannot be covered by this digest.
    digest = hashlib.sha256()
    for name in paths:
        contents = (target / name).read_bytes()
        digest.update(name.encode() + b'\0' + str(len(contents)).encode() + b'\0' + contents)
    version = subprocess.run(['bun', '--version'], env=CHILD_ENV, capture_output=True, check=True, timeout=10).stdout
    digest.update(version)
    return digest.hexdigest()


def report_hash(fingerprint, report):
    # Combine the frozen execution inputs with the inventory, excluding its own hash line.
    digest = hashlib.sha256(fingerprint.encode())
    lines = report.splitlines(keepends=True)
    if lines and lines[-1].startswith(HASH_LINE):
        lines.pop()
    digest.update(''.join(lines).encode())
    return digest.hexdigest()


def write_report(contents):
    # A signal or write failure must leave the old inventory intact.
    with tempfile.NamedTemporaryFile(mode='w', dir=REPORT.parent, prefix='.MUTATIONS-', delete=False) as temporary:
        path = Path(temporary.name)
        try:
            temporary.write(contents)
            temporary.close()
            path.replace(REPORT)
        finally:
            path.unlink(missing_ok=True)


def terminate(signum, _frame):
    # Unwind subprocess.run and TemporaryDirectory, including their child/copy cleanup.
    raise SystemExit(128 + signum)


def code_span(value):
    fence = '`' * (1 + max((len(run) for run in re.findall(r'`+', value)), default=0))
    return f'{fence} {escape(value)} {fence}'


def escape(value):
    return value.replace('|', '&#124;').replace('\n', ' ').replace('\t', ' ')


def run():
    if sys.argv[1:] not in ([], ['--force']):
        raise SystemExit('usage: python3 tests/mutate-context.py [--force]')
    result = subprocess.run(['bun', 'tests/support/generate-mutants.ts'], cwd=ROOT, env=CHILD_ENV, capture_output=True, text=True, check=True, timeout=30)
    mutations = json.loads(result.stdout)
    with tempfile.TemporaryDirectory(prefix='galley-mutations-') as directory:
        target = Path(directory)
        paths = copy_inputs(target)
        fingerprint = input_hash(target, paths)
        previous_text = REPORT.read_text()
        previous = previous_text.splitlines()
        if sys.argv[1:] != ['--force'] and previous and previous[-1] == HASH_LINE + report_hash(fingerprint, previous_text):
            print('Mutation inputs unchanged; using differential/MUTATIONS.md.')
            return
        equivalents = json.loads((target / 'tests/support/mutation-equivalents.json').read_text())
        assert not set(equivalents) - {m['id'] for m in mutations}, 'Stale equivalence entries'
        rows, survivors, confirmed = [], [], []
        (target / 'node_modules').symlink_to(ROOT / 'node_modules', target_is_directory=True)
        focused = ['bun', 'test', '--bail', '--preload', './tests/support/mutation-budget.ts', '--test-name-pattern', '^(?!G-29:)', *TESTS]
        full = ['bun', 'test', '--bail', '--preload', './tests/support/mutation-budget.ts']
        subprocess.run(focused, cwd=target, env=CHILD_ENV, capture_output=True, text=True, check=True, timeout=30)
        for index, mutant in enumerate(mutations):
            file = target / mutant['file']
            original = file.read_text()
            assert original[mutant['start']:mutant['end']] == mutant['before']
            file.write_text(original[:mutant['start']] + mutant['after'] + original[mutant['end']:])
            try:
                result = subprocess.run(focused, cwd=target, env=CHILD_ENV, capture_output=True, text=True, timeout=15)
                failures = FAILURE.findall(result.stdout + result.stderr)
                if result.returncode and not failures:
                    raise RuntimeError(f'Mutation machinery failed: {mutant}\n{result.stdout}{result.stderr}')
                reason = equivalents.get(mutant['id'])
                if not failures and not reason:
                    result = subprocess.run(full, cwd=target, env=CHILD_ENV, capture_output=True, text=True, timeout=600)
                    failures = FAILURE.findall(result.stdout + result.stderr)
                    if result.returncode and not failures:
                        raise RuntimeError(f'Full mutation gate failed: {mutant}\n{result.stdout}{result.stderr}')
                    if failures:
                        first_failure = failures[0]
                        result = subprocess.run(full, cwd=target, env=CHILD_ENV, capture_output=True, text=True, timeout=600)
                        failures = FAILURE.findall(result.stdout + result.stderr)
                        if not result.returncode or not failures or failures[0] != first_failure:
                            raise RuntimeError(f'Fallback kill was not confirmed: {mutant["id"]}\n{result.stdout}{result.stderr}')
                        confirmed.append(mutant['id'])
            finally:
                file.write_text(original)
            if failures:
                assert not reason, f'Obsolete equivalence, now killed: {mutant["id"]}'
                status = 'killed'
                print(f'{mutant["file"]}:{mutant["line"]} {mutant["kind"]}: killed: {failures[0]}', flush=True)
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
    report.extend(['', summary, f'{len(confirmed)} fallback kills confirmed by a second full-suite run.', ''])
    contents = '\n'.join(report) + '\n'
    if not survivors:
        contents += HASH_LINE + report_hash(fingerprint, contents) + '\n'
    write_report(contents)
    print(summary)
    print(f'{len(confirmed)} fallback kills confirmed by a second full-suite run.')
    if survivors:
        raise SystemExit('Unreviewed survivors; see differential/MUTATIONS.md (cache not updated).')


if __name__ == '__main__':
    signal.signal(signal.SIGTERM, terminate)
    signal.signal(signal.SIGHUP, terminate)
    run()
