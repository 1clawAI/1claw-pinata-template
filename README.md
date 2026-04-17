# OpenClaw workspace: 1claw (HSM-backed secret management for AI agents)

Pinata-style layout: repo root has **`manifest.json`** + this README; the OpenClaw home is **`workspace/`** (see [PinataCloud/agent-template](https://github.com/PinataCloud/agent-template)).

## Quick start

### 1. Sign up at [1claw.xyz](https://1claw.xyz)

Create an account (Google or email) and create a vault.

### 2. Import this repo in Pinata Agents

Pinata will prompt for `ONECLAW_AGENT_API_KEY` during import. Leave it blank for now — you'll get the key in step 3.

### 3. Enroll the agent

After pairing, type in the chat using **`@1claw/openclaw-plugin`** (see `skills/1claw/SKILL.md` for exact slash command):

- **Email + name** (approval email is sent, and the chat also shows an **approval URL** if the server returns one — use it if mail is delayed or in spam):

  ```
  /oneclaw-enroll you@example.com my-agent
  ```

- **Name only** (no email on file yet): the response includes a **unique approval URL**. Open it in a browser while signed in to your 1Claw account to approve adding the agent to your org.

  ```
  /oneclaw-enroll my-agent
  ```

After you approve, the 1claw dashboard approval page shows your **API key** (copy copies the key itself). Add it in **Pinata → your agent → Settings → Environment Variables** as **`ONECLAW_AGENT_API_KEY`** (value = the `ocv_...` string only). Approving in the browser alone does not inject the key into Pinata — you must paste it there and **restart** the agent.

A follow-up email may also include the key when you enrolled with an email.

### 4. Verify

In the chat, type `/oneclaw` to verify connection. Then store secrets via CLI on your machine:

```bash
1claw secret set api-keys/openai "sk-..."
```

Your agent fetches secrets at runtime — they never appear in context, logs, or memory.

## What's included

| Package | Purpose |
| ------- | ------- |
| [`@1claw/cli`](https://www.npmjs.com/package/@1claw/cli) | CLI for vaults, secrets, agents, policies, transactions, and CI/CD |
| [`@1claw/sdk`](https://www.npmjs.com/package/@1claw/sdk) | TypeScript SDK for programmatic vault access |
| [`@1claw/openclaw-plugin`](https://www.npmjs.com/package/@1claw/openclaw-plugin) | OpenClaw gateway plugin — tools, secret redaction, Shroud routing |
| [`@1claw/mcp`](https://www.npmjs.com/package/@1claw/mcp) | MCP server for Cursor, Claude Desktop, and GPT |

## Layout

```
manifest.json              # Pinata Agents config
README.md
workspace/
  AGENTS.md                # Agent behavior rules
  SOUL.md                  # Agent personality
  BOOTSTRAP.md             # First-run guide
  IDENTITY.md USER.md      # Identity + human preferences
  TOOLS.md HEARTBEAT.md    # Local env notes + periodic checks
  memory/                  # Session memory
  skills/1claw/SKILL.md    # Full 1claw skill reference
```

## Environment variables

**In Pinata, only one value is a true secret: the agent API key.** Agent ID and vault ID are public identifiers (UUIDs), not credentials — the OpenClaw plugin resolves them from the API key and picks a sensible default vault (including the vault from `oneclaw_create_vault` in the same session). You do **not** need to paste vault or agent UUIDs into Pinata unless you are pinning a specific vault across multiple vaults.

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `ONECLAW_AGENT_API_KEY` | **Yes** | Agent API key (`ocv_...`) from enrollment approval — **only this must be stored as a secret** |
| `ONECLAW_AGENT_ID` | No | Optional; auto-resolved from the API key via token exchange |
| `ONECLAW_VAULT_ID` | No | Optional; only if you must pin one vault when several exist — **not sensitive** |

## Optional: Shroud & Intents API

```bash
1claw agent update <agent-id> --shroud true          # TEE LLM proxy
1claw agent update <agent-id> --intents-api true      # HSM transaction signing
```

### OpenClaw + Shroud sidecar (local, lowest friction)

The [CLI wizard “Custom provider”](https://docs.openclaw.ai/start/wizard-cli-reference#custom-provider) flow is for **generic** OpenAI-compatible URLs (paste base URL + API key). You **do not** need it for 1Claw + Shroud: the [`@1claw/openclaw-plugin`](https://www.npmjs.com/package/@1claw/openclaw-plugin) sends LLM traffic to Shroud (or your sidecar) via a **`before_model_resolve` hook** once Shroud is enabled on the agent.

**Recommended path (same `ocv_` key as Pinata; no wizard “custom provider” step):**

1. **Run the [Shroud sidecar](https://github.com/1clawAI/1claw-shroud-sidecar)** on the same machine as the OpenClaw gateway (binary or Docker), with the **same** agent credentials you use in Pinata:
   - `ONECLAW_AGENT_ID` + `ONECLAW_AGENT_API_KEY`, or bootstrap with `ONECLAW_MASTER_API_KEY`.
   - Default listen: `http://127.0.0.1:8080`.
2. **Point the plugin at the sidecar** (env is enough for the gateway process):
   - `ONECLAW_SHROUD_URL=http://127.0.0.1:8080`
3. **Turn on Shroud routing in plugin config** (it is **off** by default) **and** enable Shroud on the agent (API):
   - In `~/.openclaw/openclaw.json` under `plugins.entries.1claw.config`, set `features.shroudRouting` to `true` (or set the equivalent in Pinata env if your host injects JSON).
   - Keep `1claw agent update <id> --shroud true` so the agent profile has `shroud_enabled` (the hook checks this).
4. Restart the OpenClaw gateway.

That matches how the plugin works today: the Shroud routing hook in [`1claw-openclaw-plugin`](https://github.com/1clawAI/1claw-openclaw-plugin) sets `providerOverride` to `shroudUrl` when the agent has Shroud enabled — so the **model base URL in the wizard** is not where you wire the sidecar; **`shroudUrl` + `shroudRouting`** is.

**When *would* you use “Custom provider” with the sidecar?** If you are **not** using the plugin hook and want the gateway’s default OpenAI client to talk to `http://127.0.0.1:8080` directly: set compatibility to **OpenAI**, base URL **`http://127.0.0.1:8080`**, and use a real **provider API key** in the wizard if you rely on **BYOK** (the sidecar forwards `Authorization: Bearer …` to Shroud as `X-Shroud-Api-Key`). You still must run the sidecar with **1Claw agent** env vars so it can authenticate to Shroud. For vault-only keys, prefer the plugin path above instead of duplicating config in “Custom provider.”

## Optional: MCP server (Cursor / Claude Desktop)

```json
{
  "mcpServers": {
    "1claw": {
      "command": "npx",
      "args": ["-y", "@1claw/mcp"],
      "env": {
        "ONECLAW_AGENT_API_KEY": "<ocv_...>"
      }
    }
  }
}
```

## OpenClaw

Point `agents.defaults.workspace` at **`…/workspace`** (this repo's `workspace` folder), not the repo root.

## Links

- [1claw dashboard](https://1claw.xyz) · [Docs](https://docs.1claw.xyz) · [OpenClaw docs](https://docs.openclaw.ai)

## License

MIT — comply with 1claw terms for CLI/APIs.
