"""Verify outputs, then measure AB/BA rounds: main/main first, main/branch second."""
from pathlib import Path
import argparse
import json
import os
import subprocess

ROOT = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('main', type=Path, help='baseline package directory')
parser.add_argument('branch', type=Path, help='candidate package directory')
parser.add_argument('output', type=Path, help='directory for measurement results (created if needed)')
parser.add_argument('--rounds', type=int, default=8, help='AB/BA rounds per probe (at least 4; default: 8)')
args = parser.parse_args()
if args.rounds < 4:
    parser.error('--rounds must be at least 4')
main, branch = str(args.main.resolve()), str(args.branch.resolve())
OUTPUT = args.output.resolve()
OUTPUT.mkdir(parents=True, exist_ok=True)
verification = subprocess.run(['bun', 'tests/bench/verify.ts', main], cwd=ROOT, capture_output=True, text=True, check=True, timeout=60)
(OUTPUT / 'benchmark-outputs.txt').write_text(verification.stdout)
results = {}
tables = []
for label, probe, a, b in [
    ('warmNoise', 'tests/bench/probe-galley.ts', main, main),
    ('firstNoise', 'tests/bench/first-probe.ts', main, main),
    ('warmComparison', 'tests/bench/probe-galley.ts', main, branch),
    ('firstComparison', 'tests/bench/first-probe.ts', main, branch),
]:
    path = OUTPUT / f'{label}-samples.json'
    command = ['bun', 'tests/bench/ab.ts', probe, a, b, str(args.rounds)]
    result = subprocess.run(command, cwd=ROOT, env={**os.environ, 'GALLEY_SAMPLES': str(path)}, capture_output=True, text=True, check=True, timeout=300)
    results[label] = {'command': command, 'samples': json.loads(path.read_text()), 'table': result.stdout}
    path.unlink()
    tables.append(f'## {label}\n\n```text\n{result.stdout}```\n')
    print(f'{label} finished', flush=True)
(OUTPUT / 'measurements.json').write_text(json.dumps(results, indent=2) + '\n')
(OUTPUT / 'BENCHMARKS.md').write_text(f'# {args.rounds}-round AB/BA measurements\n\nMain/main controls precede comparisons. First renders use fresh processes.\n\n' + '\n'.join(tables))
