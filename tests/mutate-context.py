"""Run one fresh, complete reader/URL mutation campaign in an isolated copy."""
from pathlib import Path
import json
import os
import re
import shutil
import signal
import subprocess
import sys
import tempfile
import time

ROOT = Path(__file__).resolve().parents[1]
COPY_FILES = ['index.ts', 'types.ts', 'util.ts', 'bunfig.toml', 'tsconfig.json', 'check.sh']
# The generator owns the mutated-file list; the focused test selection is a separate execution concern.
TESTS = ['tests/' + name for name in ['source-spans.test.ts', 'compile-saving.test.ts', 'literal-fixes.test.ts', 'strict-undefined.test.ts', 'strict-braces.test.ts', 'partials.test.ts', 'metadata-collections.test.ts', 'position.test.ts', 'snippet-parameters.test.ts', 'boolean-filters.test.ts', 'filter-registry.test.ts', 'reader-names.test.ts', 'expression-path.test.ts', 'each-else.test.ts', 'attribute-policy.test.ts', 'bindings.test.ts', 'strict-acceptor.test.ts', 'mechanical-reader.test.ts', 'second-correction.test.ts', 'url-static-start.test.ts', 'url-static-suffix.test.ts', 'url-end-check.test.ts', 'mutation-flow.test.ts', 'lint-mutations.test.ts', 'third-correction.test.ts', 'fourth-correction.test.ts', 'growth-semantics.test.ts', 'config-regression.test.ts', 'comment-search.test.ts', 'lint-async.test.ts', 'context-model.test.ts', 'url-attributes.test.ts', 'review-findings.test.ts', 'stripped-marks.test.ts', 'compiler.test.ts', 'loops.test.ts', 'snippets.test.ts', 'hadley-templates.test.ts']]
FAILURE = re.compile(r'^\(fail\) (.+?)(?: \[[0-9.]+ms\])?$', re.MULTILINE)
PASS = re.compile(r'^\s*[1-9][0-9]* pass\s*$', re.MULTILINE)
ZERO_FAILURES = re.compile(r'^\s*0 fail\s*$', re.MULTILINE)
CHILD_ENV = os.environ | {'NO_COLOR': '1'}
CHILD_ENV.pop('FORCE_COLOR', None)


def copy_inputs(target):
    # One tracked list defines the isolated execution inputs.
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
    for name in sorted(tracked_paths | set(COPY_FILES)):
        destination = target / name
        destination.parent.mkdir(parents=True, exist_ok=True)
        try:
            shutil.copyfile(ROOT / name, destination)
        except FileNotFoundError as error:
            raise SystemExit(f'Mutation driver: cannot copy tracked input {name}: file is missing') from error


def execute(command, target, timeout):
    try:
        return subprocess.run(command, cwd=target, env=CHILD_ENV, capture_output=True, encoding='utf-8', timeout=timeout)
    except FileNotFoundError as error:
        raise SystemExit(f'Mutation driver requires {command[0]} on PATH') from error
    except subprocess.TimeoutExpired as error:
        raise SystemExit(f'Mutation campaign timeout after {timeout} seconds: {command}') from error


def test_failures(command, target, timeout):
    result = execute(command, target, timeout)
    output = result.stdout + result.stderr
    failures = FAILURE.findall(output)
    if 'this test timed out after' in output or 'a beforeEach/afterEach hook timed out for this test' in output:
        raise SystemExit(f'Mutation campaign: Bun test timeout:\n{output}')
    if result.returncode > 0 and failures:
        return failures
    if result.returncode == 0 and not failures and PASS.search(output) and ZERO_FAILURES.search(output):
        return []
    raise SystemExit(f'Mutation campaign: invalid test output (exit {result.returncode}): {command}\n{output}')


def generate_mutations(target):
    result = execute(['bun', 'tests/support/generate-mutants.ts'], target, 30)
    if result.returncode:
        raise SystemExit(f'Mutation generator failed:\n{result.stdout}{result.stderr}')
    try:
        mutations = json.loads(result.stdout)
        if not isinstance(mutations, list) or not mutations:
            raise ValueError('expected a nonempty list')
        identities = set()
        for mutant in mutations:
            if not isinstance(mutant, dict):
                raise ValueError('expected mutant objects')
            if any(not isinstance(mutant.get(key), str) or not mutant[key] for key in ['file', 'id', 'kind', 'before']):
                raise ValueError('missing or invalid mutant text fields')
            if not isinstance(mutant.get('after'), str) or any(type(mutant.get(key)) is not int for key in ['start', 'end', 'line']):
                raise ValueError('missing or invalid replacement, offsets or line')
            path = Path(mutant['file'])
            if path.is_absolute() or '..' in path.parts or (str(path) != 'util.ts' and (len(path.parts) < 2 or path.parts[0] != 'compiler')):
                raise ValueError('mutant file must be inside compiler or be util.ts')
            original = (target / path).read_text(encoding='utf-8')
            if not (0 <= mutant['start'] < mutant['end'] <= len(original)) or mutant['line'] < 1:
                raise ValueError('invalid mutant offsets or line')
            if original[mutant['start']:mutant['end']] != mutant['before'] or mutant['after'] == mutant['before']:
                raise ValueError('mutant does not change the copied source')
            if mutant['id'] in identities:
                raise ValueError('duplicate mutant identity')
            identities.add(mutant['id'])
    except (ValueError, OSError) as error:
        raise SystemExit(f'Mutation campaign: invalid mutant list: {error}') from error
    return mutations


def terminate(signum, _frame):
    # Unwind subprocess.run and TemporaryDirectory, including their child/copy cleanup.
    raise SystemExit(128 + signum)


def read_equivalents(target, mutations):
    try:
        equivalents = json.loads((target / 'tests/support/mutation-equivalents.json').read_text(encoding='utf-8'))
        if not isinstance(equivalents, dict) or any(not isinstance(reason, str) or not reason.strip() for reason in equivalents.values()):
            raise ValueError('expected an object of nonempty reviewed reasons')
    except (ValueError, OSError) as error:
        raise SystemExit(f'Mutation campaign: invalid equivalence list: {error}') from error
    stale = set(equivalents) - {m['id'] for m in mutations}
    if stale:
        raise SystemExit('Stale equivalence entries:\n' + '\n'.join(sorted(stale)))
    return equivalents


def run():
    if sys.argv[1:] not in [[], ['--equivalents'], ['--list']]:
        raise SystemExit('usage: python3 tests/mutate-context.py [--equivalents | --list]')
    check_equivalents = sys.argv[1:] == ['--equivalents']
    started = time.monotonic()
    with tempfile.TemporaryDirectory(prefix='galley-mutations-') as directory:
        target = Path(directory)
        copy_inputs(target)
        try:
            shutil.copytree(ROOT / 'node_modules', target / 'node_modules')
        except OSError as error:
            raise SystemExit(f'Mutation driver: cannot copy dependencies: {error}') from error
        result = execute(['bun', '--version'], target, 10)
        version = result.stdout.strip()
        if result.returncode or not version or '\n' in version:
            raise SystemExit(f'Mutation campaign: invalid Bun version output:\n{result.stdout}{result.stderr}')
        print(f'Bun {version}', flush=True)
        mutations = generate_mutations(target)
        equivalents = read_equivalents(target, mutations)
        if sys.argv[1:] == ['--list']:
            print(f'{len(mutations)} generated; {len(equivalents)} reviewed equivalence entries valid.')
            return
        if check_equivalents:
            mutations = [mutant for mutant in mutations if mutant['id'] in equivalents]
        focused = ['bun', 'test', '--bail', '--preload', './tests/support/mutation-budget.ts', *TESTS]
        full = ['bun', 'test', '--bail', '--preload', './tests/support/mutation-budget.ts']
        for name, command, timeout in [('focused', focused, 30), ('full-suite', full, 600)]:
            if failures := test_failures(command, target, timeout):
                raise SystemExit(f'Unmutated {name} baseline failed: {failures[0]}')
        killed = reviewed = survivors = confirmed = 0
        for mutant in mutations:
            file = target / mutant['file']
            original = file.read_text(encoding='utf-8')
            file.write_bytes((original[:mutant['start']] + mutant['after'] + original[mutant['end']:]).encode('utf-8'))
            try:
                reason = equivalents.get(mutant['id'])
                if check_equivalents:
                    failures = test_failures(full, target, 600)
                else:
                    failures = test_failures(focused, target, 15)
                    if not failures and not reason:
                        failures = test_failures(full, target, 600)
                        if failures:
                            failures = test_failures(full, target, 600)
                            if not failures:
                                raise SystemExit(f'Fallback kill was not confirmed (inconclusive): {mutant["id"]}')
                            confirmed += 1
            finally:
                file.write_bytes(original.encode('utf-8'))
            if failures:
                if reason:
                    raise SystemExit(f'Obsolete equivalence, now killed: {mutant["id"]}\nFailing test: {failures[0]}')
                killed += 1
                status = 'killed: ' + failures[0]
            elif reason:
                reviewed += 1
                status = 'equivalent: ' + reason
            else:
                survivors += 1
                status = 'SURVIVED'
            print(f'{mutant["file"]}:{mutant["line"]} {mutant["kind"]}: {status}', flush=True)
    print(f'Campaign duration: {time.monotonic() - started:.2f} seconds.')
    if check_equivalents:
        print(f'{reviewed} reviewed equivalents passed the full suite.')
        return
    print(f'{len(mutations)} generated; {killed} killed; {reviewed} equivalent; {survivors} unreviewed survivors.')
    print(f'{confirmed} fallback kills confirmed by a second full-suite run.')
    if survivors:
        raise SystemExit('Unreviewed survivors; see the campaign outcomes above.')


def main():
    for name in ['SIGINT', 'SIGTERM', 'SIGHUP']:
        if hasattr(signal, name):
            signal.signal(getattr(signal, name), terminate)
    run()


if __name__ == '__main__':
    main()
