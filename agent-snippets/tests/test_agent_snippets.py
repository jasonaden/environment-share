from __future__ import annotations

import os
from pathlib import Path
import subprocess
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
CLI = ROOT / "agent-snippets"
SNIPPET_ID = "delegated-task-lifecycle"


class AgentSnippetsTests(unittest.TestCase):
    def run_cli(self, *arguments: str, home: Path | None = None) -> subprocess.CompletedProcess[str]:
        environment = os.environ.copy()
        environment["AGENT_SNIPPETS_CATALOG_DIR"] = str(ROOT)
        if home is not None:
            environment["HOME"] = str(home)
            environment.pop("CLAUDE_CONFIG_DIR", None)
            environment.pop("CODEX_HOME", None)
            environment.pop("PI_CODING_AGENT_DIR", None)
        return subprocess.run(
            [str(CLI), *arguments],
            check=False,
            capture_output=True,
            text=True,
            env=environment,
        )

    def test_list_details_includes_description_notes_and_content(self) -> None:
        result = self.run_cli("list", "--details")
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertIn(SNIPPET_ID, result.stdout)
        self.assertIn("Requires an environment", result.stdout)
        self.assertIn("## Task lifecycle", result.stdout)

    def test_install_preserves_user_edits_and_uninstall_removes_marked_block(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            target = Path(temp) / "CLAUDE.md"
            original = "# Existing instructions\n\nKeep this exact text.\n"
            target.write_text(original, encoding="utf-8")

            installed = self.run_cli("install", SNIPPET_ID, "--target", str(target))
            self.assertEqual(0, installed.returncode, installed.stderr)
            value = target.read_text(encoding="utf-8")
            self.assertIn("environment-share:snippet delegated-task-lifecycle BEGIN", value)
            self.assertIn("## Task lifecycle", value)
            self.assertTrue(list(Path(temp).glob("CLAUDE.md.backup.*")))

            target.write_text(value.replace("Build the feature", "Build and test the feature"), encoding="utf-8")
            repeated = self.run_cli("install", SNIPPET_ID, "--target", str(target))
            self.assertEqual(0, repeated.returncode, repeated.stderr)
            self.assertIn("left unchanged", repeated.stdout)
            self.assertIn("Build and test the feature", target.read_text(encoding="utf-8"))

            removed = self.run_cli("uninstall", SNIPPET_ID, "--target", str(target))
            self.assertEqual(0, removed.returncode, removed.stderr)
            self.assertEqual(original, target.read_text(encoding="utf-8"))

    def test_agent_shortcuts_resolve_user_instruction_files(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            home = Path(temp)
            for agent, relative in (
                ("claude", ".claude/CLAUDE.md"),
                ("codex", ".codex/AGENTS.md"),
                ("pi", ".pi/agent/AGENTS.md"),
            ):
                result = self.run_cli("install", SNIPPET_ID, "--agent", agent, home=home)
                self.assertEqual(0, result.returncode, result.stderr)
                self.assertIn("## Task lifecycle", (home / relative).read_text(encoding="utf-8"))

    def test_refuses_symlink_and_malformed_markers(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            outside = root / "outside.md"
            outside.write_text("outside\n", encoding="utf-8")
            linked = root / "linked.md"
            linked.symlink_to(outside)
            result = self.run_cli("install", SNIPPET_ID, "--target", str(linked))
            self.assertEqual(2, result.returncode)
            self.assertEqual("outside\n", outside.read_text(encoding="utf-8"))

            malformed = root / "malformed.md"
            malformed.write_text(
                "<!-- environment-share:snippet delegated-task-lifecycle BEGIN — text -->\n",
                encoding="utf-8",
            )
            result = self.run_cli("uninstall", SNIPPET_ID, "--target", str(malformed))
            self.assertEqual(2, result.returncode)
            self.assertIn("without an end marker", result.stderr)


if __name__ == "__main__":
    unittest.main()
