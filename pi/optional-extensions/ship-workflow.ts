/**
 * Stateful /ship workflow for the optional Pi subagent profile.
 *
 * Phases:
 *   /ship <task>    -> scout + planner only; parent mutation tools are blocked
 *   /ship-approve   -> worker -> reviewer -> optional one correction -> final review
 *   /ship-close     -> clear the workflow guard after the final receipt
 *   /ship-cancel    -> abandon the workflow without implementation
 */
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

type ShipPhase = "idle" | "planning" | "approved";

interface ShipState {
	phase: ShipPhase;
	task?: string;
	workerCalls: number;
	reviewerCalls: number;
}

interface SubagentInvocation {
	agent?: string;
	tasks?: Array<{ agent?: string }>;
	chain?: Array<{ agent?: string }>;
}

const STATE_ENTRY = "ship-workflow-state";
const ALLOWED_SHIP_AGENTS = new Set(["scout", "planner", "worker", "reviewer"]);
const PARENT_MUTATION_TOOLS = new Set(["bash", "edit", "write"]);

function idleState(): ShipState {
	return { phase: "idle", workerCalls: 0, reviewerCalls: 0 };
}

function requestedAgents(input: SubagentInvocation): string[] {
	const agents: string[] = [];
	if (input.agent) agents.push(input.agent);
	for (const task of input.tasks ?? []) if (task.agent) agents.push(task.agent);
	for (const step of input.chain ?? []) if (step.agent) agents.push(step.agent);
	return agents;
}

export default function shipWorkflow(pi: ExtensionAPI): void {
	let state: ShipState = idleState();

	function persist(): void {
		pi.appendEntry<ShipState>(STATE_ENTRY, state);
	}

	function restore(ctx: ExtensionContext): void {
		const entry = ctx.sessionManager
			.getEntries()
			.filter((candidate: { type: string; customType?: string }) =>
				candidate.type === "custom" && candidate.customType === STATE_ENTRY,
			)
			.pop() as { data?: ShipState } | undefined;
		state = entry?.data ?? idleState();
		updateStatus(ctx);
	}

	function updateStatus(ctx: ExtensionContext): void {
		if (state.phase === "idle") {
			ctx.ui.setStatus("ship-workflow", undefined);
			return;
		}
		const color = state.phase === "planning" ? "warning" : "success";
		const detail = state.phase === "approved" ? ` · workers ${state.workerCalls}/2` : "";
		ctx.ui.setStatus("ship-workflow", ctx.ui.theme.fg(color, `ship: ${state.phase}${detail}`));
	}

	function setState(next: ShipState, ctx: ExtensionContext): void {
		state = next;
		persist();
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

			setState({ ...state, phase: "approved", workerCalls: 0, reviewerCalls: 0 }, ctx);
			pi.sendUserMessage(`[SHIP WORKFLOW — IMPLEMENTATION APPROVED]

Task: ${state.task}

Use the approved SHIP PLAN from the preceding conversation. Execute these steps with separate subagent calls so review findings can be evaluated before correction:

1. Call worker once. Include the full approved plan and task in its prompt. Require implementation plus targeted verification.
2. Call reviewer. Include the worker result; require independent repository inspection and only actionable findings.
3. If and only if the reviewer reports actionable findings, call worker one final time with the exact feedback. This is the only correction pass.
4. After a correction, call reviewer again for a final verification receipt. If no correction was needed, the first review is final.

The parent must orchestrate and synthesize, not edit files or run Bash directly. End with outcome, changed files, checks, reviewer verdict, and remaining risk. Tell the user to run /ship-close after accepting the result.`);
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
				`Ship phase: ${state.phase}\nTask: ${state.task}\nWorker calls: ${state.workerCalls}/2\nReviewer calls: ${state.reviewerCalls}`,
				"info",
			);
		},
	});

	const clearWorkflow = (message: string) => async (_args: string, ctx: ExtensionContext) => {
		setState(idleState(), ctx);
		ctx.ui.notify(message, "info");
	};

	pi.registerCommand("ship-close", {
		description: "Close a completed ship workflow and remove its guards",
		handler: clearWorkflow("Ship workflow closed."),
	});

	pi.registerCommand("ship-cancel", {
		description: "Cancel the active ship workflow without further work",
		handler: clearWorkflow("Ship workflow cancelled."),
	});

	pi.on("tool_call", async (event, ctx) => {
		if (state.phase === "idle") return;

		if (PARENT_MUTATION_TOOLS.has(event.toolName)) {
			return {
				block: true,
				reason: `Ship workflow guard: parent ${event.toolName} is disabled. Delegate implementation and verification through the configured subagents.`,
			};
		}

		if (event.toolName !== "subagent") return;
		const agents = requestedAgents(event.input as SubagentInvocation);
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

		if (agents.length !== 1) {
			return {
				block: true,
				reason: "Ship workflow guard: implementation and review must use separate single-agent calls so review findings can be evaluated before any correction.",
			};
		}

		let workerCalls = state.workerCalls;
		let reviewerCalls = state.reviewerCalls;
		for (const agent of agents) {
			if (agent === "reviewer") reviewerCalls += 1;
			if (agent !== "worker") continue;
			if (workerCalls >= 2) {
				return { block: true, reason: "Ship workflow guard: the two-worker limit has been reached." };
			}
			if (workerCalls === 1 && reviewerCalls === 0) {
				return {
					block: true,
					reason: "Ship workflow guard: a reviewer must report actionable findings before the correction worker runs.",
				};
			}
			workerCalls += 1;
		}

		if (workerCalls !== state.workerCalls || reviewerCalls !== state.reviewerCalls) {
			setState({ ...state, workerCalls, reviewerCalls }, ctx);
		}
	});

	pi.on("before_agent_start", async (event) => {
		if (state.phase === "idle") return;
		const guard =
			state.phase === "planning"
				? "SHIP is in planning. Only scout and planner subagents are allowed. Stop for /ship-approve before implementation."
				: "SHIP implementation is approved. Orchestrate worker and reviewer subagents; at most two worker calls are allowed, and the second requires a preceding review.";
		return { systemPrompt: `${event.systemPrompt}\n\n${guard}\nActive task: ${state.task}` };
	});

	pi.on("session_start", async (_event, ctx) => restore(ctx));
	pi.on("session_tree", async (_event, ctx) => restore(ctx));
}
