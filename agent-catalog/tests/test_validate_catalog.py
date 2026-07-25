from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import shutil
import tempfile
import unittest


CATALOG = Path(__file__).resolve().parents[1]
VALIDATOR_PATH = CATALOG / "validate_catalog.py"
SPEC = importlib.util.spec_from_file_location("validate_catalog", VALIDATOR_PATH)
assert SPEC and SPEC.loader
validate_catalog = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(validate_catalog)


class CatalogValidationTests(unittest.TestCase):
    def copy_catalog(self, destination: Path) -> Path:
        catalog = destination / "catalog"
        shutil.copytree(CATALOG / "roles", catalog / "roles")
        shutil.copytree(CATALOG / "teams", catalog / "teams")
        return catalog

    def test_checked_in_catalog_is_valid(self) -> None:
        errors, role_count, team_count = validate_catalog.validate_catalog(CATALOG)
        self.assertEqual([], errors)
        self.assertEqual(4, role_count)
        self.assertEqual(3, team_count)

    def test_rejects_schema_extras_and_duplicate_worker_ids(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            catalog = self.copy_catalog(Path(temp))
            path = catalog / "teams/race-triad.json"
            team = json.loads(path.read_text(encoding="utf-8"))
            team["raw_command"] = "not allowed"
            team["workers"][1]["id"] = team["workers"][0]["id"]
            path.write_text(json.dumps(team), encoding="utf-8")

            errors, _, _ = validate_catalog.validate_catalog(catalog)
            self.assertTrue(any("unsupported key raw_command" in error for error in errors))
            self.assertTrue(any("duplicate worker id" in error for error in errors))

    def test_rejects_unknown_roles_homogeneous_teams_and_write_defaults(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            catalog = self.copy_catalog(Path(temp))
            team_path = catalog / "teams/research-triad.json"
            team = json.loads(team_path.read_text(encoding="utf-8"))
            for worker in team["workers"]:
                worker["harness"] = "codex"
            team["workers"][0]["role"] = "missing-role"
            team_path.write_text(json.dumps(team), encoding="utf-8")

            role_path = catalog / "roles/independent-researcher.json"
            role = json.loads(role_path.read_text(encoding="utf-8"))
            role["default_permission_profile"] = "workspace-write"
            role["instructions"] = ["   "]
            role_path.write_text(json.dumps(role), encoding="utf-8")

            errors, _, _ = validate_catalog.validate_catalog(catalog)
            self.assertTrue(any("unknown role" in error for error in errors))
            self.assertTrue(any("two distinct harnesses" in error for error in errors))
            self.assertTrue(any("schema constant" in error for error in errors))
            self.assertTrue(any("schema pattern" in error for error in errors))


if __name__ == "__main__":
    unittest.main()
