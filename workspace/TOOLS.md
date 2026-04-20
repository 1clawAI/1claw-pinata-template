# TOOLS.md — Local notes for skills

Skills describe *how* tools work. This file is for **your** environment: IDs, URLs, policies, and reminders.

## 1claw

- CLI install: `npm install -g @1claw/cli@0.15.1` (provisioned automatically by `manifest.json`'s build script)
- OpenClaw plugin: `openclaw plugins install @1claw/openclaw-plugin@0.3.1` (also auto-installed at build time; this is what registers `/oneclaw`, `/oneclaw-enroll`, `/oneclaw-bootstrap`, and the `oneclaw_*` tools)
- After login: `1claw whoami` should show the authenticated user.
- After vault link: `1claw vault list` should show linked vault.
- Dashboard: https://1claw.xyz
- API: https://api.1claw.xyz
- MCP: https://mcp.1claw.xyz
- Shroud: https://shroud.1claw.xyz

### Agent credentials

Fill these in after `BOOTSTRAP.md` setup:

| Key | Value |
| --- | ----- |
| Agent ID | |
| Vault ID | |
| Shroud enabled | |
| Intents API enabled | |

### Secrets you manage

List secrets here so future sessions know what's available:

| Path | Type | Notes |
| ---- | ---- | ----- |
| | | |

### Policies

| Principal | Path pattern | Permissions | Notes |
| --------- | ------------ | ----------- | ----- |
| | | | |

### Transaction guardrails (if Intents API enabled)

- Allowed chains:
- Max value per tx:
- Daily limit:
- To-address allowlist:

---

Add other tools, SSH hosts, or anything else your skills need, same as any OpenClaw workspace.
