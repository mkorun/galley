"""Check gate scheduling, command order and release refusals with stubbed tools."""
from pathlib import Path
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest

root = Path(__file__).resolve().parents[2]


class ReleaseTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory(prefix='galley-release-arguments-')
        self.addCleanup(temporary.cleanup)
        self.target = Path(temporary.name)
        (self.target / 'bin').mkdir()
        (self.target / 'tests/support').mkdir(parents=True)
        (self.target / 'tests/support/check-release-tree.sh').write_text('exec release-tree\n')
        shutil.copyfile(root / 'check.sh', self.target / 'check.sh')
        for name in ['bash', 'dirname']:
            (self.target / 'bin' / name).symlink_to(shutil.which(name))
        stub = self.target / 'bin/tool'
        stub.write_text(f'#!{sys.executable}\n' + '''from pathlib import Path
import json, os, sys
name = Path(sys.argv[0]).name
arguments = sys.argv[1:]
with Path('calls.jsonl').open('a') as log:
    log.write(json.dumps([name, *arguments]) + '\\n')
if name == 'git':
    if arguments[:1] == ['status'] and '--untracked-files=all' in arguments:
        ignored = '--ignored' in arguments
        # Without the path restriction git would also list ignored dependencies.
        if ignored and arguments[-2:] != ['--', 'dist']:
            print('!! node_modules/')
        print(os.environ.get('DIST_STATUS' if ignored else 'TREE_STATUS', ''), end='')
        if Path('driver-ran').exists():
            print(os.environ.get('LATE_DIST_STATUS' if ignored else 'LATE_TREE_STATUS', ''), end='')
    elif arguments[:1] == ['diff']:
        assert arguments == ['diff', '--exit-code', '--', 'dist'], arguments
        sys.exit(int(os.environ.get('DIST_CHANGED', '0')))
elif name == 'python3':
    Path('driver-ran').touch()
    print(os.environ.get('DRIVER_MESSAGE', 'campaign completed'))
    sys.exit(int(os.environ.get('DRIVER_EXIT', '0')))
elif name == os.environ.get('FAIL_TOOL'):
    sys.exit(74)
''')
        stub.chmod(0o755)
        for name in ['git', 'python3', 'bun', 'gitleaks', 'release-tree']:
            (self.target / 'bin' / name).symlink_to(stub)
        self.environment = os.environ | {'PATH': str(self.target / 'bin')}
        self.ordinary = [
            ['release-tree'], ['bun', 'run', 'typecheck'], ['bun', 'test', '--coverage'], ['bun', 'run', 'build'],
            ['git', 'diff', '--exit-code', '--', 'dist'], ['gitleaks', 'git', '.', '--redact', '--no-banner', '--log-level', 'warn'],
        ]
        self.status = [
            ['git', 'status', '--porcelain', '--untracked-files=all'],
            ['git', 'status', '--porcelain', '--ignored', '--untracked-files=all', '--', 'dist'],
        ]

    def gate(self, arguments, extra_environment=None):
        (self.target / 'driver-ran').unlink(missing_ok=True)
        log = self.target / 'calls.jsonl'
        log.unlink(missing_ok=True)
        result = subprocess.run([shutil.which('bash'), 'check.sh', *arguments], cwd=self.target,
                                env=self.environment | (extra_environment or {}), capture_output=True, text=True, timeout=10)
        self.calls = [json.loads(line) for line in log.read_text().splitlines()] if log.exists() else []
        return result

    def test_plain_gate_has_no_campaign_or_cache_lookup(self):
        result = self.gate([], {'DRIVER_EXIT': '75'})
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.calls, self.ordinary)

    def test_release_runs_exactly_one_campaign_after_ordinary_checks(self):
        result = self.gate(['--release'])
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.calls, self.status + self.ordinary + [['python3', 'tests/mutate-context.py']] + self.status)

    def test_survivor_and_incomplete_campaign_block_release(self):
        for message in ['Unreviewed survivors', 'Mutation campaign did not finish']:
            with self.subTest(message=message):
                result = self.gate(['--release'], {'DRIVER_EXIT': '1', 'DRIVER_MESSAGE': message})
                self.assertEqual(result.returncode, 1, result.stderr)
                self.assertIn(message, result.stdout)
                self.assertEqual(self.calls.count(['python3', 'tests/mutate-context.py']), 1)

    def test_invalid_arguments(self):
        for arguments in [['--unknown'], ['--release', 'extra']]:
            result = self.gate(arguments)
            self.assertEqual(result.returncode, 2)
            self.assertIn('usage:', result.stderr)
            self.assertEqual(self.calls, [])

    def test_release_requires_clean_tree_and_gitleaks(self):
        for environment in [{'TREE_STATUS': '?? notes.txt\n'}, {'TREE_STATUS': ' M README.md\n'},
                            {'DIST_STATUS': '!! dist/leftover.log\n'}]:
            result = self.gate(['--release'], environment)
            self.assertEqual(result.returncode, 1)
            self.assertIn('requires a clean tree', result.stderr)
            self.assertEqual(self.calls, self.status)
        (self.target / 'bin/gitleaks').unlink()
        result = self.gate(['--release'])
        self.assertEqual(result.returncode, 1)
        self.assertIn('requires gitleaks on PATH', result.stderr)
        self.assertEqual(self.calls, self.status)
        result = self.gate([])
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.calls, self.ordinary[:-1])

    def test_final_clean_tree_includes_ignored_dist(self):
        for status in [
            {'LATE_TREE_STATUS': ' M README.md\n'},
            {'LATE_TREE_STATUS': '?? dist/added-by-build.js\n'},
            {'LATE_DIST_STATUS': '!! dist/added-by-build.log\n'},
        ]:
            result = self.gate(['--release'], status)
            self.assertEqual(result.returncode, 1)
            self.assertIn('requires a clean tree', result.stderr)
            self.assertEqual(self.calls[-2:], self.status)

    def test_changed_dist_and_failed_ordinary_check_stop_before_campaign(self):
        for arguments in [[], ['--release']]:
            result = self.gate(arguments, {'DIST_CHANGED': '1'})
            self.assertEqual(result.returncode, 1, result.stderr)
            self.assertNotIn(['python3', 'tests/mutate-context.py'], self.calls)
        for tool in ['release-tree', 'bun', 'gitleaks']:
            result = self.gate(['--release'], {'FAIL_TOOL': tool})
            self.assertEqual(result.returncode, 74, result.stderr)
            self.assertNotIn(['python3', 'tests/mutate-context.py'], self.calls)


if __name__ == '__main__':
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(ReleaseTests)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    if not result.wasSuccessful():
        raise SystemExit(1)
    print('release argument handling passed: ordinary checks, one campaign, survivors, incomplete runs and clean tree')
