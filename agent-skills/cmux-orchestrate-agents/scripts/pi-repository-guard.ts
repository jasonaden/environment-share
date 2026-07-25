/** Fail-closed repository boundary for the explicitly enabled Pi read tools. */

import { realpathSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const allowedTools = new Set(["read", "grep", "ls"]);
const unicodeSpaces = /[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g;

function expandPath(value: string): string {
	let normalized = value.replace(unicodeSpaces, " ");
	if (normalized.startsWith("@")) normalized = normalized.slice(1);
	if (normalized === "~") normalized = homedir();
	else if (normalized.startsWith("~/")) normalized = join(homedir(), normalized.slice(2));
	if (/^file:\/\//.test(normalized)) normalized = fileURLToPath(normalized);
	return isAbsolute(normalized) ? resolve(normalized) : resolve(process.cwd(), normalized);
}

function isWithin(candidate: string, root: string): boolean {
	const rel = relative(root, candidate);
	return rel === "" || (!rel.startsWith(`..${sep}`) && rel !== ".." && !isAbsolute(rel));
}

function isSensitivePath(candidate: string, root: string): boolean {
	const rel = relative(root, candidate);
	const parts = rel.split(sep).map((part) => part.toLowerCase());
	const name = parts.at(-1) ?? "";
	const allowedEnvTemplates = new Set([".env.example", ".env.sample", ".env.template", ".env.dist"]);
	const exact = new Set([".npmrc", ".netrc", "auth.json", "credentials.json", "id_rsa", "id_ed25519"]);
	return (
		parts.some((part) => new Set([".git", ".ssh", ".aws", ".kube"]).has(part)) ||
		name === ".env" ||
		(name.startsWith(".env.") && !allowedEnvTemplates.has(name)) ||
		exact.has(name) ||
		[".pem", ".key", ".p12", ".pfx"].some((suffix) => name.endsWith(suffix)) ||
		name.startsWith("secrets.")
	);
}

export default function repositoryGuard(pi: ExtensionAPI) {
	const configuredRoot = process.env.CMUX_AGENT_REPOSITORY;
	if (!configuredRoot) throw new Error("CMUX_AGENT_REPOSITORY is required");
	const root = realpathSync.native(configuredRoot);

	pi.on("tool_call", async (event) => {
		if (!allowedTools.has(event.toolName)) {
			return { block: true, reason: `Tool ${event.toolName} is outside the read-only fleet policy` };
		}
		const input = event.input as Record<string, unknown>;
		if (event.toolName === "read" && !("path" in input)) {
			return { block: true, reason: "Read requires a repository-relative path" };
		}
		const rawPath = input.path ?? ".";
		if (typeof rawPath !== "string" || rawPath.includes("\0")) {
			return { block: true, reason: "A valid repository-relative path is required" };
		}
		let canonical: string;
		let regularFile: boolean;
		try {
			canonical = realpathSync.native(expandPath(rawPath));
			regularFile = statSync(canonical).isFile();
		} catch {
			return { block: true, reason: "The requested path cannot be resolved inside the repository" };
		}
		if (!isWithin(canonical, root)) {
			return { block: true, reason: "Reading outside the repository, including through symlinks, is denied" };
		}
		if (isSensitivePath(canonical, root)) {
			return { block: true, reason: "Reading credential-like or secret-bearing repository paths is denied" };
		}
		if (event.toolName === "read" && !regularFile) {
			return { block: true, reason: "Read is restricted to individual regular files" };
		}
		if (event.toolName === "grep" && !regularFile) {
			return { block: true, reason: "Grep is restricted to an individually guarded file" };
		}
		if (event.toolName === "grep" && input.glob !== undefined) {
			return { block: true, reason: "Grep globs are disabled; select one guarded file explicitly" };
		}
		if (
			event.toolName === "grep" &&
			(typeof input.pattern !== "string" || input.pattern.length > 1000 || input.pattern.includes("\0"))
		) {
			return { block: true, reason: "Grep requires a bounded text pattern" };
		}
		return undefined;
	});
}
