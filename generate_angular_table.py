#!/usr/bin/env python3
"""
CLI Generator for Angular Master-Table pages (Root proxy)
Usage:
  python3 generate_angular_table.py --entity Customer --table-key customers_table_1234 --product identity_management [--dry-run]
"""

import sys
import os

ROOT_DIR = os.path.abspath(os.path.dirname(__file__))

def main():
    args = sys.argv[1:]
    ts_script = os.path.join(ROOT_DIR, "ECOMM", "scripts", "generate-angular-table.ts")
    node_binary = "node"
    tsx_cli = os.path.join(ROOT_DIR, "ECOMM", "node_modules", "tsx", "dist", "cli.mjs")
    cmd = [node_binary, tsx_cli, ts_script] + args
    os.execvp(node_binary, cmd)

if __name__ == '__main__':
    main()
