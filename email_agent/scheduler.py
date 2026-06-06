"""Her gun sabah 08:00'de otomatik calistirir."""

import subprocess
import sys
import os
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
PYTHON = sys.executable
MAIN = str(SCRIPT_DIR / "main.py")


def run_daily():
    env = os.environ.copy()
    env["PYTHONUTF8"] = "1"
    result = subprocess.run(
        [PYTHON, MAIN, "--days", "1", "--max", "200"],
        cwd=str(SCRIPT_DIR),
        env=env,
        capture_output=True,
        text=True,
    )
    print(result.stdout)
    if result.returncode != 0:
        print("HATA:", result.stderr)


if __name__ == "__main__":
    run_daily()
