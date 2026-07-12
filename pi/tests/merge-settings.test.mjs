import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { mergeOwnedSettings, mergeSettingsFile } from "../scripts/merge-settings.mjs";

test("mergeOwnedSettings preserves unowned state and required array entries", () => {
	const merged = mergeOwnedSettings(
		{
			defaultProvider: "google",
			theme: "dark",
			lastChangelogVersion: "0.80.6",
			warnings: { userWarning: false },
			skills: ["~/personal/skills"],
		},
		{
			defaultProvider: "openai-codex",
			warnings: { anthropicExtraUsage: true },
			skills: ["~/.claude/skills"],
		},
	);

	assert.deepEqual(merged, {
		defaultProvider: "openai-codex",
		theme: "dark",
		lastChangelogVersion: "0.80.6",
		warnings: { userWarning: false, anthropicExtraUsage: true },
		skills: ["~/personal/skills", "~/.claude/skills"],
	});
});

test("mergeSettingsFile creates a timestamped backup and is idempotent", (t) => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pi-settings-test-"));
	t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

	const source = path.join(dir, "owned.json");
	const target = path.join(dir, "settings.json");
	const original = '{"theme":"dark","defaultProvider":"google"}\n';
	fs.writeFileSync(source, '{"defaultProvider":"openai-codex"}\n');
	fs.writeFileSync(target, original);

	const now = new Date("2026-07-11T12:00:00.000Z");
	const first = mergeSettingsFile(source, target, { now });
	assert.equal(first.changed, true);
	assert.equal(first.backupPath, `${target}.backup.20260711T120000000Z`);
	assert.equal(fs.readFileSync(first.backupPath, "utf8"), original);
	assert.deepEqual(JSON.parse(fs.readFileSync(target, "utf8")), {
		theme: "dark",
		defaultProvider: "openai-codex",
	});

	const second = mergeSettingsFile(source, target, { now });
	assert.deepEqual(second, { changed: false, backupPath: null });

	fs.writeFileSync(source, '{"defaultProvider":"anthropic"}\n');
	const third = mergeSettingsFile(source, target, { now });
	assert.equal(third.backupPath, `${target}.backup.20260711T120000000Z.1`);
	assert.equal(JSON.parse(fs.readFileSync(target, "utf8")).defaultProvider, "anthropic");
});

test("mergeSettingsFile rejects invalid user settings without replacing them", (t) => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pi-settings-invalid-"));
	t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

	const source = path.join(dir, "owned.json");
	const target = path.join(dir, "settings.json");
	fs.writeFileSync(source, '{"defaultProvider":"openai-codex"}\n');
	fs.writeFileSync(target, "not-json\n");

	assert.throws(() => mergeSettingsFile(source, target), SyntaxError);
	assert.equal(fs.readFileSync(target, "utf8"), "not-json\n");
	assert.deepEqual(fs.readdirSync(dir).sort(), ["owned.json", "settings.json"]);
});

test("mergeSettingsFile refuses to replace a settings symlink", (t) => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pi-settings-symlink-"));
	t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

	const source = path.join(dir, "owned.json");
	const referent = path.join(dir, "real-settings.json");
	const target = path.join(dir, "settings.json");
	fs.writeFileSync(source, '{"defaultProvider":"openai-codex"}\n');
	fs.writeFileSync(referent, '{"theme":"dark"}\n');
	fs.symlinkSync(referent, target);

	assert.throws(() => mergeSettingsFile(source, target), /Refusing to replace symlinked Pi settings/);
	assert.equal(fs.lstatSync(target).isSymbolicLink(), true);
	assert.deepEqual(JSON.parse(fs.readFileSync(referent, "utf8")), { theme: "dark" });
});

test("mergeSettingsFile refuses to replace a dangling settings symlink", (t) => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pi-settings-dangling-symlink-"));
	t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

	const source = path.join(dir, "owned.json");
	const missingReferent = path.join(dir, "missing-settings.json");
	const target = path.join(dir, "settings.json");
	fs.writeFileSync(source, '{"defaultProvider":"openai-codex"}\n');
	fs.symlinkSync(missingReferent, target);

	assert.throws(() => mergeSettingsFile(source, target), /Refusing to replace symlinked Pi settings/);
	assert.equal(fs.lstatSync(target).isSymbolicLink(), true);
	assert.equal(fs.existsSync(missingReferent), false);
});
