#!/usr/bin/env python3
"""Validate the shared Cmux role and team catalog without dependencies."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
import sys
from typing import Any


ROOT = Path(__file__).resolve().parent
ROLE_SCHEMA_PATH = ROOT / "role.schema.json"
TEAM_SCHEMA_PATH = ROOT / "team.schema.json"
SCHEMA_DRAFT = "https://json-schema.org/draft/2020-12/schema"


class DuplicateKeyError(ValueError):
    pass


def unique_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    value: dict[str, Any] = {}
    for key, item in pairs:
        if key in value:
            raise DuplicateKeyError(key)
        value[key] = item
    return value


def load_json(path: Path, label: str, errors: list[str]) -> Any:
    try:
        with path.open(encoding="utf-8") as handle:
            return json.load(handle, object_pairs_hook=unique_object)
    except FileNotFoundError:
        errors.append(f"{label}: file is missing")
    except DuplicateKeyError as exc:
        errors.append(f"{label}: duplicate object key {exc}")
    except json.JSONDecodeError as exc:
        errors.append(f"{label}: invalid JSON at line {exc.lineno}, column {exc.colno}")
    except OSError as exc:
        errors.append(f"{label}: cannot read file ({type(exc).__name__})")
    return None


def type_matches(value: Any, expected: str) -> bool:
    if expected == "object":
        return isinstance(value, dict)
    if expected == "array":
        return isinstance(value, list)
    if expected == "string":
        return isinstance(value, str)
    if expected == "integer":
        return isinstance(value, int) and not isinstance(value, bool)
    if expected == "boolean":
        return isinstance(value, bool)
    return False


def validate_instance(value: Any, schema: dict[str, Any], label: str, errors: list[str]) -> None:
    if "const" in schema and value != schema["const"]:
        errors.append(f"{label}: must equal the schema constant")
    if "enum" in schema and value not in schema["enum"]:
        errors.append(f"{label}: must be one of the schema enum values")

    expected = schema.get("type")
    if isinstance(expected, str) and not type_matches(value, expected):
        errors.append(f"{label}: must be a JSON {expected}")
        return

    if isinstance(value, dict):
        properties = schema.get("properties", {})
        required = schema.get("required", [])
        if not isinstance(properties, dict) or not isinstance(required, list):
            errors.append(f"{label}: validator received an invalid object schema")
            return
        for key in required:
            if key not in value:
                errors.append(f"{label}: missing required key {key}")
        if schema.get("additionalProperties") is False:
            for key in sorted(set(value) - set(properties)):
                errors.append(f"{label}: unsupported key {key}")
        for key, child in value.items():
            child_schema = properties.get(key)
            if isinstance(child_schema, dict):
                validate_instance(child, child_schema, f"{label}.{key}", errors)

    if isinstance(value, list):
        minimum = schema.get("minItems")
        maximum = schema.get("maxItems")
        if isinstance(minimum, int) and len(value) < minimum:
            errors.append(f"{label}: must contain at least {minimum} items")
        if isinstance(maximum, int) and len(value) > maximum:
            errors.append(f"{label}: must contain at most {maximum} items")
        if schema.get("uniqueItems") is True:
            encoded = [json.dumps(item, sort_keys=True, separators=(",", ":")) for item in value]
            if len(encoded) != len(set(encoded)):
                errors.append(f"{label}: items must be unique")
        item_schema = schema.get("items")
        if isinstance(item_schema, dict):
            for index, child in enumerate(value):
                validate_instance(child, item_schema, f"{label}[{index}]", errors)

    if isinstance(value, str):
        minimum = schema.get("minLength")
        maximum = schema.get("maxLength")
        if isinstance(minimum, int) and len(value) < minimum:
            errors.append(f"{label}: must contain at least {minimum} characters")
        if isinstance(maximum, int) and len(value) > maximum:
            errors.append(f"{label}: must contain at most {maximum} characters")
        pattern = schema.get("pattern")
        if isinstance(pattern, str) and re.search(pattern, value) is None:
            errors.append(f"{label}: does not match the schema pattern")


def load_schema(path: Path, label: str, errors: list[str]) -> dict[str, Any] | None:
    value = load_json(path, label, errors)
    if not isinstance(value, dict):
        if value is not None:
            errors.append(f"{label}: schema root must be an object")
        return None
    if value.get("$schema") != SCHEMA_DRAFT:
        errors.append(f"{label}: must use JSON Schema draft 2020-12")
    if value.get("type") != "object" or value.get("additionalProperties") is not False:
        errors.append(f"{label}: root must be a closed object schema")
    if not isinstance(value.get("required"), list) or not isinstance(value.get("properties"), dict):
        errors.append(f"{label}: must declare required keys and properties")
    return value


def validate_catalog(catalog_root: Path, schema_root: Path = ROOT) -> tuple[list[str], int, int]:
    errors: list[str] = []
    catalog_root = catalog_root.expanduser().resolve()
    role_schema = load_schema(schema_root / "role.schema.json", "role.schema.json", errors)
    team_schema = load_schema(schema_root / "team.schema.json", "team.schema.json", errors)

    roles_dir = catalog_root / "roles"
    teams_dir = catalog_root / "teams"
    if not roles_dir.is_dir():
        errors.append("roles: directory is missing")
    if not teams_dir.is_dir():
        errors.append("teams: directory is missing")
    if errors and (not roles_dir.is_dir() or not teams_dir.is_dir()):
        return errors, 0, 0

    role_paths = sorted(roles_dir.glob("*.json"))
    team_paths = sorted(teams_dir.glob("*.json"))
    if not role_paths:
        errors.append("roles: no catalog entries found")
    if not team_paths:
        errors.append("teams: no catalog entries found")

    role_ids: set[str] = set()
    for path in role_paths:
        label = str(path.relative_to(catalog_root))
        role = load_json(path, label, errors)
        if not isinstance(role, dict):
            continue
        if role_schema is not None:
            validate_instance(role, role_schema, label, errors)
        role_id = role.get("id")
        if isinstance(role_id, str):
            if path.stem != role_id:
                errors.append(f"{label}: filename must match role id")
            if role_id in role_ids:
                errors.append(f"{label}: duplicate role id")
            role_ids.add(role_id)

    team_ids: set[str] = set()
    for path in team_paths:
        label = str(path.relative_to(catalog_root))
        team = load_json(path, label, errors)
        if not isinstance(team, dict):
            continue
        if team_schema is not None:
            validate_instance(team, team_schema, label, errors)
        team_id = team.get("id")
        if isinstance(team_id, str):
            if path.stem != team_id:
                errors.append(f"{label}: filename must match team id")
            if team_id in team_ids:
                errors.append(f"{label}: duplicate team id")
            team_ids.add(team_id)

        workers = team.get("workers")
        if not isinstance(workers, list):
            continue
        worker_ids: set[str] = set()
        harnesses: set[str] = set()
        for index, worker in enumerate(workers):
            if not isinstance(worker, dict):
                continue
            worker_id = worker.get("id")
            if isinstance(worker_id, str):
                if worker_id in worker_ids:
                    errors.append(f"{label}.workers[{index}]: duplicate worker id")
                worker_ids.add(worker_id)
            harness = worker.get("harness")
            if isinstance(harness, str):
                harnesses.add(harness)
            role_id = worker.get("role")
            if isinstance(role_id, str) and role_id not in role_ids:
                errors.append(f"{label}.workers[{index}]: references an unknown role")
        if len(harnesses) < 2:
            errors.append(f"{label}.workers: must use at least two distinct harnesses")

    return errors, len(role_paths), len(team_paths)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--catalog",
        type=Path,
        default=ROOT,
        help="Catalog root containing roles/ and teams/ (default: this directory)",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    errors, role_count, team_count = validate_catalog(args.catalog)
    if errors:
        print(f"FAILED: {len(errors)} catalog validation error(s)", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print(f"Validated {role_count} roles and {team_count} teams.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
