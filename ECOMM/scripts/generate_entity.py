#!/usr/bin/env python3
"""
End-to-End Backend Entity Code Generator (Python version)
Generates decoupled configs, validator, repository, service, controller, and routes for any entity.

Usage:
  python3 scripts/generate_entity.py --name Employee --module identity
  python3 scripts/generate_entity.py --schema schema.json
  python3 scripts/generate_entity.py (defaults to Employee demo)
"""

import sys
import os
import json
import re

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

def to_pascal_case(s: str) -> str:
    parts = re.split(r'[-_ ]+', s)
    return ''.join(p.capitalize() for p in parts if p)

def to_camel_case(s: str) -> str:
    p = to_pascal_case(s)
    return p[:1].lower() + p[1:] if p else ''

def to_snake_case(s: str) -> str:
    s = re.sub(r'([a-z])([A-Z])', r'\1_\2', s)
    return re.sub(r'[-\s]+', '_', s).lower()

def to_plural(s: str) -> str:
    s_lower = s.lower()
    if s_lower.endswith('y') and not re.search(r'[aeiou]y$', s_lower):
        return s[:-1] + 'ies'
    if s_lower.endswith(('s', 'sh', 'ch', 'x', 'z')):
        return s + 'es'
    return s + 's'

def to_title_case(s: str) -> str:
    return ' '.join(w.capitalize() for w in re.split(r'[-_]+', s) if w)

DEFAULT_COLUMNS = [
    {
        "key": "first_name",
        "header_name": "First Name",
        "type": "string",
        "filter_type": "multi_search",
        "editable": True,
        "required": True,
        "sorting": True,
        "order": 1,
        "width": "180px",
        "cell_mode": "text_code_1000",
        "info_note": "Employee first name"
    },
    {
        "key": "last_name",
        "header_name": "Last Name",
        "type": "string",
        "filter_type": "search",
        "editable": True,
        "required": True,
        "sorting": True,
        "order": 2,
        "width": "180px",
        "cell_mode": "text_code_1000",
        "info_note": "Employee last name"
    },
    {
        "key": "email",
        "header_name": "Email",
        "type": "string",
        "filter_type": "search",
        "editable": True,
        "required": True,
        "sorting": True,
        "order": 3,
        "width": "240px",
        "cell_mode": "text_code_2000",
        "info_note": "Corporate email address"
    },
    {
        "key": "department",
        "header_name": "Department",
        "type": "string",
        "filter_type": "list",
        "editable": True,
        "required": False,
        "sorting": True,
        "order": 4,
        "width": "180px",
        "cell_mode": "text_code_1000",
        "info_note": "Department unit"
    },
    {
        "key": "role",
        "header_name": "Job Role",
        "type": "string",
        "filter_type": "search",
        "editable": True,
        "required": False,
        "sorting": True,
        "order": 5,
        "width": "180px",
        "cell_mode": "text_code_1000",
        "info_note": "Assigned job title"
    },
    {
        "key": "salary",
        "header_name": "Salary ($)",
        "type": "number",
        "filter_type": "number_range",
        "editable": True,
        "required": False,
        "sorting": True,
        "order": 6,
        "width": "150px",
        "cell_mode": "text_code_3000",
        "info_note": "Annual base compensation"
    },
    {
        "key": "status",
        "header_name": "Status",
        "type": "enum",
        "filter_type": "list",
        "editable": True,
        "required": False,
        "sorting": True,
        "order": 7,
        "width": "140px",
        "cell_mode": "text_code_1000",
        "info_note": "Employee status"
    },
    {
        "key": "hire_date",
        "header_name": "Hire Date",
        "type": "date",
        "filter_type": "date_range",
        "editable": False,
        "required": False,
        "sorting": True,
        "order": 8,
        "width": "160px",
        "cell_mode": "text_code_4000",
        "info_note": "Date onboarded"
    }
]

def main():
    args = sys.argv[1:]
    entity_name = "Employee"
    table_name = ""
    module_name = "identity"
    output_dir = ""
    route_prefix = ""
    columns = []
    auto_register = True
    dry_run = False

    i = 0
    while i < len(args):
        a = args[i]
        if a in ("--name", "-n") and i + 1 < len(args):
            entity_name = args[i + 1]
            i += 1
        elif a in ("--table", "-t") and i + 1 < len(args):
            table_name = args[i + 1]
            i += 1
        elif a in ("--module", "-m") and i + 1 < len(args):
            module_name = args[i + 1]
            i += 1
        elif a in ("--path", "-p") and i + 1 < len(args):
            output_dir = args[i + 1]
            i += 1
        elif a in ("--route-prefix", "-r") and i + 1 < len(args):
            route_prefix = args[i + 1]
            i += 1
        elif a == "--dry-run":
            dry_run = True
        elif a == "--no-register":
            auto_register = False
        elif a in ("--sql",) and i + 1 < len(args):
            cmd_sql = args[i + 1]
            i += 1
        elif a in ("--product",) and i + 1 < len(args):
            cmd_product = args[i + 1]
            i += 1
        elif a in ("--database",) and i + 1 < len(args):
            cmd_database = args[i + 1]
            i += 1
        elif a in ("--schema", "-s") and i + 1 < len(args):
            schema_file = os.path.abspath(args[i + 1])
            if os.path.exists(schema_file):
                with open(schema_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    entity_name = data.get('name') or data.get('entityName', entity_name)
                    table_name = data.get('table') or data.get('tableName', table_name)
                    module_name = data.get('module') or data.get('moduleName', module_name)
                    output_dir = data.get('path') or data.get('outputDir', output_dir)
                    route_prefix = data.get('routePrefix', route_prefix)
                    columns = data.get('columns', columns)
            i += 1
        i += 1

    ts_script = os.path.join(ROOT_DIR, "scripts", "generate-entity.ts")
    cmd = ["npx", "tsx", ts_script] + args
    os.execvp("npx", cmd)

if __name__ == '__main__':
    main()
