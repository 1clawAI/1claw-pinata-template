# OpenClaw workspace: 1claw (HSM-backed secret management for AI agents)

Pinata-style layout: repo root has **`manifest.json`** + this README; the OpenClaw home is **`workspace/`** (see [PinataCloud/agent-template](https://github.com/PinataCloud/agent-template)).

## Quick start

### 1. Sign up at [1claw.xyz](https://1claw.xyz) and create a vault + agent

```bash
npm install -g @1claw/cli@0.13.0
1claw login
1claw vault create my-vault && 1claw vault link <vault-id>
1claw agent create my-openclaw-agent   # save the agent ID + API key
```

### 2. Import this repo in Pinata Agents

Pinata will prompt for three secrets (defined in `manifest.json`):

| Secret | Where to find it |
| ------ | ---------------- |
| `ONECLAW_AGENT_ID` | Agent UUID from `1claw agent list` or dashboard |
| `ONECLAW_AGENT_API_KEY` | `ocv_...` shown once at agent creation |
| `ONECLAW_VAULT_ID` | Vault UUID from `1claw vault list` or dashboard |

The build script installs `@1claw/cli` and `@1claw/openclaw-plugin` automatically.

### 3. Start using secrets

```bash
1claw secret set api-keys/openai "sk-..."   # store a secret
```

Your agent can now fetch secrets at runtime — they never appear in context, logs, or memory.

## What's included

| Package | Purpose |
| ------- | ------- |
| [`@1claw/cli`](https://www.npmjs.com/package/@1claw/cli) | CLI for vaults, secrets, agents, policies, transactions, and CI/CD |
| [`@1claw/openclaw-plugin`](https://www.npmjs.com/package/@1claw/openclaw-plugin) | OpenClaw gateway plugin — tools, secret redaction, Shroud routing |
| [`@1claw/mcp`](https://www.npmjs.com/package/@1claw/mcp) | MCP server for Cursor, Claude Desktop, and GPT |
| [`@1claw/sdk`](https://www.npmjs.com/package/@1claw/sdk) | TypeScript SDK for programmatic vault access |

## Layout

```
manifest.json              # Pinata Agents config
README.md
workspace/
  AGENTS.md                # Agent behavior rules
  SOUL.md                  # Agent personality
  BOOTSTRAP.md             # First-run setup (3 steps)
  IDENTITY.md USER.md      # Identity + human preferences
  TOOLS.md HEARTBEAT.md    # Local env notes + periodic checks
  memory/                  # Session memory
  skills/1claw/SKILL.md    # Full 1claw skill reference
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
        "ONECLAW_AGENT_ID": "<agent-uuid>",
        "ONECLAW_AGENT_API_KEY": "<ocv_...>",
        "ONECLAW_VAULT_ID": "<vault-uuid>"
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
