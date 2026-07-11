/**
 * Optional focused-session extension inspired by IndyDevDan's purpose-gate.
 * Load explicitly; it is intentionally not active in every Pi session.
 */
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

export default function purposeGate(pi: ExtensionAPI): void {
	let purpose: string | undefined;

	async function choosePurpose(ctx: ExtensionContext): Promise<void> {
		if (!ctx.hasUI) return;
		const answer = await ctx.ui.input("What is this agent's singular purpose?", purpose ?? "");
		if (!answer?.trim()) {
			ctx.ui.notify("A purpose is required before the agent can run.", "warning");
			return choosePurpose(ctx);
		}
		purpose = answer.trim();
		ctx.ui.setWidget("purpose-gate", [ctx.ui.theme.fg("accent", `Purpose: ${purpose}`)]);
	}

	pi.registerCommand("purpose", {
		description: "Set or change this session's singular purpose",
		handler: async (_args, ctx) => choosePurpose(ctx),
	});

	pi.on("session_start", async (_event, ctx) => choosePurpose(ctx));

	pi.on("before_agent_start", async (event) => {
		if (!purpose) return;
		return {
			systemPrompt: `${event.systemPrompt}\n\nSession purpose: ${purpose}\nStay focused on this purpose. Call out scope drift before acting.`,
		};
	});

	pi.on("input", async (_event, ctx) => {
		if (!ctx.hasUI || purpose) return { action: "continue" as const };
		ctx.ui.notify("Set a purpose first with /purpose.", "warning");
		return { action: "handled" as const };
	});
}
