#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

function isPlainObject(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function stableValueKey(value) {
	return JSON.stringify(value);
}

/**
 * Apply only keys declared by the repository settings file.
 *
 * Objects merge recursively so Pi/user-owned nested fields survive. Arrays
 * retain existing entries and add the repository's required entries once.
 * Scalars declared by the repository intentionally replace existing values.
 */
export function mergeOwnedSettings(existing, owned) {
	if (Array.isArray(owned)) {
		if (!Array.isArray(existing)) return [...owned];
		const merged = [...existing];
		const seen = new Set(existing.map(stableValueKey));
		for (const item of owned) {
			const key = stableValueKey(item);
			if (seen.has(key)) continue;
			seen.add(key);
			merged.push(item);
		}
		return merged;
	}

	if (!isPlainObject(owned)) return owned;

	const merged = isPlainObject(existing) ? { ...existing } : {};
	for (const [key, value] of Object.entries(owned)) {
		merged[key] = mergeOwnedSettings(merged[key], value);
	}
	return merged;
}

function timestampForBackup(now) {
	return now.toISOString().replace(/[-:.]/g, "");
}

function availableBackupPath(targetPath, now) {
	const base = `${targetPath}.backup.${timestampForBackup(now)}`;
	let candidate = base;
	let suffix = 0;
	while (fs.existsSync(candidate)) {
		suffix += 1;
		candidate = `${base}.${suffix}`;
	}
	return candidate;
}

function parseSettings(filePath, fallback) {
	if (!fs.existsSync(filePath)) return fallback;
	const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
	if (!isPlainObject(parsed)) throw new Error(`${filePath} must contain a JSON object`);
	return parsed;
}

export function mergeSettingsFile(sourcePath, targetPath, options = {}) {
	const owned = parseSettings(sourcePath, undefined);
	if (!owned) throw new Error(`Repository settings file not found: ${sourcePath}`);

	const targetStats = fs.lstatSync(targetPath, { throwIfNoEntry: false });
	const targetExists = targetStats !== undefined;
	if (targetStats?.isSymbolicLink()) {
		throw new Error(`Refusing to replace symlinked Pi settings: ${targetPath}`);
	}
	const existing = parseSettings(targetPath, {});
	const merged = mergeOwnedSettings(existing, owned);
	const serialized = `${JSON.stringify(merged, null, 2)}\n`;

	if (targetExists && fs.readFileSync(targetPath, "utf8") === serialized) {
		return { changed: false, backupPath: null };
	}

	fs.mkdirSync(path.dirname(targetPath), { recursive: true });

	let backupPath = null;
	if (targetExists) {
		const now = options.now ?? new Date();
		backupPath = availableBackupPath(targetPath, now);
		fs.copyFileSync(targetPath, backupPath, fs.constants.COPYFILE_EXCL);
	}

	const mode = targetExists ? fs.statSync(targetPath).mode & 0o777 : 0o600;
	const tempPath = `${targetPath}.tmp.${process.pid}`;
	try {
		fs.writeFileSync(tempPath, serialized, { encoding: "utf8", mode });
		fs.renameSync(tempPath, targetPath);
	} finally {
		if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
	}

	return { changed: true, backupPath };
}

function main() {
	const [sourcePath, targetPath] = process.argv.slice(2);
	if (!sourcePath || !targetPath) {
		console.error("Usage: merge-settings.mjs <repository-settings.json> <target-settings.json>");
		process.exitCode = 2;
		return;
	}

	const result = mergeSettingsFile(sourcePath, targetPath);
	if (!result.changed) {
		console.log(`    Pi settings already current: ${targetPath}`);
		return;
	}
	if (result.backupPath) console.log(`    Backed up Pi settings to ${result.backupPath}`);
	console.log(`    Merged repository-owned Pi settings into ${targetPath}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
