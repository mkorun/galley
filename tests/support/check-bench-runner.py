"""Check measurement output routing, round selection and failure propagation."""
from pathlib import Path
import contextlib
import io
import json
import runpy
import subprocess
import sys
import tempfile
from unittest.mock import patch

root = Path(__file__).resolve().parents[2]
runner = root / 'tests/bench/measure.py'

with tempfile.TemporaryDirectory(prefix='galley-bench-test-') as directory:
    directory = Path(directory).resolve()
    main, branch = str(Path(directory) / 'main'), str(Path(directory) / 'branch')
    for options, rounds in [([], 8), (['--rounds', '4'], 4)]:
        output = Path(directory) / str(rounds) / 'results'
        calls = []

        def invoke(command, **kwargs):
            assert kwargs['cwd'] == root and kwargs['timeout'] > 0 and kwargs['check']
            calls.append(command)
            if len(calls) == 1:
                assert command == ['bun', 'tests/bench/verify.ts', main]
                return subprocess.CompletedProcess(command, 0, 'verified outputs\n', '')
            assert command[:2] == ['bun', 'tests/bench/ab.ts']
            assert command[-1] == str(rounds)
            samples = Path(kwargs['env']['GALLEY_SAMPLES'])
            assert samples.parent == output
            samples.write_text('{"A": [{"metric": 1}], "B": [{"metric": 2}]}')
            return subprocess.CompletedProcess(command, 0, 'measurement table\n', '')

        with patch.object(sys, 'argv', [str(runner), main, branch, str(output), *options]), patch('subprocess.run', side_effect=invoke), contextlib.redirect_stdout(io.StringIO()):
            runpy.run_path(str(runner), run_name='__main__')
        assert [command[3:5] for command in calls[1:]] == [[main, main], [main, main], [main, branch], [main, branch]]
        assert {file.name for file in output.iterdir()} == {'benchmark-outputs.txt', 'measurements.json', 'BENCHMARKS.md'}
        assert (output / 'benchmark-outputs.txt').read_text() == 'verified outputs\n'
        results = json.loads((output / 'measurements.json').read_text())
        assert list(results) == ['warmNoise', 'firstNoise', 'warmComparison', 'firstComparison']
        assert all(result['samples']['B'] == [{'metric': 2}] for result in results.values())
        assert f'# {rounds}-round AB/BA measurements' in (output / 'BENCHMARKS.md').read_text()

    for arguments in [[main, branch], [main, branch, str(output), '--rounds', '3']]:
        with patch.object(sys, 'argv', [str(runner), *arguments]), patch('subprocess.run') as invoke, contextlib.redirect_stderr(io.StringIO()):
            try:
                runpy.run_path(str(runner), run_name='__main__')
                raise AssertionError('invalid arguments must fail')
            except SystemExit as error:
                assert error.code == 2
            invoke.assert_not_called()

    output = Path(directory) / 'failed'
    with patch.object(sys, 'argv', [str(runner), main, branch, str(output)]), patch('subprocess.run', side_effect=subprocess.CalledProcessError(1, ['bun'])):
        try:
            runpy.run_path(str(runner), run_name='__main__')
            raise AssertionError('verification failure must stop measurement')
        except subprocess.CalledProcessError:
            pass
    assert not list(output.iterdir())
