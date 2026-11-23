"""G-43: fresh campaigns, isolated inputs, baselines and conclusive outcomes."""
from pathlib import Path
import contextlib
import importlib.util
import io
import json
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.dont_write_bytecode = True
root = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('mutation_driver', root / 'tests/mutate-context.py')
assert spec and spec.loader
driver = importlib.util.module_from_spec(spec)
spec.loader.exec_module(driver)


class CampaignTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory(prefix='galley-driver-test-')
        self.addCleanup(temporary.cleanup)
        self.fixture = Path(temporary.name)
        for name in ['compiler', 'tests/support', 'differential', 'node_modules']:
            (self.fixture / name).mkdir(parents=True)
        for name in [*driver.COPY_FILES, 'tests/mutate-context.py', 'tests/example.test.ts', 'tests/fixture.txt',
                     'tests/support/generate-mutants.ts', 'differential/corpus.json', 'differential/pins.json']:
            (self.fixture / name).write_text('input')
        self.equivalents = self.fixture / 'tests/support/mutation-equivalents.json'
        self.equivalents.write_text('{}')
        self.source = self.fixture / 'compiler/context.ts'
        self.source.write_text('original')
        self.tracked = [p.relative_to(self.fixture).as_posix() for folder in ['compiler', 'tests', 'differential']
                        for p in (self.fixture / folder).rglob('*') if p.is_file()]
        (self.fixture / 'tests/scratch.test.ts').write_text('untracked failing test')
        self.mutant = dict(file='compiler/context.ts', start=0, end=8, before='original', after='mutated', kind='test', line=1, id='example')
        self.mutations = [self.mutant]
        self.calls = []
        self.copies = []
        self.focused = ['focused assertion']
        self.full = ['first assertion', 'different assertion']
        self.baseline_failure = None
        self.require_copied_generator = False
        self.malformed_output = None
        self.timeout_at = None
        self.output = io.StringIO()
        temporary_directory = tempfile.TemporaryDirectory

        @contextlib.contextmanager
        def checked_copy(**kwargs):
            with temporary_directory(**kwargs) as directory:
                try:
                    yield directory
                finally:
                    copied_source = Path(directory) / 'compiler/context.ts'
                    if copied_source.exists():
                        self.assertEqual(copied_source.read_text(), 'original', 'mutant was not restored')

        for replacement in [patch.object(driver, 'ROOT', self.fixture), patch.object(sys, 'argv', ['tests/mutate-context.py']),
                            patch.object(driver.subprocess, 'run', side_effect=self.invoke),
                            patch.object(driver.tempfile, 'TemporaryDirectory', checked_copy), contextlib.redirect_stdout(self.output)]:
            replacement.__enter__()
            self.addCleanup(replacement.__exit__, None, None, None)

    def invoke(self, command, **kwargs):
        assert kwargs['timeout'] > 0
        assert kwargs['env']['NO_COLOR'] == '1' and 'FORCE_COLOR' not in kwargs['env']
        target = kwargs.get('cwd')
        if command == ['git', 'ls-files', '-z', '--', 'compiler', 'tests', 'differential']:
            return subprocess.CompletedProcess(command, 0, ('\0'.join(self.tracked) + '\0').encode(), b'')
        if command == ['bun', '--version']:
            return subprocess.CompletedProcess(command, 0, 'test-bun\n' if kwargs.get('text') else b'test-bun\n', '')
        if command == ['bun', 'tests/support/generate-mutants.ts']:
            if self.require_copied_generator:
                assert target != self.fixture, 'generate mutants inside the execution copy'
                assert (target / 'node_modules').resolve() == self.fixture / 'node_modules'
                assert (target / 'tests/support/generate-mutants.ts').read_text() == 'input'
            return subprocess.CompletedProcess(command, 0, json.dumps(self.mutations), '')
        assert command[:5] == ['bun', 'test', '--bail', '--preload', './tests/support/mutation-budget.ts']
        assert target != self.fixture and self.source.read_text() == 'original'
        assert not (target / 'tests/scratch.test.ts').exists(), 'untracked tests must not run'
        for name in self.tracked:
            assert (target / name).is_file(), f'tracked input missing: {name}'
        self.copies.append(target)
        full = len(command) == 5
        if not full:
            assert command[5:7] == ['--test-name-pattern', '^(?!G-29:)']
        mutated = (target / self.mutant['file']).read_text() == 'mutated'
        stage = ('mutant' if mutated else 'baseline') + (' full' if full else ' focused')
        self.calls.append(stage)
        if stage == self.timeout_at:
            raise subprocess.TimeoutExpired(command, kwargs['timeout'])
        if mutated and self.malformed_output is not None:
            code, output = self.malformed_output
            return subprocess.CompletedProcess(command, code, '', output)
        labels = self.full if full else self.focused
        label = labels.pop(0) if mutated and labels else self.baseline_failure if not mutated and full else None
        output = f'(fail) {label} [1.23ms]\n' if label else ' 1 pass\n 0 fail\n'
        return subprocess.CompletedProcess(command, int(bool(label)), '', output)

    def campaign_fails(self, message):
        with self.assertRaises((SystemExit, RuntimeError, AssertionError, subprocess.TimeoutExpired)) as caught:
            driver.run()
        self.assertIn(message, str(caught.exception))
        self.assertEqual(self.source.read_text(), 'original')
        self.assertTrue(all(not target.exists() for target in self.copies), 'failed campaign left a copy')
        return caught.exception

    def test_generates_inside_copy(self):
        self.require_copied_generator = True
        driver.run()

    def test_always_fresh_and_reports_each_outcome(self):
        self.mutations += [dict(self.mutant, id='reviewed', kind='equivalent test')]
        self.equivalents.write_text(json.dumps({'reviewed': 'Reviewed fixture equivalence'}))
        for _ in range(2):
            self.focused = ['named assertion']
            driver.run()
        self.assertEqual(self.calls, ['baseline focused', 'baseline full', 'mutant focused', 'mutant focused'] * 2)
        output = self.output.getvalue()
        self.assertEqual(output.count('compiler/context.ts:1 test: killed: named assertion'), 2)
        self.assertEqual(output.count('compiler/context.ts:1 equivalent test: equivalent: Reviewed fixture equivalence'), 2)
        self.assertEqual(output.count('2 generated; 1 killed; 1 equivalent; 0 unreviewed survivors.'), 2)
        self.assertEqual(output.count('Bun test-bun'), 2)
        self.assertTrue(all(not target.exists() for target in self.copies))

    def test_different_fallback_failures_confirm_a_kill(self):
        self.focused = []
        driver.run()
        self.assertEqual(self.calls, ['baseline focused', 'baseline full', 'mutant focused', 'mutant full', 'mutant full'])
        self.assertIn('1 generated; 1 killed; 0 equivalent; 0 unreviewed survivors.', self.output.getvalue())
        self.assertIn('1 fallback kills confirmed', self.output.getvalue())

    def test_passing_confirmation_is_inconclusive(self):
        self.focused = []
        self.full = ['transient failure']
        self.campaign_fails('not confirmed')
        self.assertNotIn(': killed:', self.output.getvalue())

    def test_full_baseline_failure_precedes_any_outcome(self):
        self.baseline_failure = 'unmutated full-suite failure'
        self.campaign_fails('baseline')
        self.assertEqual(self.calls, ['baseline focused', 'baseline full'])
        self.assertNotIn(': killed:', self.output.getvalue())

    def test_focused_baseline_failure_precedes_any_outcome(self):
        invoke = self.invoke

        def fail_focused(command, **kwargs):
            result = invoke(command, **kwargs)
            if self.calls == ['baseline focused']:
                return subprocess.CompletedProcess(command, 1, '', '(fail) broken baseline\n')
            return result

        with patch.object(driver.subprocess, 'run', side_effect=fail_focused):
            self.campaign_fails('baseline')
        self.assertEqual(self.calls, ['baseline focused'])

    def test_unreviewed_survivor_fails_after_complete_campaign(self):
        self.focused = self.full = []
        self.campaign_fails('Unreviewed survivors')
        self.assertIn('compiler/context.ts:1 test: SURVIVED', self.output.getvalue())
        self.assertIn('1 generated; 0 killed; 0 equivalent; 1 unreviewed survivors.', self.output.getvalue())

    def test_mutant_timeout_is_never_a_kill(self):
        for stage in ['mutant focused', 'mutant full']:
            with self.subTest(stage=stage):
                self.timeout_at = stage
                self.focused = []
                error = self.campaign_fails('')
                self.assertRegex(str(error), 'timeout|timed out')
                self.assertNotIn(': killed:', self.output.getvalue())

    def test_baseline_timeout_is_never_a_kill(self):
        for stage in ['baseline focused', 'baseline full']:
            with self.subTest(stage=stage):
                self.timeout_at = stage
                error = self.campaign_fails('')
                self.assertRegex(str(error), 'timeout|timed out')
                self.assertNotIn(': killed:', self.output.getvalue())

    def test_malformed_test_output_has_no_outcome(self):
        for result in [(1, 'infrastructure failed'), (0, ''), (0, '0 pass\n0 fail\n'),
                       (0, '(fail) inconsistent status\n'), (-9, '(fail) killed process\n')]:
            with self.subTest(result=result):
                self.malformed_output = result
                self.campaign_fails('test output')
                self.assertNotIn(': killed:', self.output.getvalue())

    def test_invalid_or_empty_mutant_list_fails_before_tests(self):
        for mutations in [[], {}, [None], [dict(self.mutant, start=-1)], [dict(self.mutant, end=99)],
                          [dict(self.mutant, before='wrong')], [dict(self.mutant, after='original')],
                          [dict(self.mutant, file='../outside.ts')], [dict(self.mutant, line=0)],
                          [dict(self.mutant, start=True)], [dict(self.mutant, id='')], [self.mutant, self.mutant]]:
            with self.subTest(mutations=mutations):
                self.mutations = mutations
                self.campaign_fails('mutant list')
                self.assertEqual(self.calls, [])

    def test_malformed_generation_and_missing_bun_fail(self):
        invoke = self.invoke
        for fault in ['bad json', 'failed generator', 'missing bun']:
            with self.subTest(fault=fault):
                def broken(command, **kwargs):
                    if command == ['bun', 'tests/support/generate-mutants.ts']:
                        if fault == 'missing bun':
                            raise FileNotFoundError('bun')
                        return subprocess.CompletedProcess(command, int(fault == 'failed generator'), 'not json', 'generator error')
                    return invoke(command, **kwargs)
                with patch.object(driver.subprocess, 'run', side_effect=broken):
                    self.campaign_fails('bun' if fault == 'missing bun' else 'generat' if fault == 'failed generator' else 'mutant list')
                self.assertEqual(self.calls, [])

    def test_stale_and_obsolete_equivalences_fail(self):
        self.equivalents.write_text('{"missing": "Stale review"}')
        self.campaign_fails('Stale equivalence')
        self.assertEqual(self.calls, [])
        self.equivalents.write_text('{"example": "Obsolete review"}')
        self.campaign_fails('Obsolete equivalence')

    def test_invalid_equivalences_fail(self):
        for entries in ['[]', '{"example": ""}', '{"example": null}', 'not json']:
            with self.subTest(entries=entries):
                self.equivalents.write_text(entries)
                self.campaign_fails('equivalence')
                self.assertEqual(self.calls, [])

    def test_git_and_copy_failures_have_clear_messages(self):
        for failure, message in [
            (FileNotFoundError('git'), 'requires git on PATH'),
            (subprocess.CalledProcessError(128, ['git'], stderr=b'not a repository'), 'git ls-files failed: not a repository'),
            (subprocess.TimeoutExpired(['git'], 10), 'git ls-files timeout after 10 seconds'),
        ]:
            with patch.object(driver.subprocess, 'run', side_effect=failure):
                with self.assertRaises(SystemExit) as caught:
                    driver.copy_inputs(self.fixture / 'failed-copy')
                self.assertIn(message, str(caught.exception))
        for listed, message in [(b'', 'git ls-files returned no files'), (b'tests/gone.test.ts\0', 'cannot copy tracked input tests/gone.test.ts')]:
            with patch.object(driver.subprocess, 'run', return_value=subprocess.CompletedProcess(['git'], 0, listed, b'')):
                with self.assertRaises(SystemExit) as caught:
                    driver.copy_inputs(self.fixture / 'failed-copy')
                self.assertIn(message, str(caught.exception))

    def test_arguments_are_rejected(self):
        for arguments in [['--force'], ['--unknown'], ['extra']]:
            with self.subTest(arguments=arguments), patch.object(sys, 'argv', ['tests/mutate-context.py', *arguments]):
                self.campaign_fails('usage: python3 tests/mutate-context.py')
                self.assertEqual(self.calls, [])


if __name__ == '__main__':
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(CampaignTests)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    if not result.wasSuccessful():
        raise SystemExit(1)
    subprocess.run([sys.executable, 'tests/support/check-mutation-signals.py'], cwd=root, check=True, timeout=20)
    print('G-43: fresh campaigns, copy isolation, baselines, --bail, loop budget and kill reporting passed')
