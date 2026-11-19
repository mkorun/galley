"""Extract the pinned main tree without a branch switch or dependency installation."""
from pathlib import Path
import subprocess
import sys
import tarfile

ROOT = Path(__file__).resolve().parents[2]
if len(sys.argv) not in (2, 3):
    raise SystemExit('usage: python3 tests/bench/extract-main.py <new baseline directory> [revision=main]')
directory = Path(sys.argv[1]).resolve()
revision = sys.argv[2] if len(sys.argv) == 3 else 'main'
commit = subprocess.run(['git', 'rev-parse', '--verify', revision + '^{commit}'], cwd=ROOT, check=True, capture_output=True, text=True, timeout=10).stdout.strip()
directory.mkdir()
archive = directory / 'main.tar'
subprocess.run(['git', 'archive', '--format=tar', '--output', str(archive), commit], cwd=ROOT, check=True, timeout=30)
with tarfile.open(archive) as source:
    source.extractall(directory, filter='data')
archive.unlink()
print(commit)
