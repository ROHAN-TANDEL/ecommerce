#!/usr/bin/env python3
"""
CLI Generator for Angular Master-Table pages (Python version)
Usage:
  python3 scripts/generate_angular_table.py --entity Customer --table-key customers_table_1234 --product identity_management [--dry-run]
"""

import sys
import os

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

def main():
    args = sys.argv[1:]
    ts_script = os.path.join(ROOT_DIR, "scripts", "generate-angular-table.ts")
    cmd = ["npx", "tsx", ts_script] + args
    os.execvp("npx", cmd)

if __name__ == '__main__':
    main()
