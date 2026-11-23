"""Send SIGTERM and SIGHUP to the real driver while its baseline child is running in the copy."""
from pathlib import Path
from textwrap import dedent
import json
import os
import shutil
import signal
import subprocess
import sys
import tempfile
import time

root = Path(__file__).resolve().parents[2]
for signum in [signal.SIGTERM, signal.SIGHUP]:
    with tempfile.TemporaryDirectory(prefix='galley-driver-signal-') as directory:
        fixture = Path(directory)
        for name in ['compiler', 'tests/support', 'differential', 'node_modules', 'bin']:
            (fixture / name).mkdir(parents=True)
        for name in ['index.ts', 'types.ts', 'util.ts', 'package.json', 'bunfig.toml', 'bun.lock', 'tsconfig.json', 'tsconfig.typecheck.json', 'check.sh', 'differential/corpus.json', 'differential/pins.json']:
            (fixture / name).write_text('input')
        shutil.copyfile(root / 'tests/mutate-context.py', fixture / 'tests/mutate-context.py')
        (fixture / 'tests/support/mutation-equivalents.json').write_text('{}')
        source = fixture / 'compiler/context.ts'
        source.write_text('original')
        report = fixture / 'differential/MUTATIONS.md'
        report.write_text('old report\n')
        marker = fixture / 'ready.json'
        fake_bun = fixture / 'bin/bun'
        fake_bun.write_text(f'#!{sys.executable}\n' + dedent('''
    from pathlib import Path
    import json, os, sys
    if sys.argv[1:] == ['--version']:
        print('test-bun')
    elif sys.argv[1:] == ['tests/support/generate-mutants.ts']:
        print(json.dumps([dict(file='compiler/context.ts', start=0, end=8, before='original', after='mutated', kind='test', line=1, id='example')]))
    elif sys.argv[1:3] == ['test', '--bail']:
        Path(os.environ['GALLEY_DRIVER_MARKER']).write_text(json.dumps(dict(directory=os.getcwd(), pid=os.getpid())))
        while True: pass
    else:
        raise SystemExit('unexpected fake Bun invocation')
    '''))
        fake_bun.chmod(0o755)
        subprocess.run(['git', 'init', '--quiet'], cwd=fixture, check=True, timeout=10)
        subprocess.run(['git', 'add', 'compiler', 'tests', 'differential'], cwd=fixture, check=True, timeout=10)
        child = subprocess.Popen([sys.executable, 'tests/mutate-context.py', '--force'], cwd=fixture,
                                 env=os.environ | {'PATH': str(fixture / 'bin') + os.pathsep + os.environ['PATH'], 'GALLEY_DRIVER_MARKER': str(marker)},
                                 stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        ready = None
        try:
            deadline = time.monotonic() + 10
            while time.monotonic() < deadline and child.poll() is None:
                if marker.exists():
                    try:
                        ready = json.loads(marker.read_text())
                        break
                    except json.JSONDecodeError:
                        pass  # The child may still be writing the handshake.
            if not ready:
                stdout, stderr = child.communicate(timeout=10)
                raise AssertionError(f'driver did not start its baseline child: {stdout}{stderr}')
            assert Path(ready['directory']).exists()
            child.send_signal(signum)
            stdout, stderr = child.communicate(timeout=10)
            assert child.returncode == 128 + signum, (stdout, stderr)
            assert not Path(ready['directory']).exists(), 'Signal left the mutation copy'
            try:
                os.kill(ready['pid'], 0)
            except ProcessLookupError:
                pass
            else:
                raise AssertionError('Signal left a child process')
            assert source.read_text() == 'original'
            assert report.read_text() == 'old report\n'
        finally:
            if child.poll() is None:
                child.kill()
            child.communicate(timeout=10)
            if ready and Path(ready['directory']).exists():
                # Clean up even if this regression check fails against an older driver.
                try:
                    os.kill(ready['pid'], signal.SIGKILL)
                except ProcessLookupError:
                    pass
                shutil.rmtree(ready['directory'])
print('SIGTERM and SIGHUP removed the copy and stopped their children; source and report unchanged')
