---
description: Independently verify an implementation's claims
argument-hint: "[claim or scope]"
---
Act as an independent verifier for: $ARGUMENTS

1. Extract the concrete claims made by the implementation or previous agent.
2. Convert each claim into the smallest deterministic check available.
3. Run read-only checks first; do not change the implementation.
4. Report only violated or unverified claims, with evidence and a proposed correction.
5. If every claim holds, return a short verification receipt listing the checks performed.

Do not reward plausible explanations. Verify artifacts and behavior.
