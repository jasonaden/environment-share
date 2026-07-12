from __future__ import annotations

import importlib.util
import hashlib
import io
import json
import os
from pathlib import Path
import re
import shlex
import subprocess
import sys
import tempfile
import unittest
from unittest import mock


ROOT = Path(__file__).resolve().parents[3]
SCRIPT = ROOT / "agent-skills/cmux-orchestrate-agents/scripts/cmux_team.py"
SPEC = importlib.util.spec_from_file_location("cmux_team", SCRIPT)
assert SPEC and SPEC.loader
cmux_team = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(cmux_team)


TRUE = Path("/usr/bin/true")


def private_run_dir(temp_root: Path, repository: Path, run_id: str) -> tuple[Path, Path]:
    state = temp_root / "state"
    namespace = hashlib.sha256(str(repository.resolve()).encode("utf-8")).hexdigest()[:12]
    run_dir = state / namespace / run_id
    for path in (state, run_dir.parent, run_dir):
        cmux_team.ensure_private_dir(path)
    return state, run_dir


def write_private_json(path: Path, value: object) -> None:
    cmux_team.atomic_write_json(path, value)


def binary_run_fields(names: tuple[str, ...]) -> dict:
    identity = cmux_team.binary_identity(TRUE)
    return {
        "binaries": {name: str(TRUE) for name in names},
        "binary_identities": {name: identity for name in names},
    }


def contract_digest(manifest_path: Path, task_path: Path) -> str:
    manifest, task, _ = cmux_team.load_contracts(manifest_path, task_path)
    roles = cmux_team.resolve_manifest_roles(manifest, str(ROOT / "agent-catalog"))
    return cmux_team.approval_digest(manifest, task, roles)


class ContractTests(unittest.TestCase):
    def setUp(self) -> None:
        self.repository = ROOT.resolve()

    def manifest(self) -> dict:
        return {
            "schema_version": 1,
            "name": "test-team",
            "mode": "heterogeneous",
            "topology": "workspace-group",
            "repository": str(self.repository),
            "git_strategy": "shared-read-only",
            "workers": [
                {
                    "id": "codex-review",
                    "harness": "codex",
                    "role": "independent-researcher",
                    "assignment": "Review the implementation.",
                    "permission_profile": "read-only",
                },
                {
                    "id": "pi-review",
                    "harness": "pi",
                    "role": "independent-researcher",
                    "assignment": "Challenge the result.",
                    "permission_profile": "read-only",
                },
            ],
            "timeouts": {
                "ready_seconds": 60,
                "task_seconds": 1800,
                "stop_seconds": 15,
            },
        }

    def test_accepts_read_only_heterogeneous_manifest(self) -> None:
        errors, _, normalized = cmux_team.validate_manifest(self.manifest())
        self.assertEqual([], errors)
        self.assertEqual(str(self.repository), normalized["repository"])

    def test_rejects_homogeneous_fleet(self) -> None:
        manifest = self.manifest()
        manifest["workers"][1]["harness"] = "codex"
        errors, _, _ = cmux_team.validate_manifest(manifest)
        self.assertTrue(any("native team" in error for error in errors))

    def test_rejects_write_profile_and_environment_injection(self) -> None:
        manifest = self.manifest()
        manifest["workers"][0]["permission_profile"] = "workspace-write"
        manifest["workers"][0]["env"] = {"TOKEN": "secret"}
        errors, _, _ = cmux_team.validate_manifest(manifest)
        self.assertTrue(any("read-only" in error for error in errors))
        self.assertTrue(any("unsupported keys" in error for error in errors))

    def test_rejects_task_control_characters(self) -> None:
        for control in ("\x00", "\u0085"):
            errors, _ = cmux_team.validate_task(
                {
                    "schema_version": 1,
                    "task_id": "test-task",
                    "instructions": f"inspect{control}repo",
                    "acceptance_criteria": ["cite evidence"],
                }
            )
            self.assertTrue(any("control characters" in error for error in errors), repr(control))

    def test_rejects_boolean_versions_timeouts_and_unsafe_models(self) -> None:
        manifest = self.manifest()
        manifest["schema_version"] = True
        manifest["timeouts"]["ready_seconds"] = True
        manifest["workers"][0]["model"] = None
        errors, _, _ = cmux_team.validate_manifest(manifest)
        self.assertTrue(any("schema_version" in error for error in errors))
        self.assertTrue(any("ready_seconds" in error for error in errors))
        self.assertTrue(any("model" in error for error in errors))
        for model in ("-danger", "line\nbreak", " trailing "):
            manifest = self.manifest()
            manifest["workers"][0]["model"] = model
            errors, _, _ = cmux_team.validate_manifest(manifest)
            self.assertTrue(any("model" in error for error in errors), model)

    def test_catalog_resolution_rejects_unknown_role(self) -> None:
        manifest = self.manifest()
        manifest["workers"][0]["role"] = "missing-role"
        with self.assertRaises(cmux_team.FleetError):
            cmux_team.resolve_manifest_roles(manifest, str(ROOT / "agent-catalog"))

    def test_rejects_sensitive_repository_paths_without_reading_contents(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            repository = Path(temp)
            subprocess.run([str(cmux_team.GIT_BIN), "init", "-q", str(repository)], check=True)
            (repository / ".env").write_text("SECRET=canary", encoding="utf-8")
            manifest = self.manifest()
            manifest["repository"] = str(repository)
            errors, _, _ = cmux_team.validate_manifest(manifest)
            self.assertTrue(any("secret-free" in error and ".env" in error for error in errors))

    def test_read_json_rejects_duplicate_keys(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / "duplicate.json"
            path.write_text('{"schema_version":1,"schema_version":2}', encoding="utf-8")
            with self.assertRaises(cmux_team.FleetError):
                cmux_team.read_json(path)

    def test_read_json_wraps_excessive_nesting_as_fleet_error(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / "deep.json"
            path.write_text("[" * 2000 + "0" + "]" * 2000, encoding="utf-8")
            with self.assertRaises(cmux_team.FleetError):
                cmux_team.read_json(path)

    def test_safe_json_loads_has_interpreter_independent_depth_limit(self) -> None:
        maximum = cmux_team.MAX_JSON_NESTING_DEPTH
        accepted = "[" * maximum + "0" + "]" * maximum
        rejected = "[" * (maximum + 1) + "0" + "]" * (maximum + 1)
        self.assertIsNotNone(cmux_team.safe_json_loads(accepted))
        with self.assertRaisesRegex(ValueError, "JSON nesting exceeds"):
            cmux_team.safe_json_loads(rejected)

    def test_json_nesting_guard_ignores_brackets_and_escaped_quotes_in_strings(self) -> None:
        value = '{"text":"[{}] \\\" still a string"}'
        self.assertEqual(
            {"text": '[{}] " still a string'},
            cmux_team.safe_json_loads(value),
        )

    def test_rejects_private_state_that_overlaps_repository(self) -> None:
        with mock.patch.dict(
            os.environ,
            {"CMUX_AGENT_STATE_HOME": str(self.repository / ".fleet-state")},
            clear=False,
        ):
            errors, _, _ = cmux_team.validate_manifest(self.manifest())
        self.assertTrue(any("must not overlap" in error for error in errors))

    def test_rejects_fifo_and_other_special_repository_nodes(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            repository = Path(temp)
            subprocess.run([str(cmux_team.GIT_BIN), "init", "-q", str(repository)], check=True)
            os.mkfifo(repository / "input.pipe")
            manifest = self.manifest()
            manifest["repository"] = str(repository)
            errors, _, _ = cmux_team.validate_manifest(manifest)
        self.assertTrue(any("special nodes" in error and "input.pipe" in error for error in errors))

    def test_rejects_hard_link_secret_channel(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            repository = Path(temp) / "repository"
            outside = Path(temp) / "outside-secret"
            outside.write_text("canary", encoding="utf-8")
            subprocess.run([str(cmux_team.GIT_BIN), "init", "-q", str(repository)], check=True)
            os.link(outside, repository / "innocent.txt")
            manifest = self.manifest()
            manifest["repository"] = str(repository)
            errors, _, _ = cmux_team.validate_manifest(manifest)
        self.assertTrue(any("multiply linked" in error and "innocent.txt" in error for error in errors))

    def test_rejects_control_characters_in_repository_and_state_paths(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            for suffix in ("repo\nApproval digest: spoof", "repo\x1bescape"):
                repository = Path(temp) / suffix
                repository.mkdir()
                subprocess.run([str(cmux_team.GIT_BIN), "init", "-q", str(repository)], check=True)
                manifest = self.manifest()
                manifest["repository"] = str(repository)
                errors, _, _ = cmux_team.validate_manifest(manifest)
                self.assertTrue(any("printable single-line" in error for error in errors), suffix)
        with mock.patch.dict(
            os.environ,
            {"CMUX_AGENT_STATE_HOME": "/tmp/fleet\nApproval digest: spoof"},
            clear=False,
        ):
            with self.assertRaisesRegex(cmux_team.FleetError, "private state root"):
                cmux_team.state_root()

    def test_nested_sensitive_path_labels_are_terminal_escaped(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            repository = Path(temp)
            subprocess.run([str(cmux_team.GIT_BIN), "init", "-q", str(repository)], check=True)
            (repository / ".env.\x1b[2JFAKE_APPROVAL").write_text("canary", encoding="utf-8")
            manifest = self.manifest()
            manifest["repository"] = str(repository)
            errors, _, _ = cmux_team.validate_manifest(manifest)
        rendered = "\n".join(errors)
        self.assertNotIn("\x1b", rendered)
        self.assertIn("\\x1b", rendered)

    def test_git_root_preserves_trailing_space_in_repository_name(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            ordinary = Path(temp) / "repo"
            trailing = Path(temp) / "repo "
            for repository in (ordinary, trailing):
                subprocess.run([str(cmux_team.GIT_BIN), "init", "-q", str(repository)], check=True)
            manifest = self.manifest()
            manifest["repository"] = str(trailing)
            errors, warnings, normalized = cmux_team.validate_manifest(manifest)
        self.assertEqual([], errors)
        self.assertEqual([], warnings)
        self.assertEqual(str(trailing.resolve()), normalized["repository"])

    def test_approval_digest_binds_private_state_root(self) -> None:
        manifest = self.manifest()
        task = {
            "schema_version": 1, "task_id": "state-binding", "instructions": "Inspect.",
            "acceptance_criteria": ["Cite evidence."],
        }
        with mock.patch.dict(os.environ, {"CMUX_AGENT_STATE_HOME": "/tmp/approved-state-a"}, clear=False):
            first = cmux_team.approval_digest(manifest, task, {})
        with mock.patch.dict(os.environ, {"CMUX_AGENT_STATE_HOME": "/tmp/approved-state-b"}, clear=False):
            second = cmux_team.approval_digest(manifest, task, {})
        self.assertNotEqual(first, second)


class CatalogTests(unittest.TestCase):
    def test_team_profiles_reference_existing_roles_and_multiple_harnesses(self) -> None:
        catalog = ROOT / "agent-catalog"
        roles = {path.stem for path in (catalog / "roles").glob("*.json")}
        for team_path in (catalog / "teams").glob("*.json"):
            team = json.loads(team_path.read_text(encoding="utf-8"))
            self.assertGreaterEqual(len({worker["harness"] for worker in team["workers"]}), 2)
            for worker in team["workers"]:
                self.assertIn(worker["role"], roles, f"{team_path}: {worker['role']}")

    def test_published_manifest_example_uses_catalog_roles(self) -> None:
        reference = (ROOT / "agent-skills/cmux-orchestrate-agents/references/manifest.md").read_text(encoding="utf-8")
        match = re.search(r"```json\n(\{.*?\n\})\n```", reference, re.DOTALL)
        self.assertIsNotNone(match)
        manifest = json.loads(match.group(1))
        roles = {path.stem for path in (ROOT / "agent-catalog/roles").glob("*.json")}
        for worker in manifest["workers"]:
            self.assertIn(worker["role"], roles)

    def test_runtime_role_loader_enforces_schema_string_bounds_and_uniqueness(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            catalog = Path(temp)
            (catalog / "roles").mkdir()
            (catalog / "teams").mkdir()
            base = {
                "schema_version": 1,
                "id": "bounded-role",
                "summary": "Bounded role.",
                "default_permission_profile": "read-only",
                "instructions": ["Inspect evidence."],
            }
            for label, changes in (
                ("summary", {"summary": "x" * 501}),
                ("instruction", {"instructions": ["x" * 2001]}),
                ("duplicate", {"instructions": ["same", "same"]}),
            ):
                role = {**base, **changes}
                write_private_json(catalog / "roles/bounded-role.json", role)
                with self.subTest(label=label), self.assertRaisesRegex(cmux_team.FleetError, "invalid role"):
                    cmux_team.load_role("bounded-role", catalog)


class ProviderTests(unittest.TestCase):
    def test_doctor_can_select_harnesses_and_gate_launch_readiness(self) -> None:
        payload = {"ready_for_plan": True, "ready_for_launch": False}
        with mock.patch.object(cmux_team, "doctor_data", return_value=payload) as doctor, \
            mock.patch("sys.stdout", new_callable=io.StringIO):
            launch_code = cmux_team.main([
                "doctor", "--json", "--require-launch",
                "--harness", "codex", "--harness", "pi",
            ])
        self.assertEqual(1, launch_code)
        doctor.assert_called_once_with({"codex", "pi"})

        with mock.patch.object(cmux_team, "doctor_data", return_value=payload), \
            mock.patch("sys.stdout", new_callable=io.StringIO):
            self.assertEqual(0, cmux_team.main(["doctor", "--json"]))

    def test_real_selected_pi_doctor_matches_reviewed_baseline_without_live_config_writes(self) -> None:
        if not cmux_team.find_binary("pi") or not cmux_team.find_binary("cmux"):
            self.skipTest("Pi/Cmux are not installed")
        data = cmux_team.doctor_data({"pi"})
        self.assertEqual(["pi"], data["required_harnesses"])
        self.assertTrue(data["binaries"]["pi"]["version_reviewed"])
        self.assertTrue(data["binaries"]["cmux"]["version_reviewed"])
        self.assertTrue(all(item["version_reviewed"] for item in data["read_tool_dependencies"].values()))
        self.assertTrue(data["ready_for_plan"])

    def test_worker_environment_cannot_discover_live_cmux_context(self) -> None:
        with tempfile.TemporaryDirectory() as temp, mock.patch.dict(
            os.environ,
            {
                "CMUX_WORKSPACE_ID": "live-workspace",
                "CMUX_SURFACE_ID": "live-surface",
                "CMUX_SOCKET_PATH": "/tmp/live.sock",
                "UNRELATED_SECRET": "must-not-propagate",
                "OPENAI_API_KEY": "provider-auth-signal",
            },
            clear=False,
        ), mock.patch.object(cmux_team, "find_pi_node", return_value=TRUE):
            environment = cmux_team.isolated_worker_environment(
                "pi", Path("/pi/bin/pi"), Path(temp) / "worker", ROOT
            )
        self.assertNotIn("CMUX_WORKSPACE_ID", environment)
        self.assertNotIn("CMUX_SURFACE_ID", environment)
        self.assertNotEqual("/tmp/live.sock", environment["CMUX_SOCKET_PATH"])
        self.assertNotIn("UNRELATED_SECRET", environment)
        self.assertEqual("1", environment["CMUX_CODEX_HOOKS_DISABLED"])
        self.assertEqual("1", environment["CMUX_PI_HOOKS_DISABLED"])
        self.assertEqual("1", environment["PI_OFFLINE"])
        self.assertNotIn("/tmp/live.sock", environment["PATH"])

    def test_auth_signals_honor_custom_roots_keychain_status_and_official_token(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            pi_root = Path(temp) / "pi-agent"
            pi_root.mkdir()
            (pi_root / "auth.json").write_text("{}\n", encoding="utf-8")
            with mock.patch.dict(
                os.environ, {"PI_CODING_AGENT_DIR": str(pi_root)}, clear=True,
            ):
                self.assertTrue(cmux_team.provider_authentication_signal("pi", None))

            claude_root = Path(temp) / "claude"
            completed = {
                "returncode": 0,
                "stdout": b'{"loggedIn":true,"authMethod":"claude.ai"}\n',
                "stderr": b"",
                "timed_out": False,
                "output_limited": False,
            }
            with mock.patch.dict(
                os.environ, {"CLAUDE_CONFIG_DIR": str(claude_root)}, clear=True,
            ), mock.patch.object(cmux_team, "run_bounded_bytes", return_value=completed) as status:
                self.assertTrue(cmux_team.provider_authentication_signal("claude", TRUE))
            self.assertEqual(str(claude_root), status.call_args.args[2]["CLAUDE_CONFIG_DIR"])

        with mock.patch.dict(
            os.environ, {"ANTHROPIC_AUTH_TOKEN": "token-signal"}, clear=True,
        ):
            self.assertTrue(cmux_team.provider_authentication_signal("claude", None))
            self.assertEqual(
                "token-signal",
                cmux_team.provider_environment("claude", TRUE)["ANTHROPIC_AUTH_TOKEN"],
            )

    def test_codex_argv_is_read_only_and_ephemeral(self) -> None:
        argv = cmux_team.provider_argv(
            {"harness": "codex"}, Path("/bin/codex"), ROOT,
            Path("/tmp/prompt"), Path("/tmp/last"),
        )
        rendered = " ".join(argv)
        self.assertNotIn("--sandbox", argv)
        self.assertIn('default_permissions="cmux-fleet-read"', argv)
        self.assertTrue(any('":root"="deny"' in item for item in argv))
        self.assertTrue(any('**/.git/**"="deny' in item for item in argv))
        self.assertIn("allow_login_shell=false", argv)
        self.assertIn("--skip-git-repo-check", argv)
        self.assertIn("--ask-for-approval never", rendered)
        self.assertIn("--ephemeral", argv)
        self.assertIn("--ignore-user-config", argv)
        self.assertIn("--ignore-rules", argv)
        self.assertNotIn("tools.view_image=false", argv)
        self.assertNotIn("dangerously", rendered)

    def test_claude_argv_uses_plan_and_read_tools(self) -> None:
        argv = cmux_team.provider_argv(
            {"harness": "claude"}, Path("/bin/claude"), ROOT,
            Path("/tmp/prompt"), Path("/tmp/last"),
        )
        rendered = " ".join(argv)
        self.assertIn("--permission-mode plan", rendered)
        self.assertIn("Read,Grep,Glob", argv)
        self.assertIn("--allowedTools", argv)
        self.assertIn("--safe-mode", argv)
        self.assertIn("--no-chrome", argv)
        self.assertIn("--setting-sources", argv)
        self.assertIn("--settings", argv)
        settings = json.loads(argv[argv.index("--settings") + 1])
        self.assertEqual(
            {"mcpServers": {}},
            json.loads(argv[argv.index("--mcp-config") + 1]),
        )
        self.assertEqual("/", settings["sandbox"]["filesystem"]["denyRead"][0])
        self.assertTrue(any(item.endswith("/**/.env") for item in settings["sandbox"]["filesystem"]["denyRead"]))
        self.assertIn(f"{ROOT}/.git/**", settings["sandbox"]["filesystem"]["denyRead"])
        self.assertEqual([str(ROOT)], settings["sandbox"]["filesystem"]["allowRead"])
        self.assertNotIn("dangerously", rendered)

    def test_pi_argv_disables_project_resources_and_writes(self) -> None:
        argv = cmux_team.provider_argv(
            {"harness": "pi", "model": "openai-codex/gpt-5.4-mini"}, Path("/pi/bin/pi"), ROOT,
            Path("/tmp/prompt"), Path("/tmp/last"),
        )
        self.assertIn("--no-approve", argv)
        self.assertIn("read,grep,ls", argv)
        self.assertIn(str(cmux_team.PI_REPOSITORY_GUARD_PATH), argv)
        self.assertNotIn("bash", argv)
        self.assertNotIn("write", argv)
        self.assertLess(argv.index("--model"), argv.index("@/tmp/prompt"))


class PiRepositoryGuardTests(unittest.TestCase):
    def test_guard_blocks_all_documented_escape_forms(self) -> None:
        node = Path.home() / ".local/share/pi-node/current/bin/node"
        if not node.is_file():
            self.skipTest("stable Pi Node runtime is not installed")
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            repository = root / "repository"
            repository.mkdir()
            (repository / "inside.txt").write_text("inside", encoding="utf-8")
            (repository / ".env").write_text("SECRET=canary", encoding="utf-8")
            (repository / ".git").mkdir()
            (repository / ".git/config").write_text("credential=canary", encoding="utf-8")
            outside = root / "outside file.txt"
            outside.write_text("outside", encoding="utf-8")
            (repository / "escape").symlink_to(outside)
            script = f"""
                import guard from {json.dumps(cmux_team.PI_REPOSITORY_GUARD_PATH.as_uri())};
                let handler;
                guard({{on(name, fn) {{ if (name === 'tool_call') handler = fn; }}}});
                const outside = {json.dumps(str(outside))};
                const nbspOutside = outside.replace(' ', '\\u00a0');
                await import('node:fs').then(fs => fs.writeFileSync('late.pem', 'LATE-CANARY'));
                const calls = [
                  {{toolName:'read', input:{{path:'inside.txt'}}}},
                  {{toolName:'read', input:{{path:'.env'}}}},
                  {{toolName:'read', input:{{path:outside}}}},
                  {{toolName:'read', input:{{path:'../outside file.txt'}}}},
                  {{toolName:'read', input:{{path:'~/.ssh'}}}},
                  {{toolName:'read', input:{{path:'@' + outside}}}},
                  {{toolName:'read', input:{{path:'file://' + outside}}}},
                  {{toolName:'read', input:{{path:nbspOutside}}}},
                  {{toolName:'read', input:{{path:'escape'}}}},
                  {{toolName:'read', input:{{path:'.git/config'}}}},
                  {{toolName:'grep', input:{{path:'.', pattern:'LATE-CANARY', glob:'**/*.pem'}}}},
                  {{toolName:'grep', input:{{path:'inside.txt', pattern:'inside'}}}},
                  {{toolName:'grep', input:{{path:'inside.txt', pattern:'inside', glob:'**/*.pem'}}}},
                  {{toolName:'find', input:{{path:'.', pattern:'*.txt'}}}},
                  {{toolName:'bash', input:{{command:'pwd'}}}},
                ];
                const results = [];
                for (const call of calls) results.push((await handler(call)) ?? null);
                console.log(JSON.stringify(results));
            """
            environment = dict(os.environ)
            environment["CMUX_AGENT_REPOSITORY"] = str(repository)
            result = subprocess.run(
                [str(node), "--experimental-strip-types", "-e", script],
                cwd=repository, env=environment, capture_output=True, text=True, timeout=20,
            )
            self.assertEqual(0, result.returncode, result.stderr)
            outcomes = json.loads(result.stdout.strip().splitlines()[-1])
            self.assertIsNone(outcomes[0])
            self.assertIsNone(outcomes[11])
            blocked = [item for index, item in enumerate(outcomes) if index not in {0, 11}]
            self.assertTrue(all(item and item["block"] is True for item in blocked))


class ResultTests(unittest.TestCase):
    RESULT = {
        "status": "completed",
        "summary": "done",
        "findings": [{"title": "x", "evidence": "a.py:1", "impact": "risk"}],
        "changed_files": [],
        "checks": ["read file"],
        "risks": [],
    }

    def test_worker_prompt_requires_strict_unrepaired_json(self) -> None:
        manifest = {"repository": str(ROOT)}
        task = {
            "instructions": "Inspect.",
            "acceptance_criteria": ["Cite evidence."],
        }
        worker = {
            "id": "pi-review",
            "role": "independent-researcher",
            "assignment": "Challenge the result.",
        }
        prompt = cmux_team.build_prompt(
            "run-id", manifest, task, worker,
            {"instructions": ["Stay read-only."]},
        )
        self.assertIn("exactly one RFC 8259 JSON object", prompt)
        self.assertIn("parses without repair", prompt)
        self.assertIn("quoted environment-variable expressions", prompt)
        self.assertIn("`changed_files` is an empty array", prompt)

    def test_extracts_nested_structured_output(self) -> None:
        raw = json.dumps({"type": "result", "structured_output": self.RESULT})
        result, errors = cmux_team.extract_agent_result(raw, Path("/missing"))
        self.assertEqual(self.RESULT, result)
        self.assertEqual([], errors)

    def test_rejects_claimed_changed_files(self) -> None:
        result = dict(self.RESULT)
        result["changed_files"] = ["a.py"]
        self.assertTrue(cmux_team.validate_agent_result(result))

    def test_notification_alone_is_not_a_result(self) -> None:
        result, errors = cmux_team.extract_agent_result(
            '{"event":"notification.created","workspace_id":"abc"}', Path("/missing")
        )
        self.assertIsNone(result)
        self.assertTrue(errors)

    def test_deep_or_brace_heavy_output_is_bounded_and_invalid(self) -> None:
        value: object = self.RESULT
        for _ in range(30):
            value = {"content": value}
        result, errors = cmux_team.extract_agent_result(json.dumps(value), Path("/missing"))
        self.assertIsNone(result)
        self.assertTrue(errors)
        result, errors = cmux_team.extract_agent_result("{" * 100000, Path("/missing"))
        self.assertIsNone(result)
        self.assertTrue(errors)
        result, errors = cmux_team.extract_agent_result("[" * 1100 + "0" + "]" * 1100, Path("/missing"))
        self.assertIsNone(result)
        self.assertTrue(errors)
        wide = "[" + ",".join("[]" for _ in range(20000)) + "]"
        result, errors = cmux_team.extract_agent_result(wide, Path("/missing"))
        self.assertIsNone(result)
        self.assertTrue(errors)

    def test_giant_json_integer_is_rejected_by_bounded_parser(self) -> None:
        raw = '{"number":' + ("9" * 1_000_000) + "}"
        result, errors = cmux_team.extract_agent_result(raw, Path("/missing"))
        self.assertIsNone(result)
        self.assertTrue(errors)

    def test_subprocess_capture_stops_at_hard_byte_limit(self) -> None:
        result = cmux_team.run_bounded_bytes(
            [sys.executable, "-c", "import sys; sys.stdout.buffer.write(b'x' * 100000)"],
            timeout=5,
            environment={"PATH": "/usr/bin:/bin"},
            max_bytes=1024,
        )
        self.assertTrue(result["output_limited"])
        self.assertLessEqual(len(result["stdout"]) + len(result["stderr"]), 1024)

    def test_visible_provider_output_escapes_ansi_osc_and_control_bytes(self) -> None:
        raw = "before\x1b]52;c;Y2FuYXJ5\x07\x1b[2Jafter\rrewind\nnext\tcolumn"
        visible = cmux_team.terminal_safe_stream_text(raw)
        for control in ("\x1b", "\x07", "\r", "\t"):
            self.assertNotIn(control, visible)
        self.assertIn("\\x1b]52", visible)
        self.assertIn("\\x1b[2J", visible)
        self.assertIn("\\x07", visible)
        self.assertIn("\\x0d", visible)
        self.assertIn("\\x09", visible)
        self.assertIn("\n", visible)
        prefixed, at_line_start = cmux_team.terminal_safe_visible_chunk(raw, True)
        self.assertTrue(prefixed.startswith("[provider] before"))
        self.assertIn("\n[provider] next", prefixed)
        self.assertFalse(at_line_start)

    def test_cli_error_sink_escapes_control_characters(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            manifest = Path(temp) / "manifest.json"
            task = Path(temp) / "task.json"
            manifest.write_text('{"\\u001b[2J":1,"\\u001b[2J":2}', encoding="utf-8")
            task.write_text("{}", encoding="utf-8")
            with mock.patch("sys.stderr", new_callable=io.StringIO) as stderr:
                code = cmux_team.main([
                    "validate", "--manifest", str(manifest), "--task", str(task),
                ])
            rendered = stderr.getvalue()
        self.assertEqual(2, code)
        self.assertNotIn("\x1b", rendered)
        self.assertIn("\\x1b", rendered)

    def test_provider_release_timeout_covers_sequential_cmux_mutations(self) -> None:
        manifest = {
            "workers": [{}, {}, {}],
            "timeouts": {"ready_seconds": 5},
        }
        self.assertEqual(275, cmux_team.provider_release_timeout(manifest))

    def test_resume_gap_requires_reconciliation(self) -> None:
        self.assertTrue(cmux_team.event_reports_resume_gap({"ack": {"resume": {"gap": 3}}}))
        self.assertFalse(cmux_team.event_reports_resume_gap({"ack": {"resume": {"gap": 0}}}))

    def test_event_ack_requires_cmux_protocol_v1_and_boolean_gap(self) -> None:
        valid = {
            "type": "ack", "protocol": "cmux-events", "version": 1,
            "resume": {"gap": False},
        }
        self.assertEqual([], cmux_team.event_ack_errors(valid))
        self.assertTrue(cmux_team.event_ack_errors({"type": "event", "resume": {"gap": 0}}))

    def test_monitor_health_rejects_stopped_process_and_stale_heartbeat(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            run_dir = Path(temp)
            write_private_json(run_dir / "monitor-started.json", {
                "at": cmux_team.utc_now(), "pid": 123, "start_signature": "start",
            })
            write_private_json(run_dir / "monitor-heartbeat.json", {"at": cmux_team.utc_now()})
            stopped = {"pgid": 123, "state": "T", "started": "start", "command": "monitor"}
            healthy = {"pgid": 123, "state": "S+", "started": "start", "command": "monitor"}
            with mock.patch.object(cmux_team, "process_identity", return_value=stopped):
                self.assertFalse(cmux_team.monitor_is_alive(run_dir))
            with mock.patch.object(cmux_team, "process_identity", return_value=healthy):
                self.assertTrue(cmux_team.monitor_is_alive(run_dir))
            stale = (
                cmux_team.dt.datetime.now(cmux_team.dt.timezone.utc)
                - cmux_team.dt.timedelta(seconds=cmux_team.MONITOR_HEARTBEAT_MAX_AGE_SECONDS + 1)
            ).isoformat()
            write_private_json(run_dir / "monitor-heartbeat.json", {"at": stale})
            with mock.patch.object(cmux_team, "process_identity", return_value=healthy):
                self.assertFalse(cmux_team.monitor_is_alive(run_dir))

    def test_worker_wraps_valid_output_as_needs_review(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            temp_root = Path(temp)
            run_id = "20260711-120000-worker-test-abcdef12"
            state, run_dir = private_run_dir(temp_root, ROOT, run_id)
            worker_dir = run_dir / "workers/reviewer"
            cmux_team.ensure_private_dir(worker_dir)
            manifest = {
                "repository": str(ROOT.resolve()),
                "workers": [{
                    "id": "reviewer", "harness": "claude", "role": "independent-researcher",
                    "assignment": "Inspect.", "permission_profile": "read-only",
                }],
                "timeouts": {"ready_seconds": 5, "task_seconds": 30, "stop_seconds": 1},
            }
            task = {
                "task_id": "review-task",
                "instructions": "Inspect without changes.",
                "acceptance_criteria": ["Cite evidence."],
            }
            run = {
                "schema_version": 1,
                "run_id": run_id,
                "repository": str(ROOT.resolve()),
                **binary_run_fields(("claude", "cmux")),
            }
            topology = {
                "control": None,
                "group": None,
                "original_anchor": None,
                "workers": {"reviewer": {"uuid": "00000000-0000-4000-8000-000000000099"}},
            }
            write_private_json(run_dir / "manifest.json", manifest)
            write_private_json(run_dir / "task.json", task)
            write_private_json(run_dir / "run.json", run)
            write_private_json(run_dir / "topology.json", topology)
            write_private_json(worker_dir / "role.json", {"id": "independent-researcher", "instructions": []})
            write_private_json(worker_dir / "topology.ready", {"at": "test"})
            write_private_json(run_dir / "topology.ready", {"at": "test"})
            run["baseline_git"] = cmux_team.git_status_fingerprint(ROOT)
            write_private_json(run_dir / "run.json", run)
            raw = json.dumps({"structured_output": self.RESULT})
            with mock.patch.dict(os.environ, {"CMUX_AGENT_STATE_HOME": str(state)}, clear=False), \
                mock.patch.object(cmux_team, "find_binary", return_value=TRUE), \
                mock.patch.object(cmux_team, "stream_process", return_value=(0, False, False, raw)), \
                mock.patch.object(cmux_team, "monitor_is_alive", return_value=True), \
                mock.patch.object(cmux_team, "set_workspace_status"):
                result_code = cmux_team.worker_main(run_dir, "reviewer")
            wrapped = json.loads((worker_dir / "result.json").read_text(encoding="utf-8"))
            self.assertEqual(0, result_code)
            self.assertEqual("needs_review", wrapped["disposition"])
            self.assertTrue(wrapped["validation"]["read_only_checkout_unchanged"])
            self.assertEqual(
                [],
                cmux_team.validate_collected_worker_result(
                    wrapped,
                    cmux_team.read_json(worker_dir / "exit.json"),
                    run,
                    task,
                    manifest["workers"][0],
                ),
            )
            with mock.patch.dict(os.environ, {"CMUX_AGENT_STATE_HOME": str(state)}, clear=False):
                with self.assertRaisesRegex(cmux_team.FleetError, "replay"):
                    cmux_team.worker_main(run_dir, "reviewer")

    def test_worker_refuses_provider_call_when_launch_baseline_changed(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            run_id = "20260711-120000-baseline-gate-abcdef12"
            state, run_dir = private_run_dir(Path(temp), ROOT, run_id)
            worker_dir = run_dir / "workers/reviewer"
            cmux_team.ensure_private_dir(worker_dir)
            current = cmux_team.git_status_fingerprint(ROOT)
            self.assertTrue(current["available"])
            stale = dict(current)
            stale["sha256"] = "0" * 64
            write_private_json(run_dir / "run.json", {
                "schema_version": 1,
                "run_id": run_id,
                "repository": str(ROOT.resolve()),
                "baseline_git": stale,
                **binary_run_fields(("claude", "cmux")),
            })
            write_private_json(run_dir / "manifest.json", {
                "repository": str(ROOT.resolve()),
                "workers": [{
                    "id": "reviewer", "harness": "claude", "role": "independent-researcher",
                    "assignment": "Inspect.", "permission_profile": "read-only",
                }],
                "timeouts": {"ready_seconds": 5, "task_seconds": 30, "stop_seconds": 1},
            })
            write_private_json(run_dir / "task.json", {
                "task_id": "baseline-gate", "instructions": "Inspect.",
                "acceptance_criteria": ["Cite evidence."],
            })
            write_private_json(run_dir / "topology.json", {
                "control": None, "group": None, "original_anchor": None,
                "workers": {"reviewer": {"uuid": "00000000-0000-4000-8000-000000000099"}},
            })
            write_private_json(worker_dir / "role.json", {"id": "independent-researcher", "instructions": []})
            write_private_json(worker_dir / "topology.ready", {"at": "test"})
            write_private_json(run_dir / "topology.ready", {"at": "test"})
            with mock.patch.dict(os.environ, {"CMUX_AGENT_STATE_HOME": str(state)}, clear=False), \
                mock.patch.object(cmux_team, "find_binary", return_value=TRUE), \
                mock.patch.object(cmux_team, "monitor_is_alive", return_value=True), \
                mock.patch.object(cmux_team, "set_workspace_status"), \
                mock.patch.object(cmux_team, "stream_process") as provider_call:
                result_code = cmux_team.worker_main(run_dir, "reviewer")
            self.assertEqual(1, result_code)
            provider_call.assert_not_called()
            wrapped = cmux_team.read_json(worker_dir / "result.json")
            self.assertEqual("failed", wrapped["disposition"])
            self.assertIn("baseline", wrapped["validation"]["errors"][0])

    def test_worker_rechecks_reconciliation_after_git_fingerprint(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            run_id = "20260711-120000-reconcile-race-abcdef12"
            state, run_dir = private_run_dir(Path(temp), ROOT, run_id)
            worker_dir = run_dir / "workers/reviewer"
            cmux_team.ensure_private_dir(worker_dir)
            baseline = cmux_team.git_status_fingerprint(ROOT)
            self.assertTrue(baseline["available"])
            manifest = {
                "repository": str(ROOT.resolve()),
                "workers": [{
                    "id": "reviewer", "harness": "claude", "role": "independent-researcher",
                    "assignment": "Inspect.", "permission_profile": "read-only",
                }],
                "timeouts": {"ready_seconds": 5, "task_seconds": 30, "stop_seconds": 1},
            }
            write_private_json(run_dir / "run.json", {
                "schema_version": 1, "run_id": run_id, "repository": str(ROOT.resolve()),
                "baseline_git": baseline, **binary_run_fields(("claude", "cmux")),
            })
            write_private_json(run_dir / "manifest.json", manifest)
            write_private_json(run_dir / "task.json", {
                "task_id": "reconcile-race", "instructions": "Inspect.",
                "acceptance_criteria": ["Cite evidence."],
            })
            write_private_json(run_dir / "topology.json", {
                "control": None, "group": None, "original_anchor": None,
                "workers": {"reviewer": {"uuid": "00000000-0000-4000-8000-000000000099"}},
            })
            write_private_json(worker_dir / "role.json", {"id": "independent-researcher", "instructions": []})
            write_private_json(worker_dir / "topology.ready", {"at": "test"})
            write_private_json(run_dir / "topology.ready", {"at": "test"})

            def fingerprint_with_reconciliation(_repository: Path) -> dict:
                write_private_json(run_dir / "reconciliation-required.json", {
                    "at": cmux_team.utc_now(), "reason": "injected-during-fingerprint",
                })
                return baseline

            with mock.patch.dict(os.environ, {"CMUX_AGENT_STATE_HOME": str(state)}, clear=False), \
                mock.patch.object(cmux_team, "find_binary", return_value=TRUE), \
                mock.patch.object(cmux_team, "git_status_fingerprint", side_effect=fingerprint_with_reconciliation), \
                mock.patch.object(cmux_team, "monitor_is_alive", return_value=True), \
                mock.patch.object(cmux_team, "set_workspace_status"), \
                mock.patch.object(cmux_team, "stream_process") as provider_call:
                with self.assertRaisesRegex(cmux_team.FleetError, "after Git validation"):
                    cmux_team.worker_main(run_dir, "reviewer")
            provider_call.assert_not_called()

    def test_worker_refuses_provider_call_when_monitor_is_dead(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            run_id = "20260711-120000-dead-monitor-abcdef12"
            state, run_dir = private_run_dir(Path(temp), ROOT, run_id)
            worker_dir = run_dir / "workers/reviewer"
            cmux_team.ensure_private_dir(worker_dir)
            baseline = cmux_team.git_status_fingerprint(ROOT)
            write_private_json(run_dir / "run.json", {
                "schema_version": 1, "run_id": run_id, "repository": str(ROOT.resolve()),
                "baseline_git": baseline, **binary_run_fields(("claude", "cmux")),
            })
            write_private_json(run_dir / "manifest.json", {
                "repository": str(ROOT.resolve()),
                "workers": [{
                    "id": "reviewer", "harness": "claude", "role": "independent-researcher",
                    "assignment": "Inspect.", "permission_profile": "read-only",
                }],
                "timeouts": {"ready_seconds": 5, "task_seconds": 30, "stop_seconds": 1},
            })
            write_private_json(run_dir / "task.json", {
                "task_id": "dead-monitor", "instructions": "Inspect.",
                "acceptance_criteria": ["Cite evidence."],
            })
            write_private_json(run_dir / "topology.json", {
                "control": None, "group": None, "original_anchor": None,
                "workers": {"reviewer": {"uuid": "00000000-0000-4000-8000-000000000099"}},
            })
            write_private_json(worker_dir / "role.json", {"id": "independent-researcher", "instructions": []})
            write_private_json(worker_dir / "topology.ready", {"at": "test"})
            write_private_json(run_dir / "topology.ready", {"at": "test"})
            write_private_json(run_dir / "listener.ready", {"at": "test"})
            with mock.patch.dict(os.environ, {"CMUX_AGENT_STATE_HOME": str(state)}, clear=False), \
                mock.patch.object(cmux_team, "find_binary", return_value=TRUE), \
                mock.patch.object(cmux_team, "set_workspace_status"), \
                mock.patch.object(cmux_team, "stream_process") as provider_call:
                with self.assertRaisesRegex(cmux_team.FleetError, "monitor is not alive"):
                    cmux_team.worker_main(run_dir, "reviewer")
            provider_call.assert_not_called()
            marker = cmux_team.read_json(run_dir / "reconciliation-required.json")
            self.assertEqual("event-monitor-health-check-failed", marker["reason"])

    def test_event_parse_loss_requires_reconciliation(self) -> None:
        class FakeStdout:
            def __init__(self) -> None:
                self.lines = [
                    b"not-json\n",
                    b'{"type":"event","workspace_id":"00000000-0000-4000-8000-000000000099"}\n',
                    b'{"type":"ack","protocol":"cmux-events","version":1,"resume":{"gap":false}}\n',
                ]

            def readline(self, _limit: int) -> bytes:
                return self.lines.pop(0) if self.lines else b""

        class FakeProcess:
            stdout = FakeStdout()

            @staticmethod
            def wait() -> int:
                return 0

        with tempfile.TemporaryDirectory() as temp:
            run_id = "20260711-120000-monitor-loss-abcdef12"
            state, run_dir = private_run_dir(Path(temp), ROOT, run_id)
            write_private_json(run_dir / "run.json", {
                "schema_version": 1, "run_id": run_id, "repository": str(ROOT.resolve()),
                **binary_run_fields(("cmux",)),
            })
            write_private_json(run_dir / "manifest.json", {"repository": str(ROOT.resolve()), "workers": []})
            write_private_json(run_dir / "task.json", {"task_id": "monitor-loss"})
            write_private_json(run_dir / "topology.json", {
                "control": None, "group": None, "original_anchor": None, "workers": {},
            })
            with mock.patch.dict(os.environ, {"CMUX_AGENT_STATE_HOME": str(state)}, clear=False), \
                mock.patch.object(cmux_team, "find_binary", return_value=TRUE), \
                mock.patch.object(cmux_team.subprocess, "Popen", return_value=FakeProcess()) as popen:
                self.assertEqual(0, cmux_team._monitor_main(run_dir))
            self.assertTrue((run_dir / "listener.ready").exists())
            self.assertTrue((run_dir / "monitor-heartbeat.json").exists())
            self.assertTrue((run_dir / "reconciliation-required.json").exists())
            self.assertNotIn("--no-heartbeat", popen.call_args.args[0])
            errors = (run_dir / "monitor-errors.jsonl").read_text(encoding="utf-8").splitlines()
            self.assertEqual(2, len(errors))


class OwnershipTests(unittest.TestCase):
    def test_checkout_fingerprint_detects_content_change_with_same_status_shape(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            repository = Path(temp)
            subprocess.run(["git", "init", "-q", str(repository)], check=True)
            subprocess.run(["git", "-C", str(repository), "config", "user.name", "Test"], check=True)
            subprocess.run(["git", "-C", str(repository), "config", "user.email", "test@example.invalid"], check=True)
            tracked = repository / "tracked.txt"
            tracked.write_text("base\n", encoding="utf-8")
            subprocess.run(["git", "-C", str(repository), "add", "tracked.txt"], check=True)
            subprocess.run(["git", "-C", str(repository), "commit", "-qm", "base"], check=True)
            tracked.write_text("first modification\n", encoding="utf-8")
            before = cmux_team.git_status_fingerprint(repository)
            tracked.write_text("second modification\n", encoding="utf-8")
            after = cmux_team.git_status_fingerprint(repository)
            self.assertTrue(before["dirty"])
            self.assertTrue(after["dirty"])
            self.assertEqual(before["entry_count"], after["entry_count"])
            self.assertNotEqual(before["sha256"], after["sha256"])

    def test_checkout_fingerprint_never_executes_repository_clean_filter(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            repository = Path(temp) / "repository"
            marker = Path(temp) / "filter-executed"
            subprocess.run([str(cmux_team.GIT_BIN), "init", "-q", str(repository)], check=True)
            subprocess.run([str(cmux_team.GIT_BIN), "-C", str(repository), "config", "user.name", "Test"], check=True)
            subprocess.run([str(cmux_team.GIT_BIN), "-C", str(repository), "config", "user.email", "test@example.invalid"], check=True)
            (repository / ".gitattributes").write_text("victim.txt filter=pwn\n", encoding="utf-8")
            (repository / "victim.txt").write_text("base\n", encoding="utf-8")
            subprocess.run([str(cmux_team.GIT_BIN), "-C", str(repository), "add", ".gitattributes", "victim.txt"], check=True)
            subprocess.run([str(cmux_team.GIT_BIN), "-C", str(repository), "commit", "-qm", "base"], check=True)
            subprocess.run([
                str(cmux_team.GIT_BIN), "-C", str(repository), "config",
                "filter.pwn.clean", f"/usr/bin/tee {marker}",
            ], check=True)
            (repository / "victim.txt").write_text("changed\n", encoding="utf-8")
            fingerprint = cmux_team.git_status_fingerprint(repository)
            self.assertTrue(fingerprint["available"])
            self.assertTrue(fingerprint["dirty"])
            self.assertFalse(marker.exists())

    def test_collection_never_certifies_unavailable_fingerprints(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            run_id = "20260711-120000-collect-test-abcdef12"
            state, run_dir = private_run_dir(Path(temp), ROOT, run_id)
            write_private_json(run_dir / "run.json", {
                "schema_version": 1,
                "run_id": run_id,
                "repository": str(ROOT.resolve()),
                "binaries": {},
                "binary_identities": {},
                "baseline_git": {"available": False},
            })
            write_private_json(run_dir / "manifest.json", {
                "repository": str(ROOT.resolve()), "workers": [],
            })
            write_private_json(run_dir / "task.json", {"task_id": "collect-test"})
            write_private_json(run_dir / "topology.json", {
                "control": None, "group": None, "original_anchor": None, "workers": {},
            })
            with mock.patch.dict(os.environ, {"CMUX_AGENT_STATE_HOME": str(state)}, clear=False), \
                mock.patch.object(cmux_team, "git_status_fingerprint", return_value={"available": False}):
                aggregate = cmux_team.collect_results(run_dir)
            self.assertFalse(aggregate["shared_checkout_unchanged_since_launch"])
            self.assertFalse(aggregate["collection_ready_for_lead_review"])

    def test_collection_reports_schema_valid_failed_agent_as_non_successful(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            run_id = "20260711-120000-agent-failed-abcdef12"
            state, run_dir = private_run_dir(Path(temp), ROOT, run_id)
            worker_dir = run_dir / "workers/reviewer"
            cmux_team.ensure_private_dir(worker_dir)
            baseline = cmux_team.git_status_fingerprint(ROOT)
            self.assertTrue(baseline["available"])
            worker = {"id": "reviewer", "harness": "claude"}
            task = {"task_id": "agent-failed"}
            write_private_json(run_dir / "run.json", {
                "schema_version": 1, "run_id": run_id, "repository": str(ROOT.resolve()),
                "binaries": {}, "binary_identities": {}, "baseline_git": baseline,
            })
            write_private_json(run_dir / "manifest.json", {
                "repository": str(ROOT.resolve()), "workers": [worker],
            })
            write_private_json(run_dir / "task.json", task)
            write_private_json(run_dir / "topology.json", {
                "control": None, "group": None, "original_anchor": None, "workers": {},
            })
            failed_result = dict(ResultTests.RESULT)
            failed_result["status"] = "failed"
            write_private_json(worker_dir / "result.json", {
                "schema_version": 1,
                "run_id": run_id,
                "task_id": task["task_id"],
                "worker_id": worker["id"],
                "provider_exit_code": 0,
                "timed_out": False,
                "output_limited": False,
                "agent_result": failed_result,
                "validation": {
                    "schema": "passed", "errors": [],
                    "read_only_checkout_unchanged": True,
                    "git_before": baseline, "git_after": baseline,
                },
                "disposition": "failed",
                "finished_at": cmux_team.utc_now(),
            })
            write_private_json(worker_dir / "exit.json", {
                "at": cmux_team.utc_now(), "exit_code": 0, "disposition": "failed",
            })
            with mock.patch.dict(os.environ, {"CMUX_AGENT_STATE_HOME": str(state)}, clear=False), \
                mock.patch.object(cmux_team, "git_status_fingerprint", return_value=baseline), \
                mock.patch.object(cmux_team, "monitor_is_alive", return_value=True):
                aggregate = cmux_team.collect_results(run_dir)
            self.assertEqual({}, aggregate["invalid_workers"])
            self.assertEqual(["reviewer"], aggregate["non_successful_workers"])
            self.assertFalse(aggregate["collection_ready_for_lead_review"])

    def test_find_run_rejects_wildcard_selector(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            run_id = "20260711-120000-selector-test-abcdef12"
            state, run_dir = private_run_dir(Path(temp), ROOT, run_id)
            write_private_json(run_dir / "run.json", {
                "schema_version": 1, "run_id": run_id, "repository": str(ROOT.resolve()),
                "binaries": {}, "binary_identities": {},
            })
            write_private_json(run_dir / "manifest.json", {"repository": str(ROOT.resolve()), "workers": []})
            write_private_json(run_dir / "task.json", {"task_id": "selector-test"})
            write_private_json(run_dir / "topology.json", {
                "control": None, "group": None, "original_anchor": None, "workers": {},
            })
            with mock.patch.dict(os.environ, {"CMUX_AGENT_STATE_HOME": str(state)}, clear=False):
                with self.assertRaisesRegex(cmux_team.FleetError, "exact run ID"):
                    cmux_team.find_run("*")

    def test_collection_rejects_semantically_inconsistent_success_wrapper(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            run_id = "20260711-120000-collect-tamper-abcdef12"
            state, run_dir = private_run_dir(Path(temp), ROOT, run_id)
            worker_dir = run_dir / "workers/reviewer"
            cmux_team.ensure_private_dir(worker_dir)
            baseline = cmux_team.git_status_fingerprint(ROOT)
            self.assertTrue(baseline["available"])
            write_private_json(run_dir / "run.json", {
                "schema_version": 1, "run_id": run_id, "repository": str(ROOT.resolve()),
                "binaries": {}, "binary_identities": {}, "baseline_git": baseline,
            })
            write_private_json(run_dir / "manifest.json", {
                "repository": str(ROOT.resolve()),
                "workers": [{"id": "reviewer", "harness": "claude"}],
            })
            write_private_json(run_dir / "task.json", {"task_id": "collect-tamper"})
            write_private_json(run_dir / "topology.json", {
                "control": None, "group": None, "original_anchor": None, "workers": {},
            })
            write_private_json(worker_dir / "result.json", {
                "schema_version": 1,
                "run_id": run_id,
                "task_id": "collect-tamper",
                "worker_id": "reviewer",
                "provider_exit_code": 7,
                "timed_out": True,
                "output_limited": True,
                "agent_result": ResultTests.RESULT,
                "validation": None,
                "disposition": "needs_review",
                "finished_at": cmux_team.utc_now(),
            })
            write_private_json(worker_dir / "exit.json", {
                "at": cmux_team.utc_now(), "exit_code": 7, "disposition": "needs_review",
            })
            with mock.patch.dict(os.environ, {"CMUX_AGENT_STATE_HOME": str(state)}, clear=False), \
                mock.patch.object(cmux_team, "git_status_fingerprint", return_value=baseline), \
                mock.patch.object(cmux_team, "monitor_is_alive", return_value=True):
                aggregate = cmux_team.collect_results(run_dir)
            self.assertIn("reviewer", aggregate["invalid_workers"])
            self.assertFalse(aggregate["collection_ready_for_lead_review"])

    def test_group_identity_parses_live_cmux_created_anchor_shape(self) -> None:
        payload = {
            "group": {
                "id": "00000000-0000-4000-8000-000000000090",
                "ref": "workspace_group:2",
                "name": "test",
                "anchor_workspace_id": "00000000-0000-4000-8000-000000000091",
                "anchor_workspace_ref": "workspace:14",
                "member_workspace_ids": [
                    "00000000-0000-4000-8000-000000000091",
                    "00000000-0000-4000-8000-000000000089",
                ],
            }
        }
        identity = cmux_team.resolve_group_identity(Path("/bin/cmux"), payload, "test")
        self.assertEqual("00000000-0000-4000-8000-000000000090", identity["uuid"])
        self.assertEqual("00000000-0000-4000-8000-000000000091", identity["anchor_uuid"])
        self.assertEqual("workspace:14", identity["anchor_ref"])
        self.assertEqual(2, len(identity["member_uuids"]))

    def test_group_identity_accepts_root_id_payload(self) -> None:
        payload = {
            "id": "00000000-0000-4000-8000-000000000092",
            "anchorWorkspaceId": "00000000-0000-4000-8000-000000000093",
        }
        identity = cmux_team.resolve_group_identity(Path("/bin/cmux"), payload, "test")
        self.assertEqual("00000000-0000-4000-8000-000000000092", identity["uuid"])
        self.assertEqual("00000000-0000-4000-8000-000000000093", identity["anchor_uuid"])

    def test_resolvers_accept_real_cmux_06417_shapes(self) -> None:
        workspace = cmux_team.resolve_workspace_identity(Path("/bin/cmux"), {
            "created_workspace_id": "00000000-0000-4000-8000-000000000096",
            "created_workspace_ref": "workspace:7",
        })
        self.assertEqual("00000000-0000-4000-8000-000000000096", workspace["uuid"])
        group = cmux_team.resolve_group_identity(Path("/bin/cmux"), {"group": {
            "id": "00000000-0000-4000-8000-000000000097",
            "ref": "workspace_group:3",
            "name": "real-shape",
            "anchor_workspace_id": "00000000-0000-4000-8000-000000000098",
            "member_workspace_ids": ["00000000-0000-4000-8000-000000000098"],
        }}, "real-shape")
        self.assertEqual("00000000-0000-4000-8000-000000000097", group["uuid"])

    def test_group_identity_prefers_exact_anchor_field(self) -> None:
        payload = {"group": {
            "id": "00000000-0000-4000-8000-000000000080",
            "name": "exact-anchor",
            "anchor_workspace_id": "00000000-0000-4000-8000-000000000081",
            "previous_anchor_workspace_id": "ffffffff-ffff-4fff-8fff-ffffffffffff",
            "member_workspace_ids": ["00000000-0000-4000-8000-000000000081"],
        }}
        identity = cmux_team.resolve_group_identity(Path("/bin/cmux"), payload, "exact-anchor")
        self.assertEqual("00000000-0000-4000-8000-000000000081", identity["anchor_uuid"])

    def test_group_identity_rejects_duplicate_members(self) -> None:
        payload = {"group": {
            "id": "00000000-0000-4000-8000-000000000082",
            "name": "duplicates",
            "anchor_workspace_id": "00000000-0000-4000-8000-000000000083",
            "member_workspace_ids": [
                "00000000-0000-4000-8000-000000000083",
                "00000000-0000-4000-8000-000000000083",
            ],
        }}
        with self.assertRaisesRegex(cmux_team.FleetError, "duplicate UUIDs"):
            cmux_team.resolve_group_identity(Path("/bin/cmux"), payload, "duplicates")

    def test_group_identity_rejects_contradictory_member_count(self) -> None:
        payload = {"group": {
            "id": "00000000-0000-4000-8000-000000000074",
            "name": "bad-count",
            "anchor_workspace_id": "00000000-0000-4000-8000-000000000075",
            "member_count": 2,
            "member_workspace_ids": ["00000000-0000-4000-8000-000000000075"],
        }}
        with self.assertRaisesRegex(cmux_team.FleetError, "member_count contradicts"):
            cmux_team.resolve_group_identity(Path("/bin/cmux"), payload, "bad-count")

    def test_group_identity_requires_wrapper_name_to_agree(self) -> None:
        payload = {"group": {
            "id": "00000000-0000-4000-8000-000000000076",
            "name": "wrong-name",
            "anchor_workspace_id": "00000000-0000-4000-8000-000000000077",
            "member_workspace_ids": ["00000000-0000-4000-8000-000000000077"],
        }}
        listing = {"groups": []}
        with mock.patch.object(cmux_team, "run_cmux_json", return_value=listing):
            with self.assertRaises(cmux_team.FleetError):
                cmux_team.resolve_group_identity(Path("/bin/cmux"), payload, "expected-name")

    def test_group_created_anchor_requires_new_exact_two_member_snapshot(self) -> None:
        anchor = "00000000-0000-4000-8000-000000000084"
        control = "00000000-0000-4000-8000-000000000085"
        self.assertTrue(cmux_team.validate_group_created_anchor(
            anchor_uuid=anchor,
            control_uuid=control,
            member_uuids={anchor, control},
            workspaces_before={control},
        ))
        self.assertFalse(cmux_team.validate_group_created_anchor(
            anchor_uuid=control,
            control_uuid=control,
            member_uuids={control},
            workspaces_before={control},
        ))
        with self.assertRaisesRegex(cmux_team.FleetError, "pre-existing anchor"):
            cmux_team.validate_group_created_anchor(
                anchor_uuid=anchor,
                control_uuid=control,
                member_uuids={anchor, control},
                workspaces_before={anchor, control},
            )
        with self.assertRaisesRegex(cmux_team.FleetError, "does not prove ownership"):
            cmux_team.validate_group_created_anchor(
                anchor_uuid=anchor,
                control_uuid=control,
                member_uuids={anchor, control, "00000000-0000-4000-8000-000000000086"},
                workspaces_before={control},
            )

    def test_control_must_exist_in_pre_group_inventory(self) -> None:
        control = "00000000-0000-4000-8000-000000000073"
        cmux_team.require_control_in_inventory(control, {control})
        with self.assertRaisesRegex(cmux_team.FleetError, "recorded control"):
            cmux_team.require_control_in_inventory(control, set())

    def test_cmux_plain_ok_ref_is_typed_and_requests_uuid_output(self) -> None:
        completed = subprocess.CompletedProcess(
            ["cmux"], 0, "OK workspace:10\n", "",
        )
        with mock.patch.object(cmux_team, "run_process", return_value=completed) as run:
            payload = cmux_team.run_cmux_json(Path("/bin/cmux"), ["new-workspace"])
        self.assertEqual({"ok": True, "ref": "workspace:10"}, payload)
        self.assertEqual(
            ["/bin/cmux", "--json", "--id-format", "both", "new-workspace"],
            run.call_args.args[0],
        )

    def test_workspace_ref_resolves_only_against_unique_create_metadata(self) -> None:
        listing = {"workspaces": [{
            "id": "00000000-0000-4000-8000-000000000087",
            "ref": "workspace:10",
            "custom_title": "owned-control",
            "title": "owned-control",
            "description": "Cmux fleet control unique-run-id",
            "current_directory": "/private/run/unique-run-id",
        }]}
        with mock.patch.object(cmux_team, "run_cmux_json", return_value=listing):
            identity = cmux_team.resolve_workspace_identity(
                Path("/bin/cmux"), {"ok": True, "ref": "workspace:10"},
                "owned-control", "Cmux fleet control unique-run-id",
                "/private/run/unique-run-id",
            )
        self.assertEqual("00000000-0000-4000-8000-000000000087", identity["uuid"])
        self.assertEqual("workspace:10", identity["ref"])

    def test_group_fallback_does_not_match_ref_less_unrelated_objects(self) -> None:
        listing = {"groups": [{"id": "00000000-0000-4000-8000-000000000088"}]}
        with mock.patch.object(cmux_team, "run_cmux_json", return_value=listing):
            with self.assertRaises(cmux_team.FleetError):
                cmux_team.resolve_group_identity(Path("/bin/cmux"), {}, "target-group")

    def test_group_ref_fallback_ignores_unrelated_nested_group_uuid(self) -> None:
        listing = {"groups": [{
            "id": "00000000-0000-4000-8000-000000000078",
            "ref": "workspace_group:7",
            "name": "target-group",
            "anchor_workspace_id": "00000000-0000-4000-8000-000000000079",
            "member_workspace_ids": ["00000000-0000-4000-8000-000000000079"],
        }]}
        payload = {
            "ref": "workspace_group:7",
            "metadata": {"unrelated_group_id": "ffffffff-ffff-4fff-8fff-ffffffffffff"},
        }
        with mock.patch.object(cmux_team, "run_cmux_json", return_value=listing):
            identity = cmux_team.resolve_group_identity(
                Path("/bin/cmux"), payload, "target-group",
            )
        self.assertEqual("00000000-0000-4000-8000-000000000078", identity["uuid"])

    def test_workspace_identity_prefers_root_workspace_id_over_surface(self) -> None:
        payload = {
            "id": "00000000-0000-4000-8000-000000000094",
            "surface_id": "00000000-0000-4000-8000-000000000095",
        }
        identity = cmux_team.resolve_workspace_identity(Path("/bin/cmux"), payload)
        self.assertEqual("00000000-0000-4000-8000-000000000094", identity["uuid"])

    def test_cleanup_never_deletes_group_or_unowned_workspace(self) -> None:
        topology = {
            "control": {"uuid": "00000000-0000-4000-8000-000000000001"},
            "group": {"uuid": "00000000-0000-4000-8000-000000000002"},
            "original_anchor": {"uuid": "00000000-0000-4000-8000-000000000003"},
            "created_anchor": {"uuid": "00000000-0000-4000-8000-000000000006"},
            "workers": {
                "a": {"uuid": "00000000-0000-4000-8000-000000000004"},
                "b": {"uuid": "00000000-0000-4000-8000-000000000005"},
            },
        }
        calls = []

        def record(_cmux, args, timeout=30, **_kwargs):
            calls.append(args)
            return {"ok": True}

        with tempfile.TemporaryDirectory() as temp, mock.patch.object(
            cmux_team, "run_cmux_best_effort", side_effect=record
        ):
            cmux_team.cleanup_recorded(Path("/bin/cmux"), Path(temp), topology)
        flattened = [item for call in calls for item in call]
        self.assertNotIn("delete", flattened)
        self.assertIn("ungroup", flattened)
        self.assertEqual(4, sum(call[0] == "close-workspace" for call in calls))
        self.assertFalse(any(topology["original_anchor"]["uuid"] in call for call in calls))
        self.assertTrue(any(topology["created_anchor"]["uuid"] in call for call in calls))
        close_targets = [call[-1] for call in calls if call[0] == "close-workspace"]
        self.assertEqual([
            topology["workers"]["b"]["uuid"],
            topology["workers"]["a"]["uuid"],
            topology["created_anchor"]["uuid"],
            topology["control"]["uuid"],
        ], close_targets)
        self.assertEqual("workspace-group", calls[2][0])
        self.assertEqual("ungroup", calls[2][1])

    def test_launch_outside_cmux_refuses_before_cmux_mutation(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            temp_path = Path(temp)
            manifest = {
                "schema_version": 1,
                "name": "outside-test",
                "mode": "heterogeneous",
                "topology": "workspace-group",
                "repository": str(ROOT.resolve()),
                "git_strategy": "shared-read-only",
                "workers": [
                    {"id": "a", "harness": "codex", "role": "independent-researcher", "assignment": "Inspect.", "permission_profile": "read-only"},
                    {"id": "b", "harness": "pi", "role": "independent-researcher", "assignment": "Inspect.", "permission_profile": "read-only"},
                ],
                "timeouts": {"ready_seconds": 5, "task_seconds": 30, "stop_seconds": 1},
            }
            task = {
                "schema_version": 1,
                "task_id": "outside-test",
                "instructions": "Inspect without changes.",
                "acceptance_criteria": ["Cite evidence."],
            }
            manifest_path = temp_path / "manifest.json"
            task_path = temp_path / "task.json"
            manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
            task_path.write_text(json.dumps(task), encoding="utf-8")
            with mock.patch.dict(os.environ, {"CMUX_WORKSPACE_ID": "", "CMUX_SURFACE_ID": ""}), mock.patch.object(
                cmux_team, "run_cmux_json"
            ) as cmux_call:
                with self.assertRaises(cmux_team.FleetError):
                    cmux_team.launch(
                        manifest_path, task_path, True, None,
                        contract_digest(manifest_path, task_path),
                    )
                cmux_call.assert_not_called()

    def test_stop_refuses_to_close_its_own_workspace(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            run_id = "20260711-120000-self-stop-abcdef12"
            state, run_dir = private_run_dir(Path(temp), ROOT, run_id)
            owned = "00000000-0000-4000-8000-000000000077"
            write_private_json(run_dir / "run.json", {
                "schema_version": 1,
                "run_id": run_id,
                "repository": str(ROOT.resolve()),
                **binary_run_fields(("cmux",)),
            })
            write_private_json(run_dir / "manifest.json", {
                "workers": [], "timeouts": {"stop_seconds": 1},
            })
            write_private_json(run_dir / "task.json", {"task_id": "self-stop"})
            write_private_json(run_dir / "topology.json", {
                "control": {"uuid": owned}, "group": None,
                "original_anchor": None, "workers": {},
            })
            with mock.patch.dict(
                os.environ,
                {
                    "CMUX_WORKSPACE_ID": owned,
                    "CMUX_SURFACE_ID": "surface",
                    "CMUX_AGENT_STATE_HOME": str(state),
                },
                clear=False,
            ), mock.patch.object(cmux_team, "find_binary", return_value=TRUE), \
                mock.patch.object(cmux_team, "cleanup_recorded") as cleanup:
                with self.assertRaisesRegex(cmux_team.FleetError, "outside the fleet"):
                    cmux_team.stop_run(run_dir, True, False)
                cleanup.assert_not_called()


class LaunchTransactionTests(unittest.TestCase):
    def write_contracts(self, root: Path) -> tuple[Path, Path]:
        manifest = {
            "schema_version": 1,
            "name": "mock-fleet",
            "mode": "heterogeneous",
            "topology": "workspace-group",
            "repository": str(ROOT.resolve()),
            "git_strategy": "shared-read-only",
            "workers": [
                {"id": "codex-worker", "harness": "codex", "role": "independent-researcher", "assignment": "Inspect.", "permission_profile": "read-only"},
                {"id": "pi-worker", "harness": "pi", "role": "independent-researcher", "assignment": "Challenge.", "permission_profile": "read-only"},
            ],
            "timeouts": {"ready_seconds": 5, "task_seconds": 30, "stop_seconds": 1},
        }
        task = {
            "schema_version": 1,
            "task_id": "mock-task",
            "instructions": "Inspect without changes.",
            "acceptance_criteria": ["Cite evidence."],
        }
        manifest_path = root / "manifest.json"
        task_path = root / "task.json"
        manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
        task_path.write_text(json.dumps(task), encoding="utf-8")
        return manifest_path, task_path

    @staticmethod
    def run_dir_from_command(args: list[str]) -> Path:
        command = args[args.index("--command") + 1]
        tokens = shlex.split(command)
        return Path(tokens[tokens.index("--run-dir") + 1])

    def test_launch_rejects_contract_not_bound_to_approved_digest(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            manifest_path, task_path = self.write_contracts(Path(temp))
            with mock.patch.object(cmux_team, "run_cmux_json") as cmux_call:
                with self.assertRaisesRegex(cmux_team.FleetError, "approved digest"):
                    cmux_team.launch(
                        manifest_path, task_path, True, None, "sha256:" + "0" * 64,
                    )
                cmux_call.assert_not_called()

    def test_listener_ack_precedes_worker_dispatch(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            manifest_path, task_path = self.write_contracts(root)
            order = []
            worker_number = 0
            created_anchor_closed = False
            group_name = ""

            def fake_cmux(_cmux, args, timeout=30):
                nonlocal worker_number, created_anchor_closed, group_name
                if args == ["capabilities"]:
                    return {"version": 1}
                if args == ["list-workspaces"]:
                    return {"workspaces": [
                        {"id": "00000000-0000-4000-8000-000000000001"},
                        {"id": "00000000-0000-4000-8000-000000000011"},
                    ]}
                if args[:1] == ["new-workspace"]:
                    run_dir = self.run_dir_from_command(args)
                    name = args[args.index("--name") + 1]
                    if name.endswith("-control"):
                        order.append("control")
                        cmux_team.atomic_write_json(run_dir / "listener.ready", {"ready": True})
                        order.append("listener-ready")
                        return {"workspace_id": "00000000-0000-4000-8000-000000000011"}
                    worker_number += 1
                    order.append(f"worker-{worker_number}")
                    worker_id = "codex-worker" if worker_number == 1 else "pi-worker"
                    cmux_team.atomic_write_json(run_dir / "workers" / worker_id / "ready.json", {"ready": True})
                    return {"workspace_id": f"00000000-0000-4000-8000-00000000001{worker_number + 1}"}
                if args[:2] == ["workspace-group", "create"]:
                    order.append("group-create")
                    group_name = args[args.index("--name") + 1]
                    return {"group": {
                        "id": "00000000-0000-4000-8000-000000000020",
                        "name": group_name,
                        "anchor_workspace_id": "00000000-0000-4000-8000-000000000021",
                        "member_workspace_ids": [
                            "00000000-0000-4000-8000-000000000021",
                            "00000000-0000-4000-8000-000000000011",
                        ],
                    }}
                if args[:2] == ["workspace-group", "list"]:
                    members = ["00000000-0000-4000-8000-000000000011"]
                    if not created_anchor_closed:
                        members.append("00000000-0000-4000-8000-000000000021")
                    return {"groups": [{
                        "id": "00000000-0000-4000-8000-000000000020",
                        "name": group_name,
                        "anchor_workspace_id": "00000000-0000-4000-8000-000000000011",
                        "member_workspace_ids": members,
                    }]}
                if args[:1] == ["close-workspace"] and "00000000-0000-4000-8000-000000000021" in args:
                    created_anchor_closed = True
                    return {"workspace_id": "00000000-0000-4000-8000-000000000021"}
                return {}

            environment = {
                "CMUX_WORKSPACE_ID": "00000000-0000-4000-8000-000000000001",
                "CMUX_SURFACE_ID": "00000000-0000-4000-8000-000000000002",
                "CMUX_AGENT_STATE_HOME": str(root / "state"),
            }
            with mock.patch.dict(os.environ, environment, clear=False), \
                mock.patch.object(cmux_team, "doctor_data", return_value={"ready_for_plan": True, "authentication_signal": {"codex": True, "pi": True}}), \
                mock.patch.object(cmux_team, "cmux_config", return_value=(Path("/config"), {"automation": {"socketControlMode": "cmuxOnly"}, "terminal": {"autoResumeAgentSessions": False}}, None)), \
                mock.patch.object(cmux_team, "find_binary", return_value=TRUE), \
                mock.patch.object(cmux_team, "find_pi_node", return_value=TRUE), \
                mock.patch.object(cmux_team, "load_role", return_value={"id": "independent-researcher", "instructions": []}), \
                mock.patch.object(cmux_team, "run_cmux_json", side_effect=fake_cmux), \
                mock.patch.object(cmux_team, "capture_tree", return_value={}), \
                mock.patch.object(cmux_team, "monitor_is_alive", return_value=True), \
                mock.patch.object(cmux_team, "set_workspace_status"):
                run_dir = cmux_team.launch(
                    manifest_path, task_path, True, None,
                    contract_digest(manifest_path, task_path),
                )
            self.assertLess(order.index("listener-ready"), order.index("group-create"))
            self.assertLess(order.index("group-create"), order.index("worker-1"))
            self.assertEqual("running", cmux_team.read_json(run_dir / "run.json")["status"])
            self.assertEqual(2, len(cmux_team.read_json(run_dir / "topology.json")["workers"]))

    def test_failure_before_first_workspace_preserves_original_error_and_state(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            manifest_path, task_path = self.write_contracts(root)
            environment = {
                "CMUX_WORKSPACE_ID": "00000000-0000-4000-8000-000000000001",
                "CMUX_SURFACE_ID": "00000000-0000-4000-8000-000000000002",
                "CMUX_AGENT_STATE_HOME": str(root / "state"),
            }
            with mock.patch.dict(os.environ, environment, clear=False), \
                mock.patch.object(cmux_team, "doctor_data", return_value={"ready_for_plan": True, "authentication_signal": {"codex": True, "pi": True}}), \
                mock.patch.object(cmux_team, "cmux_config", return_value=(Path("/config"), {"automation": {"socketControlMode": "cmuxOnly"}, "terminal": {"autoResumeAgentSessions": False}}, None)), \
                mock.patch.object(cmux_team, "find_binary", return_value=TRUE), \
                mock.patch.object(cmux_team, "find_pi_node", return_value=TRUE), \
                mock.patch.object(cmux_team, "load_role", return_value={"id": "independent-researcher", "instructions": []}), \
                mock.patch.object(cmux_team, "run_cmux_json", return_value={}), \
                mock.patch.object(cmux_team, "capture_tree", side_effect=cmux_team.FleetError("baseline tree failed")), \
                mock.patch.object(cmux_team, "set_workspace_status"):
                with self.assertRaisesRegex(cmux_team.FleetError, "baseline tree failed"):
                    cmux_team.launch(
                        manifest_path, task_path, True, None,
                        contract_digest(manifest_path, task_path),
                    )
            runs = list((root / "state").glob("*/*"))
            self.assertEqual(1, len(runs))
            self.assertEqual("launch_failed", cmux_team.read_json(runs[0] / "run.json")["status"])
            self.assertEqual({"workers": {}}, cmux_team.read_json(runs[0] / "cleanup.json"))

    def test_unproven_group_anchor_requires_reconciliation_and_is_not_closed(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            manifest_path, task_path = self.write_contracts(root)
            calls = []
            control = "00000000-0000-4000-8000-000000000041"
            anchor = "00000000-0000-4000-8000-000000000044"
            unrelated = "00000000-0000-4000-8000-000000000045"

            def fake_cmux(_cmux, args, timeout=30):
                calls.append(args)
                if args == ["capabilities"]:
                    return {}
                if args[:1] == ["new-workspace"]:
                    run_dir = self.run_dir_from_command(args)
                    cmux_team.atomic_write_json(run_dir / "listener.ready", {"ready": True})
                    return {"workspace_id": control}
                if args == ["list-workspaces"]:
                    return {"workspaces": [
                        {"id": "00000000-0000-4000-8000-000000000001"},
                        {"id": control},
                    ]}
                if args[:2] == ["workspace-group", "create"]:
                    group_name = args[args.index("--name") + 1]
                    return {"group": {
                        "id": "00000000-0000-4000-8000-000000000043",
                        "name": group_name,
                        "anchor_workspace_id": anchor,
                        "member_workspace_ids": [anchor, control, unrelated],
                    }}
                return {}

            environment = {
                "CMUX_WORKSPACE_ID": "00000000-0000-4000-8000-000000000001",
                "CMUX_SURFACE_ID": "00000000-0000-4000-8000-000000000002",
                "CMUX_AGENT_STATE_HOME": str(root / "state"),
            }
            with mock.patch.dict(os.environ, environment, clear=False), \
                mock.patch.object(cmux_team, "doctor_data", return_value={"ready_for_plan": True, "authentication_signal": {"codex": True, "pi": True}}), \
                mock.patch.object(cmux_team, "cmux_config", return_value=(Path("/config"), {"automation": {"socketControlMode": "cmuxOnly"}, "terminal": {"autoResumeAgentSessions": False}}, None)), \
                mock.patch.object(cmux_team, "find_binary", return_value=TRUE), \
                mock.patch.object(cmux_team, "find_pi_node", return_value=TRUE), \
                mock.patch.object(cmux_team, "load_role", return_value={"id": "independent-researcher", "instructions": []}), \
                mock.patch.object(cmux_team, "run_cmux_json", side_effect=fake_cmux), \
                mock.patch.object(cmux_team, "capture_tree", return_value={}), \
                mock.patch.object(cmux_team, "monitor_is_alive", return_value=True), \
                mock.patch.object(cmux_team, "set_workspace_status"):
                with self.assertRaisesRegex(cmux_team.FleetError, "does not prove ownership"):
                    cmux_team.launch(
                        manifest_path, task_path, True, None,
                        contract_digest(manifest_path, task_path),
                    )
            run_dir = next((root / "state").glob("*/*"))
            marker = cmux_team.read_json(run_dir / "reconciliation-required.json")
            self.assertEqual("workspace-group-create", marker["operation"])
            self.assertEqual(
                "launch_failed_cleanup_incomplete",
                cmux_team.read_json(run_dir / "run.json")["status"],
            )
            topology = cmux_team.read_json(run_dir / "topology.json")
            self.assertIsNone(topology["created_anchor"])
            self.assertTrue(any(call[:2] == ["workspace-group", "ungroup"] for call in calls))
            closed = [call[-1] for call in calls if call[:1] == ["close-workspace"]]
            self.assertIn(control, closed)
            self.assertNotIn(anchor, closed)
            self.assertNotIn(unrelated, closed)

    def test_partial_launch_rolls_back_only_recorded_resources(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            manifest_path, task_path = self.write_contracts(root)
            calls = []
            worker_number = 0
            created_anchor_closed = False
            group_name = ""

            def fake_cmux(_cmux, args, timeout=30):
                nonlocal worker_number, created_anchor_closed, group_name
                calls.append(args)
                if args == ["capabilities"]:
                    return {}
                if args == ["list-workspaces"]:
                    return {"workspaces": [
                        {"id": "00000000-0000-4000-8000-000000000001"},
                        {"id": "00000000-0000-4000-8000-000000000031"},
                    ]}
                if args[:1] == ["new-workspace"]:
                    run_dir = self.run_dir_from_command(args)
                    name = args[args.index("--name") + 1]
                    if name.endswith("-control"):
                        cmux_team.atomic_write_json(run_dir / "listener.ready", {"ready": True})
                        return {"workspace_id": "00000000-0000-4000-8000-000000000031"}
                    worker_number += 1
                    if worker_number == 2:
                        raise cmux_team.FleetError("injected worker failure")
                    cmux_team.atomic_write_json(run_dir / "workers" / "codex-worker" / "ready.json", {"ready": True})
                    return {"workspace_id": "00000000-0000-4000-8000-000000000032"}
                if args[:2] == ["workspace-group", "create"]:
                    group_name = args[args.index("--name") + 1]
                    return {"group": {
                        "id": "00000000-0000-4000-8000-000000000033",
                        "name": group_name,
                        "anchor_workspace_id": "00000000-0000-4000-8000-000000000034",
                        "member_workspace_ids": [
                            "00000000-0000-4000-8000-000000000034",
                            "00000000-0000-4000-8000-000000000031",
                        ],
                    }}
                if args[:2] == ["workspace-group", "list"]:
                    members = ["00000000-0000-4000-8000-000000000031"]
                    if not created_anchor_closed:
                        members.append("00000000-0000-4000-8000-000000000034")
                    return {"groups": [{
                        "id": "00000000-0000-4000-8000-000000000033",
                        "name": group_name,
                        "anchor_workspace_id": "00000000-0000-4000-8000-000000000031",
                        "member_workspace_ids": members,
                    }]}
                if args[:1] == ["close-workspace"] and "00000000-0000-4000-8000-000000000034" in args:
                    created_anchor_closed = True
                    return {"workspace_id": "00000000-0000-4000-8000-000000000034"}
                return {}

            environment = {
                "CMUX_WORKSPACE_ID": "00000000-0000-4000-8000-000000000001",
                "CMUX_SURFACE_ID": "00000000-0000-4000-8000-000000000002",
                "CMUX_AGENT_STATE_HOME": str(root / "state"),
            }
            with mock.patch.dict(os.environ, environment, clear=False), \
                mock.patch.object(cmux_team, "doctor_data", return_value={"ready_for_plan": True, "authentication_signal": {"codex": True, "pi": True}}), \
                mock.patch.object(cmux_team, "cmux_config", return_value=(Path("/config"), {"automation": {"socketControlMode": "cmuxOnly"}, "terminal": {"autoResumeAgentSessions": False}}, None)), \
                mock.patch.object(cmux_team, "find_binary", return_value=TRUE), \
                mock.patch.object(cmux_team, "find_pi_node", return_value=TRUE), \
                mock.patch.object(cmux_team, "load_role", return_value={"id": "independent-researcher", "instructions": []}), \
                mock.patch.object(cmux_team, "run_cmux_json", side_effect=fake_cmux), \
                mock.patch.object(cmux_team, "capture_tree", return_value={}), \
                mock.patch.object(cmux_team, "monitor_is_alive", return_value=True), \
                mock.patch.object(cmux_team, "set_workspace_status"):
                with self.assertRaises(cmux_team.FleetError):
                    cmux_team.launch(
                        manifest_path, task_path, True, None,
                        contract_digest(manifest_path, task_path),
                    )
            flattened = [item for call in calls for item in call]
            self.assertNotIn("delete", flattened)
            self.assertIn("ungroup", flattened)
            self.assertTrue(any(call[:1] == ["close-workspace"] for call in calls))


if __name__ == "__main__":
    unittest.main()
