"""Check gate arguments, release refusals and inventory comparison with stubbed tools."""
from pathlib import Path
import json
import os
import shutil
import subprocess
import sys
import tempfile

root = Path(__file__).resolve().parents[2]
with tempfile.TemporaryDirectory(prefix='galley-release-arguments-') as directory:
    target = Path(directory)
    (target / 'bin').mkdir()
    (target / 'tests/support').mkdir(parents=True)
    (target / 'tests/support/check-release-tree.sh').write_text('exit 0\n')
    shutil.copyfile(root / 'check.sh', target / 'check.sh')
    for name in ['bash', 'dirname']:
        (target / 'bin' / name).symlink_to(shutil.which(name))
    for name in ['bun', 'gitleaks']:
        (target / 'bin' / name).symlink_to(shutil.which('true'))
    git = target / 'bin/git'
    git.write_text(f'#!{sys.executable}\n' + '''from pathlib import Path
import os, sys
if sys.argv[1:2] == ['status'] and '--untracked-files=all' in sys.argv:
    ignored = '--ignored' in sys.argv
    print(os.environ.get('DIST_STATUS' if ignored else 'TREE_STATUS', ''), end='')
    if Path('driver-ran').exists():
        print(os.environ.get('LATE_DIST_STATUS' if ignored else 'LATE_TREE_STATUS', ''), end='')
        if not ignored and os.environ.get('INVENTORY_CHANGED') == '1':
            print(' M differential/MUTATIONS.md')
if sys.argv[1:2] == ['diff'] and 'differential/MUTATIONS.md' in sys.argv:
    sys.exit(int(os.environ.get('INVENTORY_CHANGED', '0')))
''')
    git.chmod(0o755)
    python = target / 'bin/python3'
    python.write_text(f'#!{sys.executable}\n' + '''from pathlib import Path
import json, os, sys
print(json.dumps(sys.argv[1:]))
Path('driver-ran').touch()
sys.exit(int(os.environ.get('DRIVER_EXIT', '75')))
''')
    python.chmod(0o755)
    environment = os.environ | {'PATH': str(target / 'bin')}

    def gate(arguments, extra_environment=None):
        (target / 'driver-ran').unlink(missing_ok=True)
        return subprocess.run([shutil.which('bash'), 'check.sh', *arguments], cwd=target,
                              env=environment | (extra_environment or {}), capture_output=True, text=True, timeout=10)

    for arguments in [[], ['--release'], ['--unknown'], ['--release', 'extra']]:
        result = gate(arguments)
        if arguments in [[], ['--release']]:
            assert result.returncode == 75, result.stderr
            assert json.loads(result.stdout) == ['tests/mutate-context.py', *(['--force'] if arguments else [])]
        else:
            assert result.returncode == 2 and 'usage:' in result.stderr
            assert not result.stdout
    for extra_environment, missing_scanner, message in [
        ({'TREE_STATUS': '?? notes.txt\n'}, False, 'requires a clean tree'),
        ({}, True, 'requires gitleaks on PATH'),
        ({'DIST_STATUS': '!! dist/leftover.log\n'}, False, 'requires a clean tree'),
    ]:
        scanner = target / 'bin/gitleaks'
        if missing_scanner:
            scanner.unlink()
        try:
            result = gate(['--release'], extra_environment)
            assert result.returncode == 1 and message in result.stderr, (extra_environment, result.stdout, result.stderr)
        finally:
            if missing_scanner:
                scanner.symlink_to(shutil.which('true'))
    for arguments in [[], ['--release']]:
        result = gate(arguments, {'DRIVER_EXIT': '0', 'INVENTORY_CHANGED': '1'})
        assert result.returncode == 1, (arguments, result.stdout, result.stderr)
        assert result.stderr.splitlines()[0] == 'check.sh: inputs changed: commit the inventory; inputs unchanged: a verdict moved.'
    result = gate(['--release'], {'DRIVER_EXIT': '0'})
    assert result.returncode == 0, result.stderr
    for status in [
        {'LATE_TREE_STATUS': ' M README.md\n'},
        {'LATE_TREE_STATUS': '?? dist/added-by-build.js\n'},
        {'LATE_DIST_STATUS': '!! dist/added-by-build.log\n'},
    ]:
        result = gate(['--release'], {'DRIVER_EXIT': '0'} | status)
        assert result.returncode == 1 and 'requires a clean tree' in result.stderr, (status, result.stdout, result.stderr)
print('release argument handling passed: arguments, dirty tree, missing gitleaks, inventory, ignored dist and final clean tree')
