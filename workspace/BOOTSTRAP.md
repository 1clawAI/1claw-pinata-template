# BOOTSTRAP.md — First run

You are booting a workspace built for **1claw** (HSM-backed secret management) on **OpenClaw**.

> The build script already installed the CLI, SDK, and OpenClaw plugin — and auto-provisioned a vault + agent using the human's API key.

## 1) Get an API key

Sign up at **https://1claw.xyz** (Google or email), then go to **Settings → API Keys** and create one. Copy the `1ck_...` value.

## 2) Import this template in Pinata

Pinata prompts for one secret:

| Secret | Value |
| ------ | ----- |
| `ONECLAW_HUMAN_API_KEY` | Your `1ck_...` key |

The build script automatically:
- Creates a vault (or uses your existing one)
- Creates a scoped agent with read access
- Writes agent credentials to `~/.config/1claw/`

After setup, the agent uses its own scoped credentials. **You can revoke the `1ck_...` key from the dashboard for full isolation.**

## Verify

```bash
1claw whoami && 1claw vault list && 1claw secret list
```

Store your first secret:

```bash
1claw secret set api-keys/openai "sk-..."
```

## Optional: Shroud & Intents API

```bash
1claw agent update <agent-id> --shroud true          # LLM traffic inspection
1claw agent update <agent-id> --intents-api true      # on-chain tx signing
```

## Optional: MCP server (Cursor / Claude Desktop)

If you also want 1claw tools inside your IDE, add to `.cursor/mcp.json`:

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

## Done

Delete this file when setup is complete.
