# OpenClaw workspace: 1claw (HSM-backed secret management for AI agents)

A ready-to-import OpenClaw workspace for [Pinata Agents](https://pinata.cloud). Pinata-style layout: repo root has **`manifest.json`** + this README; the OpenClaw home is **`workspace/`** (see [PinataCloud/agent-template](https://github.com/PinataCloud/agent-template)).

Pinata runs your agent in the cloud. This template connects it to 1Claw so API keys and tokens live in an encrypted vault instead of Pinata environment variables alone. You enroll once, paste the `ocv_` key into Pinata settings, and the agent fetches secrets at runtime through the OpenClaw plugin.

The included `@1claw/openclaw-plugin` gives the agent vault tools, secret redaction, and optional Shroud routing. You manage policies and secrets from [1claw.co](https://1claw.co) or the CLI on your laptop.

## Quick start

### 1. Sign up at [1claw.co](https://1claw.co)

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

### 4. Verify and let the agent self-bootstrap

In the chat, type `/oneclaw`. The agent will:

1. Read back its **real agent ID** from the plugin (not a placeholder).
2. **Create a vault** for you if you don't have one yet, named `<agent-name>-shared`.
3. **Share that vault back with your 1claw account** (owner access) so you can see it at [1claw.co](https://1claw.co).
4. Write the resolved non-secret IDs to `workspace/.1claw/identity.env` so you and the agent can reference them later. The `ocv_` key is **never** written there — only in Pinata env vars.

Then store secrets via CLI on your machine or by asking the agent:

```bash
# Store a single secret
1claw secret set api-keys/openai "sk-..."

# Or import all secrets from a .env file at once
1claw import .env
```

> **Tip:** Run `1claw setup` to auto-configure Cursor, Claude Desktop, and other AI clients to use the 1Claw MCP server — no manual JSON editing required.

Your agent fetches secrets at runtime — they never appear in context, logs, or memory.

## What's included

| Package | Purpose |
| ------- | ------- |
| [`@1claw/cli`](https://www.npmjs.com/package/@1claw/cli) | CLI for vaults, secrets, agents, policies, transactions, automations, runtimes, and CI/CD |
| [`@1claw/sdk`](https://www.npmjs.com/package/@1claw/sdk) | TypeScript SDK for programmatic vault access, memory, automations, runtimes, and discovery |
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

## New in v0.56: Guardrails, HFA & Safe migration

### Human Factor Auth (treasury)

Configure wallet send/swap/export to require password or passkey in the [1claw dashboard](https://1claw.co/settings/security) → **Wallet human factor auth**. Passkey-only modes work in the treasury Send/Swap dialogs and in `@1claw/wallet-react`.

### Guardrail governance

Execution guardrails support Convention 6 shadow mode (`enforcement: log|enforce`). Org owners see shadow reports and revision history under **Settings → Security → Guardrails**. Agents can dry-run guardrail changes from the agent detail page (**Replay guardrails**).

### Safe migration (counterfactual)

Migrate an agent EOA to a counterfactual Safe from the dashboard (**Agents → agent → Migrate to Safe**) or via CLI:

```bash
1claw agent accounts list <agent-id>
1claw agent accounts migrate <agent-id> --chain ethereum
1claw safe module-registry ethereum
1claw safe sync-allowances
```

On-chain Safe deploy and Guard module broadcast remain **501** until external audit completes — counterfactual addresses are derived and used for signing paths today.

---

## New in v0.42: Automations, Runtimes, Memory & Discovery

### Automations

Schedule recurring tasks for your agent — cron-based secret rotation, health checks, or periodic API calls:

```bash
1claw agent update <agent-id> --automations true
```

In the chat, use the `oneclaw_create_automation` tool to define cron schedules. The agent can list and manage its own automations through the MCP tools.

### Runtimes

Deploy and manage agent runtime environments directly from 1Claw:

```bash
1claw agent update <agent-id> --runtime-hosting true
```

Runtimes provide managed compute for your agent with built-in secret injection, health monitoring, and auto-scaling.

### Agent Memory

Persistent vector memory lets your agent store and recall context across sessions:

```bash
# Store a memory
/oneclaw-memory store "User prefers JSON output format"

# Search memories
/oneclaw-memory search "output preferences"
```

Memory entries are stored encrypted in the vault with semantic search via embeddings.

### Agent Discovery

Publish your agent to the 1Claw directory so others can find and connect:

```bash
1claw agent update <agent-id> --discoverable true --listing-description "My helpful agent"
```

---

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

## Platform v0.59+ (connection-scoped plt_ routes)

Platform operators building on 1Claw use **`plt_` keys** with connection-scoped routes (not org-bound `/v1/agents/*`):

- **`GET .../signing-keys`** — agent on-chain addresses (not `wallet_address` from SIWE)
- **`PATCH .../agents/{id}`** — enable Intents without re-bootstrap
- **`GET .../portfolio`**, **`POST .../pending-approvals`**, **`GET/POST .../automations`**, memory CRUD — v0.59.4
- **`POST /v1/shroud/inspect-content`** — threat scan (MCP `inspect_content` parity)

Docs: [Platform API overview](https://docs.1claw.co/docs/platform-api/overview). SDK `@1claw/sdk@0.59.4`.

## Platform v0.56+ (HITL, HFA, Safe, guardrail governance)

This template pins **`@1claw/cli@0.56.2`** and **`@1claw/openclaw-plugin@0.56.2`**. Configure on agents at [1claw.co](https://1claw.co):

- **Graduated HITL** — Intents API txs/sign/execute may return `202 awaiting_approval`.
- **Guardrail governance** — Shadow/enforce execution guardrails; widening guardrails requires approval.
- **Safe foundation** — `1claw agent accounts list|migrate`, `1claw safe module-registry`.
- **Human Factor Auth** — Human treasury flows only (`@1claw/wallet-react`); agents use guardrails + HITL.

## OpenClaw

Point `agents.defaults.workspace` at **`…/workspace`** (this repo's `workspace` folder), not the repo root.

## Links

- [1claw dashboard](https://1claw.co) · [Docs](https://docs.1claw.co) · [OpenClaw docs](https://docs.openclaw.ai)

## License

MIT — comply with 1claw terms for CLI/APIs.
