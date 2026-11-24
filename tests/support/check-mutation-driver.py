"""G-43: fresh campaigns, isolated inputs, baselines and conclusive outcomes."""
from pathlib import Path
import contextlib
import importlib.util
import io
import json
import subprocess
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, call, patch

sys.dont_write_bytecode = True
root = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('mutation_driver', root / 'tests/mutate-context.py')
assert spec and spec.loader
driver = importlib.util.module_from_spec(spec)
spec.loader.exec_module(driver)


class CampaignTests(unittest.TestCase):
    def setUp(self):
        self.real_run = subprocess.run
        temporary = tempfile.TemporaryDirectory(prefix='galley-driver-test-')
        self.addCleanup(temporary.cleanup)
        self.fixture = Path(temporary.name)
        for name in ['compiler', 'tests/support', 'differential', 'node_modules']:
            (self.fixture / name).mkdir(parents=True)
        (self.fixture / 'node_modules/dependency.txt').write_text('dependency input', encoding='utf-8')
        for name in [*driver.COPY_FILES, 'tests/mutate-context.py', 'tests/example.test.ts', 'tests/fixture.txt',
                     'tests/support/generate-mutants.ts', 'differential/corpus.json', 'differential/pins.json']:
            (self.fixture / name).write_text('input', encoding='utf-8')
        self.equivalents = self.fixture / 'tests/support/mutation-equivalents.json'
        self.equivalents.write_text('{}', encoding='utf-8')
        self.source = self.fixture / 'compiler/context.ts'
        self.original = 'original'
        self.source.write_text(self.original, encoding='utf-8')
        self.tracked = [p.relative_to(self.fixture).as_posix() for folder in ['compiler', 'tests', 'differential']
                        for p in (self.fixture / folder).rglob('*') if p.is_file()]
        (self.fixture / 'tests/scratch.test.ts').write_text('untracked failing test', encoding='utf-8')
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
                        self.assertEqual(copied_source.read_text(encoding='utf-8'), self.original, 'mutant was not restored')

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
            return subprocess.CompletedProcess(command, 0, 'test-bun\n', '')
        if command == ['bun', 'tests/support/generate-mutants.ts']:
            if self.require_copied_generator:
                assert target != self.fixture, 'generate mutants inside the execution copy'
                assert (target / 'node_modules').resolve() != (self.fixture / 'node_modules').resolve()
                assert (target / 'node_modules/dependency.txt').read_text(encoding='utf-8') == 'dependency input'
                assert (target / 'tests/support/generate-mutants.ts').read_text(encoding='utf-8') == 'input'
            return subprocess.CompletedProcess(command, 0, json.dumps(self.mutations), '')
        assert command[:5] == ['bun', 'test', '--bail', '--preload', './tests/support/mutation-budget.ts']
        assert target != self.fixture and self.source.read_text(encoding='utf-8') == self.original
        assert not (target / 'tests/scratch.test.ts').exists(), 'untracked tests must not run'
        for name in self.tracked:
            assert (target / name).is_file(), f'tracked input missing: {name}'
        self.copies.append(target)
        full = len(command) == 5
        if not full:
            assert command[5:] == driver.TESTS
        replacement = self.original[:self.mutant['start']] + self.mutant['after'] + self.original[self.mutant['end']:]
        mutated = (target / self.mutant['file']).read_text(encoding='utf-8') == replacement
        stage = ('mutant' if mutated else 'baseline') + (' full' if full else ' focused')
        self.calls.append(stage)
        self.assertEqual(kwargs['timeout'], 600 if full else 15 if mutated else 30)
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
        with self.assertRaises(SystemExit) as caught:
            driver.run()
        self.assertIn(message, str(caught.exception))
        self.assertEqual(self.source.read_text(encoding='utf-8'), self.original)
        self.assertTrue(all(not target.exists() for target in self.copies), 'failed campaign left a copy')
        return caught.exception

    def test_generates_inside_copy(self):
        self.require_copied_generator = True
        driver.run()

    def test_dependency_copy_needs_no_symlink_privileges_and_is_independent(self):
        invoke = self.invoke
        self.require_copied_generator = True

        def change_dependency(command, **kwargs):
            result = invoke(command, **kwargs)
            if command == ['bun', 'tests/support/generate-mutants.ts']:
                (kwargs['cwd'] / 'node_modules/dependency.txt').write_text('changed in copy', encoding='utf-8')
            return result

        with patch.object(Path, 'symlink_to', side_effect=OSError('symlinks require privileges')), \
                patch.object(driver.subprocess, 'run', side_effect=change_dependency):
            driver.run()
        self.assertEqual((self.fixture / 'node_modules/dependency.txt').read_text(encoding='utf-8'), 'dependency input')

    def test_dependency_copy_failure_is_clear(self):
        with patch.object(driver.shutil, 'copytree', side_effect=OSError('dependency unavailable')):
            self.campaign_fails('cannot copy dependencies: dependency unavailable')
        self.assertEqual(self.calls, [])

    def test_handled_signal_restores_mutant_and_removes_copy(self):
        invoke = self.invoke

        def interrupt(command, **kwargs):
            result = invoke(command, **kwargs)
            if self.calls == ['baseline focused', 'baseline full', 'mutant focused']:
                driver.terminate(driver.signal.SIGTERM, None)
            return result

        with patch.object(driver.subprocess, 'run', side_effect=interrupt):
            error = self.campaign_fails(str(128 + driver.signal.SIGTERM))
        self.assertEqual(error.code, 128 + driver.signal.SIGTERM)

    def test_mutations_preserve_utf8_and_lf(self):
        self.original = 'original\n// café → template\n'
        self.source.write_bytes(self.original.encode('utf-8'))
        invoke = self.invoke

        def inspect_bytes(command, **kwargs):
            if command[:2] == ['bun', 'test']:
                source = kwargs['cwd'] / self.mutant['file']
                contents = source.read_bytes()
                self.assertNotIn(b'\r', contents)
                self.assertIn('café → template'.encode('utf-8'), contents)
            return invoke(command, **kwargs)

        with patch.object(driver.subprocess, 'run', side_effect=inspect_bytes):
            driver.run()
        self.assertEqual(self.source.read_bytes(), self.original.encode('utf-8'))

    def test_always_fresh_and_reports_each_outcome(self):
        self.mutations += [dict(self.mutant, id='reviewed', kind='equivalent test')]
        self.equivalents.write_text(json.dumps({'reviewed': 'Reviewed fixture equivalence'}), encoding='utf-8')
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
                self.campaign_fails('Mutation campaign timeout after ')
                self.assertNotIn(': killed:', self.output.getvalue())

    def test_bun_per_test_timeout_stops_campaign_and_names_test(self):
        (self.fixture / 'bunfig.toml').write_text('', encoding='utf-8')
        (self.fixture / 'tsconfig.json').write_text('{}', encoding='utf-8')
        test = self.fixture / 'tests/timeout.test.ts'
        test.write_text("import { test } from 'bun:test'\n"
                        "test('pause resolves', async () => { await Bun.sleep(400) }, 100)\n", encoding='utf-8')
        result = self.real_run(['bun', 'test', str(test)], cwd=self.fixture,
                               env=driver.CHILD_ENV, capture_output=True, encoding='utf-8', timeout=10)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('this test timed out after', result.stdout + result.stderr)
        self.malformed_output = (result.returncode, result.stdout + result.stderr)
        error = self.campaign_fails('Bun test timeout')
        self.assertIn('pause resolves', str(error))
        self.assertEqual(self.calls, ['baseline focused', 'baseline full', 'mutant focused'])
        self.assertNotIn(': killed:', self.output.getvalue())

    def test_bun_hook_timeout_stops_campaign_and_names_test(self):
        (self.fixture / 'bunfig.toml').write_text('', encoding='utf-8')
        (self.fixture / 'tsconfig.json').write_text('{}', encoding='utf-8')
        test = self.fixture / 'tests/hook-timeout.test.ts'
        test.write_text("import { beforeEach, test } from 'bun:test'\n"
                        "beforeEach(async () => { await Bun.sleep(400) }, 100)\n"
                        "test('hook pause resolves → café', () => {})\n", encoding='utf-8')
        result = self.real_run(['bun', 'test', str(test)], cwd=self.fixture,
                               env=driver.CHILD_ENV, capture_output=True, encoding='utf-8', timeout=10)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('a beforeEach/afterEach hook timed out for this test', result.stdout + result.stderr)
        self.malformed_output = (result.returncode, result.stdout + result.stderr)
        error = self.campaign_fails('Bun test timeout')
        self.assertIn('hook pause resolves → café', str(error))
        self.assertEqual(self.calls, ['baseline focused', 'baseline full', 'mutant focused'])
        self.assertNotIn(': killed:', self.output.getvalue())

    def test_stale_equivalences_name_every_entry(self):
        self.equivalents.write_text(json.dumps({'missing-b': 'Second review', 'missing-a': 'First review'}), encoding='utf-8')
        error = self.campaign_fails('Stale equivalence entries')
        self.assertIn('missing-a', str(error))
        self.assertIn('missing-b', str(error))
        self.assertEqual(self.calls, [])

    def test_baseline_timeout_is_never_a_kill(self):
        for stage in ['baseline focused', 'baseline full']:
            with self.subTest(stage=stage):
                self.timeout_at = stage
                self.campaign_fails('Mutation campaign timeout after ')
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
        self.equivalents.write_text('{"missing": "Stale review"}', encoding='utf-8')
        self.campaign_fails('Stale equivalence')
        self.assertEqual(self.calls, [])
        self.equivalents.write_text('{"example": "Obsolete review"}', encoding='utf-8')
        self.campaign_fails('Obsolete equivalence')

    def test_equivalents_full_suite_kill_fails(self):
        self.focused = []
        self.full = ['assertion outside focused tests']
        self.equivalents.write_text('{"example": "Reviewed fixture equivalence"}', encoding='utf-8')
        with patch.object(sys, 'argv', ['tests/mutate-context.py', '--equivalents']):
            self.campaign_fails('Obsolete equivalence, now killed: example')
        self.assertEqual(self.calls, ['baseline focused', 'baseline full', 'mutant full'])
        self.assertNotIn(': killed:', self.output.getvalue())

    def test_equivalents_runs_only_reviewed_mutants_and_passes(self):
        self.mutations.insert(0, dict(self.mutant, id='unreviewed'))
        self.equivalents.write_text('{"example": "Reviewed fixture equivalence"}', encoding='utf-8')
        self.full = []
        with patch.object(sys, 'argv', ['tests/mutate-context.py', '--equivalents']):
            driver.run()
        self.assertEqual(self.calls, ['baseline focused', 'baseline full', 'mutant full'])
        self.assertIn('1 reviewed equivalents passed the full suite.', self.output.getvalue())
        self.assertEqual(self.output.getvalue().count('compiler/context.ts:'), 1)

    def test_equivalents_requires_passing_baselines(self):
        self.equivalents.write_text('{"example": "Reviewed fixture equivalence"}', encoding='utf-8')
        self.baseline_failure = 'broken full-suite baseline'
        with patch.object(sys, 'argv', ['tests/mutate-context.py', '--equivalents']):
            self.campaign_fails('Unmutated full-suite baseline failed')
        self.assertEqual(self.calls, ['baseline focused', 'baseline full'])

    def test_list_generates_in_copy_and_checks_equivalences_without_tests(self):
        self.require_copied_generator = True
        self.equivalents.write_text('{"example": "Reviewed fixture equivalence"}', encoding='utf-8')
        with patch.object(sys, 'argv', ['tests/mutate-context.py', '--list']):
            driver.run()
        self.assertEqual(self.calls, [])
        self.assertIn('1 generated; 1 reviewed equivalence entries valid.', self.output.getvalue())

    def test_list_rejects_stale_and_invalid_equivalences_without_tests(self):
        for entries, message in [('{"missing": "Stale review"}', 'Stale equivalence'),
                                 ('{"example": ""}', 'invalid equivalence list')]:
            with self.subTest(entries=entries), patch.object(sys, 'argv', ['tests/mutate-context.py', '--list']):
                self.equivalents.write_text(entries, encoding='utf-8')
                self.campaign_fails(message)
                self.assertEqual(self.calls, [])

    def test_invalid_equivalences_fail(self):
        for entries in ['[]', '{"example": ""}', '{"example": null}', 'not json']:
            with self.subTest(entries=entries):
                self.equivalents.write_text(entries, encoding='utf-8')
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
        for arguments in [['--force'], ['--unknown'], ['extra'], ['--list', '--equivalents']]:
            with self.subTest(arguments=arguments), patch.object(sys, 'argv', ['tests/mutate-context.py', *arguments]):
                self.campaign_fails('usage: python3 tests/mutate-context.py')
                self.assertEqual(self.calls, [])


class EntryPointTests(unittest.TestCase):
    def test_registers_only_signals_available_on_the_platform(self):
        for names in [('SIGINT', 'SIGTERM'), ('SIGINT', 'SIGTERM', 'SIGHUP')]:
            signals = SimpleNamespace(signal=Mock(), **{name: index + 1 for index, name in enumerate(names)})
            with self.subTest(names=names), patch.object(driver, 'signal', signals), patch.object(driver, 'run') as run:
                driver.main()
            expected = [call(getattr(signals, name), driver.terminate) for name in names]
            self.assertEqual(signals.signal.call_args_list, expected)
            run.assert_called_once_with()


if __name__ == '__main__':
    suite = unittest.defaultTestLoader.loadTestsFromModule(sys.modules[__name__])
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    if not result.wasSuccessful():
        raise SystemExit(1)
    subprocess.run([sys.executable, 'tests/support/check-mutation-signals.py'], cwd=root, check=True, timeout=20)
    print('G-43: fresh campaigns, copy isolation, baselines, --bail, loop budget and kill reporting passed')
