#!/usr/bin/env python3
"""Validate the Cmux agent-orchestration eval corpus without dependencies."""

from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
SOURCE_PATH = ROOT / "source-prompts.json"
SCHEMA_PATH = ROOT / "eval.schema.json"
TRIGGER_SCHEMA_PATH = ROOT / "trigger-case.schema.json"
TRIGGER_CASES_PATH = ROOT / "trigger-cases.json"
CASES_DIR = ROOT / "cases"

EXPECTED_COMMIT = "6eaacabbee4c71120f7cd161c9539530f84068a8"
EXPECTED_PROMPT_IDS = {f"{number:02d}" for number in range(1, 32)}
EXPECTED_SOURCE_PROMPTS = {
    "01": ("prompts/01-hello-workspace.md", "Hello, Workspace"),
    "02": ("prompts/02-read-it-back.md", "Read It Back"),
    "03": ("prompts/03-split-into-a-grid.md", "Split Into a Grid"),
    "04": ("prompts/04-map-the-world.md", "Map the World"),
    "05": ("prompts/05-tidy-up.md", "Tidy Up"),
    "06": ("prompts/06-launch-one-agent.md", "Launch One Agent"),
    "07": ("prompts/07-keys-and-credentials.md", "Keys & Credentials"),
    "08": ("prompts/08-two-agents-one-question.md", "Two Agents, One Question"),
    "09": ("prompts/09-declarative-boot.md", "Declarative Boot"),
    "10": (
        "prompts/10-native-sessions-and-resume.md",
        "Native Sessions & Resume",
    ),
    "11": ("prompts/11-the-2x2-fleet.md", "The 2×2 Fleet"),
    "12": ("prompts/12-fan-out-fan-in.md", "Fan-Out / Fan-In"),
    "13": ("prompts/13-live-status-board.md", "Live Status Board"),
    "14": ("prompts/14-reactive-loop.md", "Reactive Loop (Don't Poll)"),
    "15": ("prompts/15-race-and-notify.md", "Race & Notify"),
    "16": ("prompts/16-scale-and-teardown.md", "Scale & Teardown"),
    "17": ("prompts/17-agent-and-live-preview.md", "Agent + Live Preview"),
    "18": (
        "prompts/18-agent-drives-the-browser.md",
        "Agent Drives the Browser",
    ),
    "19": ("prompts/19-self-verifying-agent.md", "Self-Verifying Agent"),
    "20": ("prompts/20-capture-and-replay-auth.md", "Capture & Replay Auth"),
    "21": (
        "prompts/21-multi-window-command-center.md",
        "Multi-Window Command Center",
    ),
    "22": (
        "prompts/22-organized-sidebar-at-scale.md",
        "Organized Sidebar at Scale",
    ),
    "23": (
        "prompts/23-remote-and-cloud-fleets.md",
        "Remote & Cloud Fleets",
    ),
    "24": (
        "prompts/24-crash-proof-resume-the-fleet.md",
        "Crash-Proof: Resume the Fleet",
    ),
    "25": ("prompts/25-the-software-factory.md", "The Software Factory (Capstone)"),
    "26": ("prompts/26-color-code-and-label.md", "Color-Code & Label the Fleet"),
    "27": ("prompts/27-theme-and-feel.md", "Theme & Feel"),
    "28": (
        "prompts/28-custom-actions-and-buttons.md",
        "Custom Actions & Buttons",
    ),
    "29": (
        "prompts/29-layouts-and-dock-controls.md",
        "Reusable Layouts & Dock Controls",
    ),
    "30": (
        "prompts/30-project-config-and-custom-sidebar.md",
        "Make It Yours: Project Config + Custom Sidebar",
    ),
    "31": (
        "prompts/31-identify-individual-panes.md",
        "Identify Individual Panes",
    ),
}
EXPECTED_FAMILY_PREFIXES = {f"E{number:02d}" for number in range(1, 17)}
CASE_ID_RE = re.compile(r"^E(0[1-9]|1[0-6])-[a-z0-9-]+$")
VARIANT_ID_RE = re.compile(r"^E(0[1-9]|1[0-6])-T[0-4]-[a-z0-9-]+$")
ASSERTION_ID_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")

VALID_RISK_LEVELS = {"low", "medium", "high", "critical"}
VALID_SUITABILITY_LEVELS = {"A", "B", "C", "D"}
VALID_GATES = {
    "allow_live_agents",
    "allow_cost",
    "allow_visual",
    "allow_notifications",
    "allow_agent_cancellation",
    "allow_writes",
    "allow_restart",
    "allow_real_auth",
    "allow_remote",
    "allow_external_network",
    "allow_cloud_cost",
    "allow_global_config",
    "dedicated_cmux_profile",
    "dedicated_macos_environment",
}
VALID_EFFECTS = {
    "none",
    "fixture-filesystem",
    "cmux-ephemeral",
    "process-launch",
    "model-api",
    "local-browser",
    "ui-focus",
    "notification",
    "repo-write",
    "global-config",
    "app-restart",
    "real-auth",
    "external-network",
    "remote-host",
    "cloud-resource",
}
VALID_ASSERTION_KINDS = {
    "configuration",
    "topology",
    "text",
    "security",
    "process",
    "event",
    "cleanup",
    "visual",
    "filesystem",
    "browser",
    "manual",
    "synthesis",
}
EXPECTED_MODE_BY_TIER = {
    0: "static",
    1: "deterministic",
    2: "live-agent",
    3: "integrated",
    4: "destructive",
}
DESTRUCTIVE_GATES = {
    "allow_agent_cancellation",
    "allow_writes",
    "allow_restart",
    "allow_real_auth",
    "allow_remote",
    "allow_cloud_cost",
    "allow_global_config",
    "dedicated_cmux_profile",
    "dedicated_macos_environment",
}
REQUIRED_GATES_BY_EFFECT = {
    "model-api": {"allow_live_agents", "allow_cost"},
    "ui-focus": {"allow_visual"},
    "notification": {"allow_notifications"},
    "repo-write": {"allow_writes"},
    "global-config": {"allow_global_config", "dedicated_cmux_profile"},
    "app-restart": {
        "allow_restart",
        "dedicated_cmux_profile",
        "dedicated_macos_environment",
    },
    "real-auth": {"allow_real_auth", "dedicated_cmux_profile"},
    "external-network": {"allow_external_network"},
    "remote-host": {"allow_remote", "allow_external_network"},
    "cloud-resource": {
        "allow_remote",
        "allow_external_network",
        "allow_cloud_cost",
    },
}
VALID_TRIGGER_EXPECTATIONS = {"should_trigger", "should_not_trigger"}
VALID_TRIGGER_ROUTES = {
    "custom-mixed-fleet",
    "custom-mixed-fleet-refusal",
    "native-codex-teams",
    "native-claude-teams",
    "direct-cmux",
    "direct-provider",
}


def load_json(path: Path, errors: list[str]) -> Any:
    try:
        with path.open(encoding="utf-8") as handle:
            return json.load(handle)
    except FileNotFoundError:
        errors.append(f"missing required file: {path.relative_to(ROOT)}")
    except json.JSONDecodeError as exc:
        errors.append(
            f"invalid JSON in {path.relative_to(ROOT)}: line {exc.lineno}, "
            f"column {exc.colno}: {exc.msg}"
        )
    return None


def is_nonempty_string(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def validate_string_list(
    value: Any, label: str, errors: list[str], *, allow_empty: bool = False
) -> bool:
    if not isinstance(value, list):
        errors.append(f"{label} must be an array")
        return False
    if not value and not allow_empty:
        errors.append(f"{label} must not be empty")
        return False
    if any(not is_nonempty_string(item) for item in value):
        errors.append(f"{label} must contain only non-empty strings")
        return False
    return True


def validate_sources(data: Any, errors: list[str]) -> set[str]:
    if not isinstance(data, dict):
        errors.append("source-prompts.json must contain an object")
        return set()

    source = data.get("source")
    if not isinstance(source, dict):
        errors.append("source-prompts.json: source must be an object")
    elif source.get("commit") != EXPECTED_COMMIT:
        errors.append(
            "source-prompts.json: source.commit must remain pinned to "
            f"{EXPECTED_COMMIT}"
        )

    prompts = data.get("prompts")
    if not isinstance(prompts, list):
        errors.append("source-prompts.json: prompts must be an array")
        return set()
    if len(prompts) != 31:
        errors.append(f"source-prompts.json: expected 31 prompts, found {len(prompts)}")

    ids: list[str] = []
    paths: list[str] = []
    titles: list[str] = []
    required = {"id", "path", "title", "purpose", "risk", "suitability"}

    for index, prompt in enumerate(prompts):
        label = f"source-prompts.json: prompts[{index}]"
        if not isinstance(prompt, dict):
            errors.append(f"{label} must be an object")
            continue
        missing = required - prompt.keys()
        if missing:
            errors.append(f"{label} missing fields: {', '.join(sorted(missing))}")
            continue
        prompt_id = prompt["id"]
        if not isinstance(prompt_id, str):
            errors.append(f"{label}.id must be a string")
            continue
        ids.append(prompt_id)

        path = prompt["path"]
        title = prompt["title"]
        if not is_nonempty_string(path) or not re.fullmatch(
            rf"prompts/{re.escape(prompt_id)}-[a-z0-9-]+\.md", path
        ):
            errors.append(f"{label}.path is not the exact numbered prompt-path form")
        else:
            paths.append(path)
        if not is_nonempty_string(title):
            errors.append(f"{label}.title must be a non-empty string")
        else:
            titles.append(title)
        expected_source = EXPECTED_SOURCE_PROMPTS.get(prompt_id)
        if expected_source is not None and (path, title) != expected_source:
            errors.append(
                f"{label} path/title drifted from the pinned source; "
                f"expected={expected_source!r}, actual={(path, title)!r}"
            )
        if not is_nonempty_string(prompt["purpose"]):
            errors.append(f"{label}.purpose must be a non-empty string")

        risk = prompt["risk"]
        if not isinstance(risk, dict) or set(risk) != {"level", "summary"}:
            errors.append(f"{label}.risk must contain exactly level and summary")
        else:
            if risk["level"] not in VALID_RISK_LEVELS:
                errors.append(f"{label}.risk.level is invalid")
            if not is_nonempty_string(risk["summary"]):
                errors.append(f"{label}.risk.summary must be non-empty")

        suitability = prompt["suitability"]
        if not isinstance(suitability, dict) or set(suitability) != {
            "level",
            "summary",
        }:
            errors.append(
                f"{label}.suitability must contain exactly level and summary"
            )
        else:
            if suitability["level"] not in VALID_SUITABILITY_LEVELS:
                errors.append(f"{label}.suitability.level is invalid")
            if not is_nonempty_string(suitability["summary"]):
                errors.append(f"{label}.suitability.summary must be non-empty")

    counts = Counter(ids)
    for duplicate in sorted(item for item, count in counts.items() if count > 1):
        errors.append(f"source-prompts.json: duplicate prompt id {duplicate}")
    if set(ids) != EXPECTED_PROMPT_IDS:
        missing = sorted(EXPECTED_PROMPT_IDS - set(ids))
        extra = sorted(set(ids) - EXPECTED_PROMPT_IDS)
        errors.append(
            f"source-prompts.json: prompt id coverage mismatch; missing={missing}, extra={extra}"
        )
    if len(paths) != len(set(paths)):
        errors.append("source-prompts.json: prompt paths must be unique")
    if len(titles) != len(set(titles)):
        errors.append("source-prompts.json: prompt titles must be unique")
    return set(ids)


def validate_assertions(
    assertions: Any,
    label: str,
    global_assertion_ids: set[str],
    errors: list[str],
) -> None:
    if not isinstance(assertions, list) or not assertions:
        errors.append(f"{label} must be a non-empty array")
        return
    for index, assertion in enumerate(assertions):
        assertion_label = f"{label}[{index}]"
        if not isinstance(assertion, dict):
            errors.append(f"{assertion_label} must be an object")
            continue
        if set(assertion) != {"id", "kind", "expectation"}:
            errors.append(
                f"{assertion_label} must contain exactly id, kind, and expectation"
            )
            continue
        assertion_id = assertion["id"]
        if not isinstance(assertion_id, str) or not ASSERTION_ID_RE.fullmatch(
            assertion_id
        ):
            errors.append(f"{assertion_label}.id is invalid")
        elif assertion_id in global_assertion_ids:
            errors.append(f"duplicate assertion id: {assertion_id}")
        else:
            global_assertion_ids.add(assertion_id)
        if assertion["kind"] not in VALID_ASSERTION_KINDS:
            errors.append(f"{assertion_label}.kind is invalid")
        if not is_nonempty_string(assertion["expectation"]):
            errors.append(f"{assertion_label}.expectation must be non-empty")


def validate_variant(
    variant: Any,
    case_id: str,
    label: str,
    global_variant_ids: set[str],
    global_assertion_ids: set[str],
    errors: list[str],
) -> None:
    required = {
        "id",
        "tier",
        "execution_mode",
        "description",
        "destructive",
        "gates",
        "external_effects",
        "setup",
        "exercise",
        "assertions",
        "cleanup",
    }
    if not isinstance(variant, dict):
        errors.append(f"{label} must be an object")
        return
    if set(variant) != required:
        missing = sorted(required - variant.keys())
        extra = sorted(variant.keys() - required)
        errors.append(f"{label} fields mismatch; missing={missing}, extra={extra}")
        return

    variant_id = variant["id"]
    if not isinstance(variant_id, str) or not VARIANT_ID_RE.fullmatch(variant_id):
        errors.append(f"{label}.id is invalid")
    else:
        if not variant_id.startswith(case_id.split("-", 1)[0] + "-"):
            errors.append(f"{label}.id must share the family prefix {case_id}")
        if variant_id in global_variant_ids:
            errors.append(f"duplicate variant id: {variant_id}")
        global_variant_ids.add(variant_id)

    tier = variant["tier"]
    if not isinstance(tier, int) or isinstance(tier, bool) or tier not in range(5):
        errors.append(f"{label}.tier must be an integer from 0 through 4")
    elif variant["execution_mode"] != EXPECTED_MODE_BY_TIER[tier]:
        errors.append(
            f"{label}.execution_mode must be {EXPECTED_MODE_BY_TIER[tier]!r} "
            f"for tier {tier}"
        )
    if not is_nonempty_string(variant["description"]):
        errors.append(f"{label}.description must be non-empty")
    if not isinstance(variant["destructive"], bool):
        errors.append(f"{label}.destructive must be boolean")

    gates = variant["gates"]
    if not isinstance(gates, list) or any(not isinstance(gate, str) for gate in gates):
        errors.append(f"{label}.gates must be an array of strings")
        gates_set: set[str] = set()
    else:
        gates_set = set(gates)
        if len(gates) != len(gates_set):
            errors.append(f"{label}.gates must not contain duplicates")
        unknown = gates_set - VALID_GATES
        if unknown:
            errors.append(f"{label}.gates contains unknown values: {sorted(unknown)}")

    effects = variant["external_effects"]
    if not isinstance(effects, list) or not effects or any(
        not isinstance(effect, str) for effect in effects
    ):
        errors.append(f"{label}.external_effects must be a non-empty string array")
        effects_set: set[str] = set()
    else:
        effects_set = set(effects)
        if len(effects) != len(effects_set):
            errors.append(f"{label}.external_effects must not contain duplicates")
        unknown_effects = effects_set - VALID_EFFECTS
        if unknown_effects:
            errors.append(
                f"{label}.external_effects contains unknown values: {sorted(unknown_effects)}"
            )
        if "none" in effects_set and len(effects_set) != 1:
            errors.append(f"{label}.external_effects: none must be the only value")

    if variant["destructive"]:
        if not gates_set:
            errors.append(f"{label} is destructive but has no gates")
        elif not gates_set.intersection(DESTRUCTIVE_GATES):
            errors.append(
                f"{label} is destructive but lacks a destructive-operation gate"
            )
    if tier == 4 and not variant["destructive"]:
        errors.append(f"{label}: every Tier 4 variant must be marked destructive")
    if tier == 0 and effects_set != {"none"}:
        errors.append(f"{label}: Tier 0 variants must declare only the none effect")

    for effect in effects_set:
        required_gates = REQUIRED_GATES_BY_EFFECT.get(effect, set())
        missing_gates = required_gates - gates_set
        if missing_gates:
            errors.append(
                f"{label}: effect {effect!r} requires gates {sorted(missing_gates)}"
            )

    for field in ("setup", "exercise", "cleanup"):
        validate_string_list(variant[field], f"{label}.{field}", errors)
    validate_assertions(
        variant["assertions"],
        f"{label}.assertions",
        global_assertion_ids,
        errors,
    )


def validate_cases(
    known_prompt_ids: set[str], errors: list[str]
) -> tuple[set[str], int, int]:
    if not CASES_DIR.is_dir():
        errors.append("missing cases directory")
        return set(), 0, 0

    paths = sorted(CASES_DIR.glob("*.json"))
    if len(paths) != 16:
        errors.append(f"expected exactly 16 case files, found {len(paths)}")

    global_case_ids: set[str] = set()
    global_variant_ids: set[str] = set()
    global_assertion_ids: set[str] = set()
    covered_prompt_ids: set[str] = set()
    family_prefixes: set[str] = set()

    required_case_fields = {
        "$schema",
        "id",
        "name",
        "description",
        "source_prompt_ids",
        "variants",
    }

    for path in paths:
        data = load_json(path, errors)
        label = str(path.relative_to(ROOT))
        if not isinstance(data, dict):
            continue
        if set(data) != required_case_fields:
            missing = sorted(required_case_fields - data.keys())
            extra = sorted(data.keys() - required_case_fields)
            errors.append(f"{label} fields mismatch; missing={missing}, extra={extra}")
            continue
        if data["$schema"] != "../eval.schema.json":
            errors.append(f"{label}: $schema must be ../eval.schema.json")

        case_id = data["id"]
        if not isinstance(case_id, str) or not CASE_ID_RE.fullmatch(case_id):
            errors.append(f"{label}.id is invalid")
            continue
        if case_id in global_case_ids:
            errors.append(f"duplicate case id: {case_id}")
        global_case_ids.add(case_id)
        family_prefixes.add(case_id.split("-", 1)[0])

        expected_stem = case_id.lower()
        if path.stem != expected_stem:
            errors.append(f"{label}: filename must be {expected_stem}.json")
        for field in ("name", "description"):
            if not is_nonempty_string(data[field]):
                errors.append(f"{label}.{field} must be non-empty")

        prompt_ids = data["source_prompt_ids"]
        if not isinstance(prompt_ids, list) or not prompt_ids or any(
            not isinstance(prompt_id, str) for prompt_id in prompt_ids
        ):
            errors.append(f"{label}.source_prompt_ids must be a non-empty string array")
        else:
            if len(prompt_ids) != len(set(prompt_ids)):
                errors.append(f"{label}.source_prompt_ids must not contain duplicates")
            unknown = set(prompt_ids) - known_prompt_ids
            if unknown:
                errors.append(
                    f"{label}.source_prompt_ids contains unknown ids: {sorted(unknown)}"
                )
            covered_prompt_ids.update(prompt_ids)

        variants = data["variants"]
        if not isinstance(variants, list) or not variants:
            errors.append(f"{label}.variants must be a non-empty array")
        else:
            for index, variant in enumerate(variants):
                validate_variant(
                    variant,
                    case_id,
                    f"{label}.variants[{index}]",
                    global_variant_ids,
                    global_assertion_ids,
                    errors,
                )

    if family_prefixes != EXPECTED_FAMILY_PREFIXES:
        errors.append(
            "eval family sequence mismatch; "
            f"missing={sorted(EXPECTED_FAMILY_PREFIXES - family_prefixes)}, "
            f"extra={sorted(family_prefixes - EXPECTED_FAMILY_PREFIXES)}"
        )
    if covered_prompt_ids != EXPECTED_PROMPT_IDS:
        errors.append(
            "eval source-prompt coverage mismatch; "
            f"missing={sorted(EXPECTED_PROMPT_IDS - covered_prompt_ids)}, "
            f"extra={sorted(covered_prompt_ids - EXPECTED_PROMPT_IDS)}"
        )
    return covered_prompt_ids, len(global_variant_ids), len(global_assertion_ids)


def validate_trigger_cases(data: Any, errors: list[str]) -> int:
    if not isinstance(data, dict) or set(data) != {"$schema", "cases"}:
        errors.append("trigger-cases.json must contain exactly $schema and cases")
        return 0
    if data["$schema"] != "./trigger-case.schema.json":
        errors.append("trigger-cases.json has an invalid $schema reference")
    cases = data["cases"]
    if not isinstance(cases, list) or len(cases) < 8:
        errors.append("trigger-cases.json must contain at least eight cases")
        return 0
    ids: set[str] = set()
    expectations: set[str] = set()
    routes: set[str] = set()
    required = {"id", "prompt", "expectation", "route", "rationale"}
    for index, case in enumerate(cases):
        label = f"trigger-cases.json: cases[{index}]"
        if not isinstance(case, dict) or set(case) != required:
            errors.append(f"{label} must contain exactly {sorted(required)}")
            continue
        case_id = case["id"]
        if not isinstance(case_id, str) or not re.fullmatch(r"trigger-[a-z0-9-]+", case_id):
            errors.append(f"{label}.id is invalid")
        elif case_id in ids:
            errors.append(f"{label}.id is duplicated")
        else:
            ids.add(case_id)
        for field in ("prompt", "rationale"):
            if not is_nonempty_string(case[field]):
                errors.append(f"{label}.{field} must be non-empty")
        if case["expectation"] not in VALID_TRIGGER_EXPECTATIONS:
            errors.append(f"{label}.expectation is invalid")
        else:
            expectations.add(case["expectation"])
        if case["route"] not in VALID_TRIGGER_ROUTES:
            errors.append(f"{label}.route is invalid")
        else:
            routes.add(case["route"])
    if expectations != VALID_TRIGGER_EXPECTATIONS:
        errors.append("trigger cases must cover both positive and negative expectations")
    if not {"native-codex-teams", "native-claude-teams", "custom-mixed-fleet"}.issubset(routes):
        errors.append("trigger cases must cover native and heterogeneous routing boundaries")
    return len(ids)


def main() -> int:
    errors: list[str] = []

    schema = load_json(SCHEMA_PATH, errors)
    if isinstance(schema, dict):
        if schema.get("$schema") != "https://json-schema.org/draft/2020-12/schema":
            errors.append("eval.schema.json must use JSON Schema draft 2020-12")
        if schema.get("type") != "object":
            errors.append("eval.schema.json root type must be object")
    trigger_schema = load_json(TRIGGER_SCHEMA_PATH, errors)
    if isinstance(trigger_schema, dict):
        if trigger_schema.get("$schema") != "https://json-schema.org/draft/2020-12/schema":
            errors.append("trigger-case.schema.json must use JSON Schema draft 2020-12")
        if trigger_schema.get("type") != "object":
            errors.append("trigger-case.schema.json root type must be object")

    sources = load_json(SOURCE_PATH, errors)
    known_prompt_ids = validate_sources(sources, errors)
    coverage, variant_count, assertion_count = validate_cases(
        known_prompt_ids, errors
    )
    trigger_count = validate_trigger_cases(load_json(TRIGGER_CASES_PATH, errors), errors)

    if errors:
        print(f"FAILED: {len(errors)} validation error(s)", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print(
        "Validated 31 source prompts, 16 eval families, "
        f"{variant_count} variants, {assertion_count} assertions, and {trigger_count} trigger cases."
    )
    print(
        "Coverage complete: "
        f"{min(coverage)}-{max(coverage)} at source commit {EXPECTED_COMMIT}."
    )
    print("Safety checks passed: gates are valid and destructive variants are gated.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
