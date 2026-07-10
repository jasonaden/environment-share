---
name: delegate-codex-computer-use
description: Delegate local application verification to Codex when work requires browser automation, simulators, app launching, screenshots, or independent runtime inspection. Use when asked to test a flow, verify UI behavior, inspect a running app, capture screenshots, or provide evidence about implemented behavior that static checks cannot establish.
---

# Delegate Codex Computer Use

Use Codex as a separate verification agent for real runtime interaction. Do not use this for ordinary code reading, typechecking, linting, or tests the invoking agent can run directly.

## Workflow

1. Define the exact flow, starting state, expected behavior, and evidence required.
2. Identify the application URL or launch command and any safe test credentials supplied by the user.
3. State forbidden side effects, including real purchases, messages, permission changes, or production data mutation.
4. Write the verification request to a prompt file.
5. Run `scripts/run-verification.sh <repo> <prompt-file> <artifact-directory>`.
6. Inspect the report and every screenshot or artifact.
7. Correlate runtime failures with the implementation before recommending a fix.
8. Report observed evidence separately from inference.

## Safety boundaries

- Ask before actions that could disrupt the user's environment beyond launching the requested app or browser.
- Do not use real accounts or sensitive data unless the user explicitly authorized that exact use.
- Stop at CAPTCHA, payment, credential, external-message, deployment, or destructive-operation boundaries.
- Do not claim success without evidence from the requested flow.

## Evidence contract

Require a Markdown report containing:

- environment and starting state;
- steps performed;
- expected versus observed behavior;
- screenshot paths and other artifacts;
- console or runtime errors;
- pass, fail, or blocked status;
- reproduction instructions for failures.
