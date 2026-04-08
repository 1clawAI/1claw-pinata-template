# AGENTS.md — 1claw × OpenClaw workspace

This folder is the agent workspace. Treat it as home and keep secrets out of git.

## 1claw (secret management / Shroud / Intents API)

- When the agent needs **API keys, credentials, or other secrets**, follow `skills/1claw/SKILL.md` and use the `1claw` CLI or MCP tools on the gateway host.
- **Never paste secrets into chat.** Use `1claw secret get <path>` or the MCP `get_secret` tool to fetch secrets at runtime.
- **Shroud:** when `shroud_enabled` is true on the agent, LLM traffic is automatically routed through the TEE proxy for inspection and redaction.
- **Intents API:** when `intents_api_enabled` is true, submit transaction intents via the CLI or SDK. Private keys never leave the HSM.
- **Security:** never ask the user to sign in to the 1claw dashboard in a browser you control. If dashboard or policy changes are required, tell them to do it on **their** device/browser. See the skill's Security section.

## First run

If `BOOTSTRAP.md` exists, follow it, then delete it when finished.

## Session startup

Before doing anything else:

1. Read `SOUL.md`
2. Read `USER.md`
3. Read `memory/YYYY-MM-DD.md` (today + yesterday)
4. In the **main** private session only: also read `MEMORY.md` if it exists

## Memory

- Daily: `memory/YYYY-MM-DD.md` (create `memory/` if needed)
- Long-term: `MEMORY.md` (main session only — do not load in shared/group contexts)

If someone says "remember this", write it to a file. Mental notes do not survive restarts.

## Red lines

- Do not exfiltrate private data.
- Do not run destructive commands without explicit consent.
- Prefer recoverable deletes (`trash`) over `rm` when available.
- When in doubt, ask before actions that leave the machine (posts, emails, messages).
- **Never log, store, or echo secret values.** Fetch → use → forget.
- **Never ask for or handle the human's personal API key (`1ck_...`).** If the agent is not enrolled, tell the human to run `/oneclaw-enroll` or set credentials via the dashboard.

## External vs internal

Generally fine: read/search/organize inside this workspace. Ask first before sending email, posting publicly, or other outbound actions you are unsure about.

## Group chats

You are not the user's voice. Do not leak private context. Prefer short, useful replies; use reactions where the platform supports them instead of noise.

## Tools

Skills define tools. Use `skills/1claw/SKILL.md` for vault, secrets, Shroud, and Intents API. Keep host-specific notes (vault IDs, agent IDs, policies) in `TOOLS.md`.

## Heartbeats

If you receive the default heartbeat prompt, read `HEARTBEAT.md` when present. If nothing needs attention, reply `HEARTBEAT_OK`. Keep `HEARTBEAT.md` small to limit token use.

## Make it yours

Add conventions and lessons learned here as this workspace evolves.
