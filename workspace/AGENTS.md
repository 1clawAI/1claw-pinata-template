# AGENTS.md — 1claw × OpenClaw workspace

This folder is the agent workspace. Treat it as home and keep secrets out of git.

## MCP-first principle

**Always use MCP tools (`oneclaw_*`) before falling back to the CLI or asking the human.**

You have `oneclaw_*` tools available right now — they are your primary interface to 1claw. The CLI is for the *human* on their own machine; MCP tools are for *you*.

### Decision order

1. **Can an MCP tool do it?** → Use the MCP tool. This covers secrets (CRUD, rotate), vaults (create, list), policies (`oneclaw_grant_access`), sharing, transactions, and content inspection.
2. **No MCP tool exists for it?** → Try the CLI via shell if the CLI is installed (check `TOOLS.md`).
3. **Neither works / requires human credentials?** → Ask the human, with a specific instruction (not a general "go to the dashboard").

### Common mistake to avoid

When an operation fails with 403 or "no policy", **do not** immediately tell the human to create a policy via the dashboard or CLI. First check whether you can fix it yourself:

- **`oneclaw_grant_access`** — grants vault access to a user or agent (you can grant yourself access on vaults you created via owner bypass, or grant other principals).
- **`oneclaw_create_vault`** → you automatically have owner access to vaults you create.
- If you truly cannot self-remediate (e.g. you need a policy on a vault you did not create and do not own), *then* ask the human — but be specific: give them the exact command or dashboard path.

### Quick MCP tool reference

| Need | MCP tool |
| ---- | -------- |
| Store a secret | `oneclaw_put_secret` |
| Read a secret | `oneclaw_get_secret` |
| List secrets | `oneclaw_list_secrets` |
| Delete a secret | `oneclaw_delete_secret` |
| Rotate a secret | `oneclaw_rotate_and_store` |
| Create a vault | `oneclaw_create_vault` |
| List vaults | `oneclaw_list_vaults` |
| Grant access (policy) | `oneclaw_grant_access` |
| Share a secret | `oneclaw_share_secret` |
| Submit transaction | `oneclaw_submit_transaction` |
| Sign transaction | `oneclaw_sign_transaction` |
| Simulate transaction | `oneclaw_simulate_transaction` |
| Inspect content | `oneclaw_inspect_content` |

## 1claw (secret management / Shroud / Intents API)

- When the agent needs **API keys, credentials, or other secrets**, use the `oneclaw_get_secret` MCP tool to fetch them at runtime.
- **Never paste secrets into chat.** Use `oneclaw_get_secret` or (on the human's machine) `1claw secret get <path>`.
- **Shroud:** when `shroud_enabled` is true on the agent, LLM traffic is automatically routed through the TEE proxy for inspection and redaction.
- **Intents API:** when `intents_api_enabled` is true, submit transaction intents via `oneclaw_submit_transaction`. Private keys never leave the HSM.
- **Security:** never ask the user to sign in to the 1claw dashboard in a browser you control. If dashboard or policy changes are required, tell them to do it on **their** device/browser. See the skill's Security section.

## Identity (do not guess)

- Always resolve `agent_id`, `org_id`, `created_by`, and active `vault_id` from **MCP tool output** (`/oneclaw`, `oneclaw_list_vaults`, etc.). Never assume, paraphrase, or hallucinate UUIDs.
- A zero UUID (`00000000-0000-0000-0000-000000000000`) is never valid. If you ever see one in a response or draft, stop and call the real tool again.
- Resolved IDs live at `workspace/.1claw/identity.env` after first-run bootstrap (see `BOOTSTRAP.md`). Treat that file as the source of truth for IDs only — it never contains the `ocv_` API key.

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

Remember: **MCP tools first**, CLI second, ask the human last. See the "MCP-first principle" section at the top of this file.

## Heartbeats

If you receive the default heartbeat prompt, read `HEARTBEAT.md` when present. If nothing needs attention, reply `HEARTBEAT_OK`. Keep `HEARTBEAT.md` small to limit token use.

## Make it yours

Add conventions and lessons learned here as this workspace evolves.
