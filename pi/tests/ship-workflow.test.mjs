import assert from "node:assert/strict";
import test from "node:test";

import shipWorkflow, { parseReviewerVerdict } from "../optional-extensions/ship-workflow.ts";

function createHarness() {
	const commands = new Map();
	const handlers = new Map();
	const entries = [];
	const notifications = [];
	const userMessages = [];

	const pi = {
		registerCommand(name, definition) {
			commands.set(name, definition.handler);
		},
		on(name, handler) {
			const eventHandlers = handlers.get(name) ?? [];
			eventHandlers.push(handler);
			handlers.set(name, eventHandlers);
		},
		appendEntry(customType, data) {
			entries.push({ type: "custom", customType, data: structuredClone(data) });
		},
		sendUserMessage(message) {
			userMessages.push(message);
		},
	};

	const ctx = {
		hasUI: true,
		sessionManager: { getEntries: () => [] },
		ui: {
			confirm: async () => true,
			notify: (message, level) => notifications.push({ message, level }),
			setStatus: () => {},
			theme: { fg: (_color, value) => value },
		},
	};

	shipWorkflow(pi);

	return {
		ctx,
		entries,
		notifications,
		userMessages,
		state() {
			return entries.at(-1)?.data;
		},
		async command(name, args = "") {
			return commands.get(name)(args, ctx);
		},
		async emit(name, event) {
			let result;
			for (const handler of handlers.get(name) ?? []) {
				const next = await handler(event, ctx);
				if (next !== undefined) result = next;
			}
			return result;
		},
	};
}

async function approveWorkflow(harness) {
	await harness.command("ship", "Implement the bounded task");
	await harness.command("ship-approve");
	assert.equal(harness.state().stage, "awaiting-worker");
}

function singleCall(toolCallId, agent, overrides = {}) {
	return {
		type: "tool_call",
		toolName: "subagent",
		toolCallId,
		input: { agent, task: `Run ${agent}`, ...overrides },
	};
}

function result(toolCallId, text, isError = false) {
	return {
		type: "tool_result",
		toolName: "subagent",
		toolCallId,
		input: {},
		content: [{ type: "text", text }],
		isError,
		details: undefined,
	};
}

test("reviewer verdict parser requires exactly one standalone marker", () => {
	assert.equal(parseReviewerVerdict("No findings.\nSHIP_REVIEW_VERDICT: PASS"), "pass");
	assert.equal(parseReviewerVerdict("Issue found.\nSHIP_REVIEW_VERDICT: FINDINGS"), "findings");
	assert.equal(parseReviewerVerdict("No marker"), null);
	assert.equal(parseReviewerVerdict("SHIP_REVIEW_VERDICT: PASS\nTrailing commentary"), null);
	assert.equal(
		parseReviewerVerdict("SHIP_REVIEW_VERDICT: PASS\nSHIP_REVIEW_VERDICT: FINDINGS"),
		null,
	);
});

test("active workflow forces user-only agent discovery", async () => {
	const harness = createHarness();
	await harness.command("ship", "Plan safely");
	const event = {
		type: "tool_call",
		toolName: "subagent",
		toolCallId: "planning",
		input: {
			chain: [
				{ agent: "scout" },
				{ agent: "planner" },
			],
			agentScope: "both",
			confirmProjectAgents: false,
		},
	};

	assert.equal(await harness.emit("tool_call", event), undefined);
	assert.equal(event.input.agentScope, "user");
	assert.equal(event.input.confirmProjectAgents, true);
});

test("successful initial worker and PASS review complete the workflow", async () => {
	const harness = createHarness();
	await approveWorkflow(harness);

	const prematureReview = await harness.emit("tool_call", singleCall("review-early", "reviewer"));
	assert.equal(prematureReview.block, true);
	assert.match(prematureReview.reason, /expected worker/);

	assert.equal(await harness.emit("tool_call", singleCall("worker-1", "worker")), undefined);
	assert.equal(harness.state().stage, "worker-running");
	await harness.emit("tool_result", result("worker-1", "Implementation complete"));
	assert.equal(harness.state().stage, "awaiting-review");
	assert.equal(harness.state().workerCalls, 1);

	await harness.emit("tool_call", singleCall("review-invalid", "reviewer"));
	const invalid = await harness.emit("tool_result", result("review-invalid", "No actionable findings."));
	assert.equal(invalid.isError, true);
	assert.match(invalid.content.at(-1).text, /exactly one standalone verdict/);
	assert.equal(harness.state().stage, "awaiting-review");
	assert.equal(harness.state().reviewerCalls, 0);

	await harness.emit("tool_call", singleCall("review-pass", "reviewer"));
	await harness.emit("tool_result", result("review-pass", "No findings.\nSHIP_REVIEW_VERDICT: PASS"));
	assert.equal(harness.state().stage, "complete");
	assert.equal(harness.state().lastReviewVerdict, "pass");
	assert.equal(harness.state().reviewerCalls, 1);

	const extraWorker = await harness.emit("tool_call", singleCall("worker-extra", "worker"));
	assert.equal(extraWorker.block, true);
	assert.match(extraWorker.reason, /final review is complete/);

	await harness.command("ship-close");
	assert.equal(harness.state().phase, "idle");
});

test("FINDINGS unlock exactly one corrective worker followed by final review", async () => {
	const harness = createHarness();
	await approveWorkflow(harness);

	await harness.emit("tool_call", singleCall("worker-1", "worker"));
	await harness.emit("tool_result", result("worker-1", "Implementation complete"));
	await harness.emit("tool_call", singleCall("review-1", "reviewer"));
	await harness.emit(
		"tool_result",
		result("review-1", "One actionable issue.\nSHIP_REVIEW_VERDICT: FINDINGS"),
	);
	assert.equal(harness.state().stage, "correction-available");

	const repeatedReview = await harness.emit("tool_call", singleCall("review-repeat", "reviewer"));
	assert.equal(repeatedReview.block, true);
	assert.match(repeatedReview.reason, /expected worker/);

	await harness.emit("tool_call", singleCall("worker-2", "worker"));
	await harness.emit("tool_result", result("worker-2", "Correction complete"));
	assert.equal(harness.state().stage, "awaiting-final-review");
	assert.equal(harness.state().workerCalls, 2);

	await harness.emit("tool_call", singleCall("review-2", "reviewer"));
	await harness.emit(
		"tool_result",
		result("review-2", "A residual risk remains.\nSHIP_REVIEW_VERDICT: FINDINGS"),
	);
	assert.equal(harness.state().stage, "complete");
	assert.equal(harness.state().lastReviewVerdict, "findings");
	assert.equal(harness.state().reviewerCalls, 2);

	const thirdWorker = await harness.emit("tool_call", singleCall("worker-3", "worker"));
	assert.equal(thirdWorker.block, true);
});

test("failed subagent results retry the same stage without advancing counters", async () => {
	const harness = createHarness();
	await approveWorkflow(harness);

	await harness.emit("tool_call", singleCall("worker-failed", "worker"));
	await harness.emit("tool_result", result("worker-failed", "Process failed", true));
	assert.equal(harness.state().stage, "awaiting-worker");
	assert.equal(harness.state().workerCalls, 0);

	await harness.command("ship-close");
	assert.equal(harness.state().phase, "approved");
	assert.match(harness.notifications.at(-1).message, /no final reviewer verdict/i);
});
