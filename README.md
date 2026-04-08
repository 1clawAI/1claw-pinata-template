# OpenClaw workspace: 1claw (HSM-backed secret management for AI agents)

Pinata-style layout: repo root has **`manifest.json`** + this README; the OpenClaw home is **`workspace/`** (see [PinataCloud/agent-template](https://github.com/PinataCloud/agent-template)).

## Quick start

### 1. Get an API key from [1claw.xyz](https://1claw.xyz)

Sign up, then go to **Settings → API Keys** and create one. Copy the `1ck_...` value.

### 2. Import this repo in Pinata Agents

Pinata prompts for one secret:

| Secret | Value |
| ------ | ----- |
| `ONECLAW_HUMAN_API_KEY` | Your `1ck_...` key |

The build script auto-provisions a vault, a scoped agent, and writes credentials to CLI config. After setup you can revoke the `1ck_...` key from the dashboard — the agent uses its own credentials from here on.

### 3. Store secrets

```bash
1claw secret set api-keys/openai "sk-..."
```

Your agent fetches secrets at runtime — they never appear in context, logs, or memory.

## What's included

| Package | Purpose |
| ------- | ------- |
| [`@1claw/cli`](https://www.npmjs.com/package/@1claw/cli) | CLI for vaults, secrets, agents, policies, transactions, and CI/CD |
| [`@1claw/sdk`](https://www.npmjs.com/package/@1claw/sdk) | TypeScript SDK for programmatic vault access (also used by the bootstrap script) |
| [`@1claw/openclaw-plugin`](https://www.npmjs.com/package/@1claw/openclaw-plugin) | OpenClaw gateway plugin — tools, secret redaction, Shroud routing |
| [`@1claw/mcp`](https://www.npmjs.com/package/@1claw/mcp) | MCP server for Cursor, Claude Desktop, and GPT |

## Layout

```
manifest.json                  # Pinata Agents config
README.md
workspace/
  scripts/bootstrap.mjs        # One-key provisioning (runs at build time)
  AGENTS.md                    # Agent behavior rules
  SOUL.md                      # Agent personality
  BOOTSTRAP.md                 # First-run guide (2 steps)
  IDENTITY.md USER.md          # Identity + human preferences
  TOOLS.md HEARTBEAT.md        # Local env notes + periodic checks
  memory/                      # Session memory
  skills/1claw/SKILL.md        # Full 1claw skill reference
```

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
        "ONECLAW_AGENT_ID": "<from 1claw config get agent-id>",
        "ONECLAW_AGENT_API_KEY": "<from 1claw config get agent-api-key>",
        "ONECLAW_VAULT_ID": "<from 1claw config get default-vault>"
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
