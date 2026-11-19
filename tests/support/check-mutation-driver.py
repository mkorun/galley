"""G-43: copy isolation, complete-run caching, invalidation and Bun failure labels."""
from pathlib import Path
import importlib.util
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

for full_suite in [False, True]:
    with tempfile.TemporaryDirectory(prefix='galley-driver-test-') as directory:
        fixture = Path(directory)
        for name in ['compiler', 'tests/support', 'differential', 'node_modules']:
            (fixture / name).mkdir(parents=True)
        for name in ['index.ts', 'types.ts', 'util.ts', 'package.json', 'bunfig.toml', 'bun.lock', 'tsconfig.json', 'tsconfig.typecheck.json', 'tests/mutate-context.py', 'tests/example.test.ts', 'tests/support/generate-mutants.ts', 'differential/corpus.json', 'differential/pins.json']:
            (fixture / name).write_text('input')
        (fixture / 'tests/support/mutation-equivalents.json').write_text('{}')
        source = fixture / 'compiler/context.ts'
        source.write_text('original')
        report = fixture / 'differential/MUTATIONS.md'
        report.write_text('no previous run\n')
        mutation = dict(file='compiler/context.ts', start=0, end=8, before='original', after='mutated', kind='test', line=1, id='example')
        calls = []

        def invoke(command, **kwargs):
            assert kwargs['timeout'] > 0
            if command == ['bun', '--version']:
                return subprocess.CompletedProcess(command, 0, b'test-bun\n', b'')
            if command == ['bun', 'tests/support/generate-mutants.ts']:
                return subprocess.CompletedProcess(command, 0, json.dumps([mutation]), '')
            assert command[:3] == ['bun', 'test', '--bail']
            assert command[3:5] == ['--preload', './tests/support/mutation-budget.ts']
            target = kwargs['cwd']
            assert target != fixture and not (target / 'evidence').exists()
            assert source.read_text().startswith('original')
            contents = (target / mutation['file']).read_text()
            calls.append(contents)
            killed = contents.startswith('mutated') and (not full_suite or len(command) == 5)
            return subprocess.CompletedProcess(command, int(killed), '', '(fail) G-43: named assertion [1.23ms]\n' if killed else '')

        with patch.object(driver, 'ROOT', fixture), patch.object(driver, 'REPORT', report), patch.object(sys, 'argv', ['tests/mutate-context.py']), patch.object(driver.subprocess, 'run', side_effect=invoke):
            driver.run()
            assert 'killed: G-43: named assertion |' in report.read_text()
            assert '[1.23ms]' not in report.read_text()
            assert report.read_text().count(driver.HASH_LINE) == 1
            first = len(calls)
            driver.run()
            assert len(calls) == first, 'unchanged inputs must reuse the run'
            for name in ['compiler/context.ts', 'tests/example.test.ts', 'tests/support/generate-mutants.ts', 'tests/support/mutation-equivalents.json']:
                file = fixture / name
                # Whitespace changes preserve the fixture mutant and valid JSON.
                file.write_text(file.read_text() + '\n')
                driver.run()
                assert len(calls) > first, name
                first = len(calls)
                assert source.read_text().startswith('original')
                if name == 'compiler/context.ts':
                    source.write_text('original')
            with patch.object(sys, 'argv', ['tests/mutate-context.py', '--force']):
                driver.run()
                assert len(calls) > first
            before = report.read_text()
            with patch.object(sys, 'argv', ['tests/mutate-context.py', '--force']), patch.object(driver.subprocess, 'run', side_effect=lambda command, **kw: invoke(command, **kw) if command[1] != 'test' else (_ for _ in ()).throw(subprocess.TimeoutExpired(command, 15))):
                try:
                    driver.run()
                    raise AssertionError('timeout must fail')
                except subprocess.TimeoutExpired:
                    pass
            assert source.read_text().startswith('original')
            assert report.read_text() == before

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
print('G-43: copy isolation, cache invalidation, --bail, loop budget and timing labels passed')
