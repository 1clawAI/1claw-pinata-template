# OpenClaw workspace: 1claw (HSM-backed secret management for AI agents)

Pinata-style layout: repo root has **`manifest.json`** + this README; the OpenClaw home is **`workspace/`** (see [PinataCloud/agent-template](https://github.com/PinataCloud/agent-template)).

## Quick start

### 1. Sign up at [1claw.xyz](https://1claw.xyz)

Create an account (Google or email) and create a vault.

### 2. Import this repo in Pinata Agents

Pinata will prompt for `ONECLAW_AGENT_API_KEY` during import. Leave it blank for now — you'll get the key in step 3.

### 3. Enroll the agent

After pairing, type in the chat:

```
/oneclaw-enroll you@example.com my-agent
```

Check your email and approve the enrollment. The approval page (and a follow-up email) will show:

```
ONECLAW_AGENT_API_KEY=ocv_...
```

Paste that into your **Pinata agent Settings → Environment Variables** and restart. That's the only env var you need — agent ID and vault are auto-discovered from the key.

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

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `ONECLAW_AGENT_API_KEY` | **Yes** | Agent API key (`ocv_...`) from enrollment approval |
| `ONECLAW_AGENT_ID` | No | Auto-discovered from the API key |
| `ONECLAW_VAULT_ID` | No | Auto-discovered from the token exchange |

## Optional: Shroud & Intents API

```bash
1claw agent update <agent-id> --shroud true          # TEE LLM proxy
1claw agent update <agent-id> --intents-api true      # HSM transaction signing
```

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
