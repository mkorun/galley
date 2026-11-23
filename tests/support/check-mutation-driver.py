"""G-43: copy isolation, complete-run caching, invalidation and failure confirmation."""
from pathlib import Path
import contextlib
import importlib.util
import io
import json
import subprocess
import sys
import tempfile
from unittest.mock import patch

sys.dont_write_bytecode = True
root = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('mutation_driver', root / 'tests/mutate-context.py')
assert spec and spec.loader
driver = importlib.util.module_from_spec(spec)
spec.loader.exec_module(driver)

for full_suite in [False, True, 'tests/compile-growth.test.ts', 'tests/differential.test.ts', 'tests/template-boundaries.test.ts', 'tests/mutation-driver.test.ts']:
    with tempfile.TemporaryDirectory(prefix='galley-driver-test-') as directory:
        fixture = Path(directory)
        for name in ['compiler', 'tests/support', 'differential', 'node_modules']:
            (fixture / name).mkdir(parents=True)
        for name in ['index.ts', 'types.ts', 'util.ts', 'package.json', 'bunfig.toml', 'bun.lock', 'tsconfig.json', 'tsconfig.typecheck.json', 'check.sh', 'tests/mutate-context.py', 'tests/example.test.ts', 'tests/fixture.txt', 'tests/support/generate-mutants.ts', 'differential/corpus.json', 'differential/pins.json']:
            (fixture / name).write_text('input')
        (fixture / 'tests/support/mutation-equivalents.json').write_text('{}')
        source = fixture / 'compiler/context.ts'
        source.write_text('original')
        (fixture / 'compiler/url.ts').write_text('input')
        (fixture / 'differential/RESULT.json').write_text('record')
        report = fixture / 'differential/MUTATIONS.md'
        report.write_text('no previous run\n')
        mutation = dict(file='compiler/context.ts', start=0, end=8, before='original', after='mutated', kind='test', line=1, id='example')
        tracked_inputs = [p.relative_to(fixture).as_posix() for folder in ['compiler', 'tests', 'differential']
                          for p in (fixture / folder).rglob('*') if p.is_file()]
        (fixture / 'tests/scratch.test.ts').write_text('untracked failing test')
        calls = []
        edit_during_run = []
        killing_test = ['G-43: named assertion']

        def invoke(command, **kwargs):
            assert kwargs['timeout'] > 0
            assert kwargs['env']['NO_COLOR'] == '1'
            assert 'FORCE_COLOR' not in kwargs['env']
            if command == ['git', 'ls-files', '-z', '--', 'compiler', 'tests', 'differential']:
                return subprocess.CompletedProcess(command, 0, ('\0'.join(tracked_inputs) + '\0').encode(), b'')
            if command == ['bun', '--version']:
                return subprocess.CompletedProcess(command, 0, b'test-bun\n', b'')
            if command == ['bun', 'tests/support/generate-mutants.ts']:
                return subprocess.CompletedProcess(command, 0, json.dumps([mutation]), '')
            assert command[:3] == ['bun', 'test', '--bail']
            assert command[3:5] == ['--preload', './tests/support/mutation-budget.ts']
            target = kwargs['cwd']
            assert target != fixture
            assert not (target / 'tests/scratch.test.ts').exists(), 'untracked tests must not run'
            assert source.read_text().startswith('original')
            contents = (target / mutation['file']).read_text()
            calls.append(contents)
            if contents.startswith('mutated') and edit_during_run:
                (fixture / edit_during_run.pop()).write_text('edited during campaign')
            killed = contents.startswith('mutated') and (not full_suite or len(command) == 5)
            label = full_suite if isinstance(full_suite, str) else 'tests/example.test.ts'
            return subprocess.CompletedProcess(command, int(killed), '', label + ':\n(fail) ' + killing_test[0] + ' [1.23ms]\n' if killed else '')

        with patch.object(driver, 'ROOT', fixture), patch.object(driver, 'REPORT', report), patch.object(sys, 'argv', ['tests/mutate-context.py']), patch.object(driver.subprocess, 'run', side_effect=invoke):
            output = io.StringIO()
            with contextlib.redirect_stdout(output):
                driver.run()
            assert 'compiler/context.ts:1 test: killed: G-43: named assertion' in output.getvalue()
            assert 'example: killed:' not in output.getvalue()
            assert '| killed |' in report.read_text()
            assert 'G-43: named assertion' not in report.read_text()
            if full_suite:
                assert '1 fallback kills confirmed' in report.read_text()
                assert calls.count('mutated') == 3
            assert '[1.23ms]' not in report.read_text()
            assert report.read_text().count(driver.HASH_LINE) == 1
            for failure, message in [
                (FileNotFoundError('git'), 'requires git on PATH'),
                (subprocess.CalledProcessError(128, ['git'], stderr=b'not a repository'), 'git ls-files failed: not a repository'),
                (subprocess.TimeoutExpired(['git'], 10), 'git ls-files timeout after 10 seconds'),
            ]:
                with patch.object(driver.subprocess, 'run', side_effect=failure):
                    try:
                        driver.copy_inputs(fixture)
                        raise AssertionError('git failure must stop with a driver message')
                    except SystemExit as error:
                        assert message in str(error), str(error)
            for listed, message in [(b'', 'git ls-files returned no files'), (b'tests/gone.test.ts\0', 'cannot copy tracked input tests/gone.test.ts')]:
                with patch.object(driver.subprocess, 'run', return_value=subprocess.CompletedProcess(['git'], 0, listed, b'')):
                    try:
                        driver.copy_inputs(fixture / 'failed-copy')
                        raise AssertionError('invalid input list must stop')
                    except SystemExit as error:
                        assert message in str(error), str(error)
            # Package metadata does not affect the mutation inputs or copied suite.
            first = len(calls)
            (fixture / 'package.json').write_text('{"version": "next"}')
            driver.run()
            assert len(calls) == first, 'a version bump must preserve the inventory'
            # A save/restore around copying must hash the bytes the suite actually saw.
            copyfile = driver.shutil.copyfile
            def save_during_copy(source_path, destination):
                if source_path == fixture / 'tests/example.test.ts':
                    source_path.write_text('weaker copied test')
                    try:
                        return copyfile(source_path, destination)
                    finally:
                        source_path.write_text('input')
                return copyfile(source_path, destination)

            with patch.object(sys, 'argv', ['tests/mutate-context.py', '--force']), patch.object(driver.shutil, 'copyfile', side_effect=save_during_copy):
                driver.run()
            first = len(calls)
            driver.run()
            assert len(calls) > first, 'hash must describe the copied test, not the restored source'
            # An edit after the copy must invalidate the next plain run.
            for name in ['tests/example.test.ts', 'compiler/url.ts']:
                edit_during_run.append(name)
                with patch.object(sys, 'argv', ['tests/mutate-context.py', '--force']):
                    driver.run()
                first = len(calls)
                driver.run()
                assert len(calls) > first, f'edit during campaign was incorrectly covered: {name}'
            # Untracked editor/cache files have no effect.
            (fixture / 'tests/untracked.txt').write_text('ignored by fingerprint')
            first = len(calls)
            driver.run()
            assert len(calls) == first, 'unchanged inputs must reuse the run'
            for name in ['compiler/context.ts', 'tests/example.test.ts', 'tests/fixture.txt', 'tests/support/generate-mutants.ts', 'tests/support/mutation-equivalents.json', 'tsconfig.json', 'tsconfig.typecheck.json', 'check.sh', 'differential/RESULT.json']:
                file = fixture / name
                # Whitespace changes preserve the fixture mutant and valid JSON.
                file.write_text(file.read_text() + '\n')
                driver.run()
                assert len(calls) > first, name
                first = len(calls)
                assert source.read_text().startswith('original')
                if name == 'compiler/context.ts':
                    source.write_text('original')
            lines = report.read_text().splitlines()
            report.write_text(lines[-1] + '\n')
            driver.run()
            assert len(calls) > first, 'removing inventory rows must invalidate the cache'
            first = len(calls)
            with patch.object(sys, 'argv', ['tests/mutate-context.py', '--force']):
                before = report.read_text()
                killing_test[0] = 'another killing test'
                driver.run()
                assert len(calls) > first
                assert report.read_text() == before, 'killing test order must not change the inventory'
            before = report.read_text()
            with patch.object(sys, 'argv', ['tests/mutate-context.py', '--force']), patch.object(driver.subprocess, 'run', side_effect=lambda command, **kw: invoke(command, **kw) if command[1] != 'test' else (_ for _ in ()).throw(subprocess.TimeoutExpired(command, 15))):
                try:
                    driver.run()
                    raise AssertionError('timeout must fail')
                except subprocess.TimeoutExpired:
                    pass
            assert source.read_text().startswith('original')
            assert report.read_text() == before

            # A transient full-suite timing kill must not become a reusable result.
            if full_suite:
                full_calls = []

                def transient(command, **kwargs):
                    result = invoke(command, **kwargs)
                    if command[:2] == ['bun', 'test'] and len(command) == 5:
                        full_calls.append(command)
                        if len(full_calls) == 2:
                            return subprocess.CompletedProcess(command, 0, '', '')
                    return result

                with patch.object(sys, 'argv', ['tests/mutate-context.py', '--force']), patch.object(driver.subprocess, 'run', side_effect=transient):
                    try:
                        driver.run()
                        raise AssertionError('a transient fallback kill must abort')
                    except RuntimeError as error:
                        assert 'not confirmed' in str(error)
                assert report.read_text() == before
                assert source.read_text() == 'original'

            # The old report remains visible until the complete replacement is renamed.
            original_replace = Path.replace

            def replace(path, destination):
                assert report.read_text() == before
                assert path.parent == report.parent and path != report
                assert driver.HASH_LINE in path.read_text()
                return original_replace(path, destination)

            with patch.object(sys, 'argv', ['tests/mutate-context.py', '--force']), patch.object(Path, 'replace', replace):
                driver.run()
            assert not list(report.parent.glob('.MUTATIONS-*'))
            with patch.object(Path, 'replace', side_effect=OSError('rename failed')):
                try:
                    driver.write_report('incomplete replacement')
                    raise AssertionError('rename failure must propagate')
                except OSError:
                    pass
            assert report.read_text() == before
            assert not list(report.parent.glob('.MUTATIONS-*'))

            def survive(command, **kwargs):
                result = invoke(command, **kwargs)
                if command[1] == 'test':
                    return subprocess.CompletedProcess(command, 0, '', '')
                return result

            for arguments in [['tests/mutate-context.py', '--force'], ['tests/mutate-context.py']]:
                with patch.object(sys, 'argv', arguments), patch.object(driver.subprocess, 'run', side_effect=survive):
                    try:
                        driver.run()
                        raise AssertionError('survivors must fail without a reusable fingerprint')
                    except SystemExit as error:
                        assert 'Unreviewed survivors' in str(error)
                assert driver.HASH_LINE not in report.read_text()
                assert source.read_text() == 'original'
subprocess.run([sys.executable, 'tests/support/check-mutation-signals.py'], cwd=root, check=True, timeout=20)
print('G-43: copy isolation, cache invalidation, --bail, loop budget and kill reporting passed; report rows, all test files, repeated kills, atomic rename and SIGTERM checked')
