# BOOTSTRAP.md — First run

You are booting a workspace built for **1claw** (HSM-backed secret management) on **OpenClaw**.

> The build script already installed `@1claw/cli` and the `@1claw/openclaw-plugin`. The human just needs to enroll.

## 1) Sign up at 1claw.xyz

Go to **https://1claw.xyz** and create an account (Google or email).

## 2) Enroll the agent

In the chat, type:

```
/oneclaw-enroll
```

The plugin walks through enrollment: it creates a scoped agent under the human's account and writes credentials to the OpenClaw config. The human's personal API key never enters the agent's environment.

Alternatively, the human can enroll via CLI on the gateway host:

```bash
1claw login
1claw vault create my-vault && 1claw vault link <vault-id>
1claw agent create my-openclaw-agent
```

Then set the agent credentials in the OpenClaw plugin config or env vars:

```bash
export ONECLAW_AGENT_API_KEY="<ocv_...>"
export ONECLAW_AGENT_ID="<agent-uuid>"
export ONECLAW_VAULT_ID="<vault-uuid>"
```

## 3) Store your first secret

```bash
1claw secret set api-keys/openai "sk-..."
```

## Verify

```bash
/oneclaw
```

This shows connection status, vault info, and feature flags.

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
        "ONECLAW_AGENT_ID": "<agent-uuid>",
        "ONECLAW_AGENT_API_KEY": "<ocv_...>",
        "ONECLAW_VAULT_ID": "<vault-uuid>"
      }
    }
  }
}
```

## Done

Delete this file when setup is complete.
