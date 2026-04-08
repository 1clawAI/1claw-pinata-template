# BOOTSTRAP.md — First run

You are booting a workspace built for **1claw** (HSM-backed secret management) on **OpenClaw**.

> The build script already installed `@1claw/cli` and `@1claw/openclaw-plugin`. The human just needs to connect their 1claw account.

## 1) Sign up & create a vault + agent

Go to **https://1claw.xyz**, sign up (Google or email), then:

```bash
1claw login                          # opens browser — confirm the code
1claw vault create my-vault          # creates a vault, prints the vault ID
1claw vault link <vault-id>          # sets it as default on this machine
1claw agent create my-openclaw-agent # prints agent ID + API key (save both!)
```

Or do it all from the **dashboard UI** — the IDs are on each detail page.

## 2) Add credentials

If Pinata prompted for secrets during import, you're done — skip this step.

Otherwise set these three env vars (shell profile, `.env`, or your hosting platform):

```bash
export ONECLAW_AGENT_ID="<agent-uuid>"
export ONECLAW_AGENT_API_KEY="<ocv_...>"
export ONECLAW_VAULT_ID="<vault-uuid>"
```

## 3) Verify

```bash
1claw whoami && 1claw vault list && 1claw secret list
```

If all three succeed, the workspace is ready. Store your first secret:

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
