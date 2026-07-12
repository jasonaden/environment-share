/**
 * Stateful /ship workflow for the optional Pi subagent profile.
 *
 * Phases:
 *   /ship <task>    -> scout + planner only; parent mutation tools are blocked
 *   /ship-approve   -> worker -> reviewer -> optional correction -> final review
 *   /ship-close     -> clear the workflow only after a final reviewer verdict
 *   /ship-cancel    -> abandon the workflow without further implementation
 */
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

type ShipPhase = "idle" | "planning" | "approved";
export type ReviewerVerdict = "pass" | "findings";
export type ShipStage =
	| "awaiting-worker"
	| "worker-running"
	| "awaiting-review"
	| "review-running"
	| "correction-available"
	| "correction-running"
	| "awaiting-final-review"
	| "final-review-running"
	| "complete";

export interface ShipState {
	phase: ShipPhase;
	task?: string;
	stage?: ShipStage;
	workerCalls: number;
	reviewerCalls: number;
	pendingToolCallId?: string;
	lastReviewVerdict?: ReviewerVerdict;
}

interface SubagentInvocation {
	agent?: string;
	task?: string;
	tasks?: Array<{ agent?: string }>;
	chain?: Array<{ agent?: string }>;
	agentScope?: "user" | "project" | "both";
	confirmProjectAgents?: boolean;
}

interface StageExpectation {
	agent: "worker" | "reviewer";
	runningStage: ShipStage;
}

const STATE_ENTRY = "ship-workflow-state";
const REVIEW_VERDICT_FORMAT = "SHIP_REVIEW_VERDICT: PASS or SHIP_REVIEW_VERDICT: FINDINGS";
const ALLOWED_SHIP_AGENTS = new Set(["scout", "planner", "worker", "reviewer"]);
const PARENT_MUTATION_TOOLS = new Set(["bash", "edit", "write"]);

export function idleState(): ShipState {
	return { phase: "idle", workerCalls: 0, reviewerCalls: 0 };
}

export function parseReviewerVerdict(text: string): ReviewerVerdict | null {
	const matches = Array.from(text.matchAll(/^\s*SHIP_REVIEW_VERDICT:\s*(PASS|FINDINGS)\s*$/gim));
	if (matches.length !== 1) return null;
	const finalLine = text.trimEnd().split(/\r?\n/).at(-1)?.trim();
	const finalMatch = finalLine?.match(/^SHIP_REVIEW_VERDICT:\s*(PASS|FINDINGS)$/i);
	if (!finalMatch) return null;
	return finalMatch[1].toLowerCase() as ReviewerVerdict;
}

function requestedAgents(input: SubagentInvocation): string[] {
	const agents: string[] = [];
	if (input.agent) agents.push(input.agent);
	for (const task of input.tasks ?? []) if (task.agent) agents.push(task.agent);
	for (const step of input.chain ?? []) if (step.agent) agents.push(step.agent);
	return agents;
}

function isSingleAgentInvocation(input: SubagentInvocation): boolean {
	return Boolean(input.agent && input.task && !input.tasks?.length && !input.chain?.length);
}

function expectationForStage(stage: ShipStage | undefined): StageExpectation | null {
	switch (stage) {
		case "awaiting-worker":
			return { agent: "worker", runningStage: "worker-running" };
		case "awaiting-review":
			return { agent: "reviewer", runningStage: "review-running" };
		case "correction-available":
			return { agent: "worker", runningStage: "correction-running" };
		case "awaiting-final-review":
			return { agent: "reviewer", runningStage: "final-review-running" };
		default:
			return null;
	}
}

function retryStage(stage: ShipStage | undefined): ShipStage {
	switch (stage) {
		case "worker-running":
			return "awaiting-worker";
		case "review-running":
			return "awaiting-review";
		case "correction-running":
			return "correction-available";
		case "final-review-running":
			return "awaiting-final-review";
		default:
			return stage ?? "awaiting-worker";
	}
}

function normalizeState(candidate: ShipState | undefined): ShipState {
	if (!candidate || candidate.phase === "idle") return idleState();
	if (candidate.phase === "planning") {
		return {
			phase: "planning",
			task: candidate.task,
			workerCalls: 0,
			reviewerCalls: 0,
		};
	}

	const stage = candidate.stage
		? retryStage(candidate.stage)
		: candidate.workerCalls > 0 || candidate.reviewerCalls > 0
			? "complete"
			: "awaiting-worker";
	return {
		phase: "approved",
		task: candidate.task,
		stage,
		workerCalls: candidate.workerCalls ?? 0,
		reviewerCalls: candidate.reviewerCalls ?? 0,
		lastReviewVerdict: candidate.lastReviewVerdict,
	};
}

function resultText(content: Array<{ type: string; text?: string }>): string {
	return content
		.filter((part): part is { type: "text"; text: string } => part.type === "text" && typeof part.text === "string")
		.map((part) => part.text)
		.join("\n");
}

function stageInstruction(stage: ShipStage | undefined): string {
	switch (stage) {
		case "awaiting-worker":
			return "Call the worker once with the approved plan and require targeted verification.";
		case "worker-running":
		case "correction-running":
		case "review-running":
		case "final-review-running":
			return "A subagent call is already running. Wait for its result before taking the next workflow step.";
		case "awaiting-review":
			return `Call the reviewer once. Its final line must be exactly ${REVIEW_VERDICT_FORMAT}.`;
		case "correction-available":
			return "The reviewer reported findings. Call one final worker with only the actionable feedback.";
		case "awaiting-final-review":
			return `Call the final reviewer. Its final line must be exactly ${REVIEW_VERDICT_FORMAT}. No further worker is allowed.`;
		case "complete":
			return "The final reviewer verdict is recorded. Synthesize the receipt and tell the user to run /ship-close.";
		default:
			return "Follow the guarded worker and reviewer sequence.";
	}
}

export default function shipWorkflow(pi: ExtensionAPI): void {
	let state: ShipState = idleState();

	function persist(): void {
		pi.appendEntry<ShipState>(STATE_ENTRY, state);
	}

	function updateStatus(ctx: ExtensionContext): void {
		if (state.phase === "idle") {
			ctx.ui.setStatus("ship-workflow", undefined);
			return;
		}
		const color = state.phase === "planning" ? "warning" : state.stage === "complete" ? "success" : "accent";
		const stage = state.phase === "approved" ? ` · ${state.stage}` : "";
		ctx.ui.setStatus(
			"ship-workflow",
			ctx.ui.theme.fg(color, `ship: ${state.phase}${stage} · workers ${state.workerCalls}/2 · reviews ${state.reviewerCalls}`),
		);
	}

	function setState(next: ShipState, ctx: ExtensionContext): void {
		state = next;
		persist();
		updateStatus(ctx);
	}

	function restore(ctx: ExtensionContext): void {
		const entry = ctx.sessionManager
			.getEntries()
			.filter(
				(candidate: { type: string; customType?: string }) =>
					candidate.type === "custom" && candidate.customType === STATE_ENTRY,
			)
			.pop() as { data?: ShipState } | undefined;
		state = normalizeState(entry?.data);
		updateStatus(ctx);
	}

	pi.registerCommand("ship", {
		description: "Start guarded scout -> plan -> approve -> implement -> review workflow",
		handler: async (args, ctx) => {
			const task = args.trim();
			if (!task) {
				ctx.ui.notify("Usage: /ship <task>", "warning");
				return;
			}

			if (state.phase !== "idle") {
				const replace = await ctx.ui.confirm(
					"Replace active ship workflow?",
					`Current task: ${state.task ?? "unknown"}\n\nNew task: ${task}`,
				);
				if (!replace) return;
			}

			setState({ phase: "planning", task, workerCalls: 0, reviewerCalls: 0 }, ctx);
			pi.sendUserMessage(`[SHIP WORKFLOW — PLANNING ONLY]

Task: ${task}

Use the subagent tool with a two-step chain:
1. scout: map the repository evidence relevant to the task.
2. planner: turn the scout output into an executable plan using {previous}.

The workflow forces user-level agents. Do not request project-local agents.
Do not call worker. Do not modify files or run Bash in the parent session.

Return a SHIP PLAN containing scope, exact files, ordered steps, risks, and verification commands. Then stop and tell the user to run /ship-approve or /ship-cancel.`);
		},
	});

	pi.registerCommand("ship-approve", {
		description: "Approve the active ship plan and unlock bounded implementation",
		handler: async (_args, ctx) => {
			if (state.phase !== "planning" || !state.task) {
				ctx.ui.notify("No ship plan is awaiting approval. Start one with /ship <task>.", "warning");
				return;
			}

			const approved = await ctx.ui.confirm(
				"Approve implementation?",
				`Task: ${state.task}\n\nThis unlocks one implementation worker and at most one corrective worker pass.`,
			);
			if (!approved) return;

			setState(
				{
					phase: "approved",
					task: state.task,
					stage: "awaiting-worker",
					workerCalls: 0,
					reviewerCalls: 0,
				},
				ctx,
			);
			pi.sendUserMessage(`[SHIP WORKFLOW — IMPLEMENTATION APPROVED]

Task: ${state.task}

Use the approved SHIP PLAN from the preceding conversation. The guard enforces this exact successful-result sequence:

1. Worker implements and verifies.
2. Reviewer returns actionable findings or a pass verdict.
3. Only a FINDINGS verdict unlocks one corrective worker.
4. A correction must be followed by one final reviewer. No third worker is allowed.

Every reviewer must end with exactly one verdict line:
SHIP_REVIEW_VERDICT: PASS
or
SHIP_REVIEW_VERDICT: FINDINGS

The parent must orchestrate and synthesize, not edit files or run Bash directly.`);
		},
	});

	pi.registerCommand("ship-status", {
		description: "Show the active ship workflow state",
		handler: async (_args, ctx) => {
			if (state.phase === "idle") {
				ctx.ui.notify("No active ship workflow.", "info");
				return;
			}
			ctx.ui.notify(
				`Ship phase: ${state.phase}\nStage: ${state.stage ?? "planning"}\nTask: ${state.task}\nSuccessful workers: ${state.workerCalls}/2\nSuccessful reviewers: ${state.reviewerCalls}\nLast verdict: ${state.lastReviewVerdict ?? "none"}`,
				"info",
			);
		},
	});

	pi.registerCommand("ship-close", {
		description: "Close a completed ship workflow and remove its guards",
		handler: async (_args, ctx) => {
			if (state.phase !== "approved" || state.stage !== "complete" || !state.lastReviewVerdict) {
				ctx.ui.notify("The workflow has no final reviewer verdict. Finish it or use /ship-cancel.", "warning");
				return;
			}
			setState(idleState(), ctx);
			ctx.ui.notify("Ship workflow closed.", "info");
		},
	});

	pi.registerCommand("ship-cancel", {
		description: "Cancel the active ship workflow without further work",
		handler: async (_args, ctx) => {
			setState(idleState(), ctx);
			ctx.ui.notify("Ship workflow cancelled.", "info");
		},
	});

	pi.on("tool_call", async (event, ctx) => {
		if (state.phase === "idle") return;

		if (PARENT_MUTATION_TOOLS.has(event.toolName)) {
			return {
				block: true,
				reason: `Ship workflow guard: parent ${event.toolName} is disabled. Delegate through the configured user-level subagents.`,
			};
		}

		if (event.toolName !== "subagent") return;
		const input = event.input as SubagentInvocation;
		input.agentScope = "user";
		input.confirmProjectAgents = true;

		const agents = requestedAgents(input);
		const unknown = agents.filter((agent) => !ALLOWED_SHIP_AGENTS.has(agent));
		if (unknown.length > 0) {
			return { block: true, reason: `Ship workflow guard: unsupported agent(s): ${unknown.join(", ")}.` };
		}

		if (state.phase === "planning") {
			const disallowed = agents.filter((agent) => agent !== "scout" && agent !== "planner");
			if (disallowed.length > 0) {
				return {
					block: true,
					reason: "Ship workflow guard: implementation is locked until the user runs /ship-approve.",
				};
			}
			return;
		}

		if (!isSingleAgentInvocation(input) || agents.length !== 1) {
			return {
				block: true,
				reason: "Ship workflow guard: implementation and review require separate single-agent calls.",
			};
		}

		const expectation = expectationForStage(state.stage);
		if (!expectation) {
			const reason = state.stage === "complete"
				? "Ship workflow guard: final review is complete; synthesize the result and run /ship-close."
				: "Ship workflow guard: another subagent call is still running. Wait for its result.";
			return { block: true, reason };
		}

		if (input.agent !== expectation.agent) {
			return {
				block: true,
				reason: `Ship workflow guard: expected ${expectation.agent} at stage ${state.stage}; requested ${input.agent}.`,
			};
		}

		setState(
			{
				...state,
				stage: expectation.runningStage,
				pendingToolCallId: event.toolCallId,
			},
			ctx,
		);
	});

	pi.on("tool_result", async (event, ctx) => {
		if (state.phase !== "approved" || event.toolName !== "subagent") return;
		if (!state.pendingToolCallId || event.toolCallId !== state.pendingToolCallId) return;

		const runningStage = state.stage;
		const fallbackStage = retryStage(runningStage);
		if (event.isError) {
			setState({ ...state, stage: fallbackStage, pendingToolCallId: undefined }, ctx);
			return;
		}

		if (runningStage === "worker-running" || runningStage === "correction-running") {
			setState(
				{
					...state,
					stage: runningStage === "worker-running" ? "awaiting-review" : "awaiting-final-review",
					workerCalls: state.workerCalls + 1,
					pendingToolCallId: undefined,
				},
				ctx,
			);
			return;
		}

		if (runningStage !== "review-running" && runningStage !== "final-review-running") return;
		const verdict = parseReviewerVerdict(resultText(event.content));
		if (!verdict) {
			setState({ ...state, stage: fallbackStage, pendingToolCallId: undefined }, ctx);
			return {
				isError: true,
				content: [
					...event.content,
					{
						type: "text" as const,
						text: `Ship workflow guard: reviewer result must contain exactly one standalone verdict line: ${REVIEW_VERDICT_FORMAT}. Retry the reviewer.`,
					},
				],
			};
		}

		const isFinalReview = runningStage === "final-review-running";
		setState(
			{
				...state,
				stage: isFinalReview || verdict === "pass" ? "complete" : "correction-available",
				reviewerCalls: state.reviewerCalls + 1,
				pendingToolCallId: undefined,
				lastReviewVerdict: verdict,
			},
			ctx,
		);
	});

	pi.on("before_agent_start", async (event) => {
		if (state.phase === "idle") return;
		const guard = state.phase === "planning"
			? "SHIP is in planning. Only user-level scout and planner subagents are allowed. Stop for /ship-approve before implementation."
			: `SHIP implementation is approved. ${stageInstruction(state.stage)}`;
		return { systemPrompt: `${event.systemPrompt}\n\n${guard}\nActive task: ${state.task}` };
	});

	pi.on("session_start", async (_event, ctx) => restore(ctx));
	pi.on("session_tree", async (_event, ctx) => restore(ctx));
}
