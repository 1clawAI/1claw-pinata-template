# 1claw — HSM-backed secret management for AI agents

> **Version:** 0.2.0
> **Requires:** `bins: ["1claw"]`
> **Packages:** `@1claw/cli@0.13.0` · `@1claw/sdk@0.17.0` · `@1claw/mcp@0.17.0` · `@1claw/openclaw-plugin@0.2.0`

## What 1claw does

1claw is a Cloud HSM secrets manager for humans and AI agents. It provides three pillars:

1. **Vault** — Store API keys, tokens, and credentials encrypted by keys that never leave the HSM. Grant agents scoped, audited, revocable access with short-lived JWTs.
2. **Shroud** — A TEE (Trusted Execution Environment) proxy that sits between your agent and LLM providers. Inspects every request/response for prompt injection, PII, command injection, social engineering, and more.
3. **Intents API** — Sign and broadcast on-chain transactions without the agent ever holding private keys. Keys stay in the HSM; the agent submits intent, the infrastructure signs.

**Dashboard:** https://1claw.xyz
**Docs:** https://docs.1claw.xyz
**API:** https://api.1claw.xyz

---

## CLI reference (`@1claw/cli`)

The CLI is the primary interface for managing vaults, secrets, agents, policies, and transactions.

### Authentication

```bash
1claw login                    # Browser-based login (opens 1claw.xyz/cli/verify)
1claw login --email            # Email/password login (supports MFA)
1claw logout                   # Clear stored credentials
1claw whoami                   # Show current user info
```

For CI/CD (non-interactive), set `ONECLAW_TOKEN` or `ONECLAW_API_KEY` as environment variables.

### Vaults

```bash
1claw vault list               # List all vaults
1claw vault create <name>      # Create a vault
1claw vault get <id>           # Get vault details
1claw vault delete <id>        # Delete a vault
1claw vault link <id>          # Set default vault for this machine
1claw vault unlink             # Remove default vault
```

### Secrets

```bash
1claw secret list                              # List secrets (metadata only)
1claw secret list --prefix api-keys/           # Filter by prefix
1claw secret get <path>                        # Fetch decrypted value
1claw secret get <path> --quiet                # Raw value only (for piping)
1claw secret set <path> <value>                # Create/update a secret
1claw secret set <path> --type password        # With explicit type
echo "sk_live_..." | 1claw secret set <path> --stdin  # From stdin
1claw secret delete <path>                     # Soft-delete
1claw secret rotate <path> <new-value>         # New version
1claw secret describe <path>                   # Metadata without value
```

### Agents

```bash
1claw agent list                               # List agents
1claw agent create <name>                      # Create agent (default: api_key auth)
1claw agent get <id>                           # Agent details + SSH public key
1claw agent update <id> --shroud true          # Enable Shroud LLM proxy
1claw agent update <id> --intents-api true     # Enable Intents API
1claw agent delete <id>                        # Delete an agent
1claw agent token <id>                         # Generate agent JWT
1claw agent enroll <name> --email <email>      # Self-enroll (no auth needed)
```

### Transactions (Intents API)

```bash
1claw agent tx submit <agent-id> \
  --to 0xRecipient --value 0.01 --chain sepolia        # Sign + broadcast
1claw agent tx submit <agent-id> \
  --to 0xRecipient --value 0.01 --chain sepolia \
  --simulate                                            # Simulate first
1claw agent tx sign <agent-id> \
  --to 0xRecipient --value 0.01 --chain sepolia         # Sign only
1claw agent tx list <agent-id>                          # List recent txs
1claw agent tx get <agent-id> <tx-id>                   # Get tx details
```

### Environment (CI/CD)

```bash
1claw env pull                                 # Pull secrets as .env format
1claw env pull --format json                   # As JSON
1claw env pull --format shell                  # As export statements
1claw env pull -o .env.local                   # Write to file
1claw env push .env                            # Push .env file to vault
1claw env run -- npm start                     # Run with secrets injected
```

### Policies

```bash
1claw policy list                              # List policies
1claw policy create \
  --principal-type agent \
  --principal-id <uuid> \
  --path "api-keys/*" \
  --permissions read,write                     # Create a policy
1claw policy delete <id>                       # Remove a policy
```

### Sharing

```bash
1claw share create <secret-id> --link          # Open share link
1claw share create <secret-id> --to agent:<id> # Share with an agent
1claw share list                               # List outbound shares
1claw share list --inbound                     # List inbound shares
1claw share accept <id>                        # Accept a share
1claw share revoke <id>                        # Revoke a share
```

### Audit

```bash
1claw audit list                               # Recent audit events
1claw audit list --vault <id>                  # Filter by vault
1claw audit list --action secret.read          # Filter by action
```

### Billing

```bash
1claw billing status                           # Plan, usage, limits
1claw billing credits                          # Credit balance
1claw billing usage                            # Detailed usage table
```

---

## MCP tools (`@1claw/mcp`)

When the MCP server is configured, the agent gets these tools:

| Tool | Description |
| ---- | ----------- |
| `list_secrets` | List all secrets (metadata only — never values) |
| `get_secret` | Fetch the decrypted value of a secret by path |
| `put_secret` | Create or update a secret |
| `delete_secret` | Soft-delete a secret |
| `describe_secret` | Get metadata without the value |
| `rotate_and_store` | Store a new version of an existing secret |
| `get_env_bundle` | Fetch an env_bundle secret parsed as KEY=VALUE JSON |
| `create_vault` | Create a new vault |
| `list_vaults` | List accessible vaults |
| `grant_access` | Share a vault with a user or agent |
| `share_secret` | Share a secret via link, user ID, or agent ID |
| `simulate_transaction` | Simulate a transaction via Tenderly |
| `submit_transaction` | Sign and broadcast a transaction intent |
| `sign_transaction` | Sign only (no broadcast) |
| `list_transactions` | List transaction intents |
| `get_transaction` | Get transaction details |
| `inspect_content` | Analyze text for prompt injection, PII, threats (works without vault credentials) |

### MCP setup (stdio mode)

Environment variables:

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `ONECLAW_AGENT_ID` | Yes | Agent UUID from the dashboard |
| `ONECLAW_AGENT_API_KEY` | Yes | Agent API key (`ocv_...`) |
| `ONECLAW_VAULT_ID` | Yes | UUID of the vault to operate on |
| `ONECLAW_BASE_URL` | No | Default: `https://api.1claw.xyz` |
| `ONECLAW_LOCAL_ONLY` | No | Set `true` for security-only mode (only `inspect_content`) |

### Local-only mode

For security inspection without a 1claw account:

```json
{
  "mcpServers": {
    "1claw": {
      "command": "npx",
      "args": ["-y", "@1claw/mcp"],
      "env": {
        "ONECLAW_LOCAL_ONLY": "true"
      }
    }
  }
}
```

---

## OpenClaw plugin (`@1claw/openclaw-plugin`)

The plugin registers 13 tools with the OpenClaw gateway under the `oneclaw_` prefix (e.g. `oneclaw_list_secrets`, `oneclaw_get_secret`).

### Features (all toggleable)

| Feature | Default | Description |
| ------- | ------- | ----------- |
| `tools` | on | Register vault/secret/tx tools |
| `secretRedaction` | on | Scan outbound messages and redact leaked secret values |
| `secretInjection` | off | Replace `{{1claw:path/to/secret}}` placeholders at prompt time |
| `shroudRouting` | off | Route LLM traffic through Shroud TEE |
| `keyRotationMonitor` | off | Background warnings for secrets expiring within 7 days |
| `slashCommands` | off | `/oneclaw`, `/oneclaw-list`, `/oneclaw-rotate` |

### Plugin config

```json5
{
  plugins: {
    entries: {
      "1claw": {
        enabled: true,
        config: {
          apiKey: "ocv_...",
          // agentId, vaultId, baseUrl, shroudUrl optional
          // features: { tools: true, secretRedaction: true, ... }
        }
      }
    }
  }
}
```

Environment fallback: `ONECLAW_AGENT_API_KEY`, `ONECLAW_AGENT_ID`, `ONECLAW_VAULT_ID`, `ONECLAW_BASE_URL`, `ONECLAW_SHROUD_URL`.

### Slash commands

| Command | Description |
| ------- | ----------- |
| `/oneclaw` | Connection status, vault info, token TTL, features |
| `/oneclaw-list` | List secret paths (optional prefix arg) |
| `/oneclaw-rotate` | Rotate a secret: `/oneclaw-rotate <path>` |

---

## SDK reference (`@1claw/sdk`)

For programmatic access in TypeScript/JavaScript:

```typescript
import { createClient } from "@1claw/sdk";

const client = createClient({
  baseUrl: "https://api.1claw.xyz",
  apiKey: "ocv_...",
  agentId: "agent-uuid",
});

// List secrets
const secrets = await client.secrets.list("vault-id");

// Get a secret
const secret = await client.secrets.get("vault-id", "api-keys/stripe");
console.log(secret.data?.value);

// Store a secret
await client.secrets.set("vault-id", "api-keys/new-key", "value", {
  type: "api_key",
});

// Submit a transaction
const tx = await client.agents.submitTransaction("agent-id", {
  to: "0x...",
  value: "0.01",
  chain: "base",
});
```

### SDK resources

| Resource | Methods |
| -------- | ------- |
| `client.vault` | `create`, `get`, `list`, `delete` |
| `client.secrets` | `set`, `get`, `delete`, `list`, `rotate` |
| `client.agents` | `create`, `get`, `list`, `update`, `delete`, `submitTransaction`, `signTransaction`, `simulateTransaction` |
| `client.access` | `grantHuman`, `grantAgent`, `update`, `revoke`, `listGrants` |
| `client.sharing` | `create`, `access`, `listOutbound`, `listInbound`, `accept`, `decline`, `revoke` |
| `client.audit` | `query` |
| `client.auth` | `login`, `signup`, `agentToken`, `google`, `logout` |
| `client.billing` | `usage`, `history` |
| `client.x402` | `getPaymentRequirement`, `pay`, `verifyReceipt`, `withPayment` |

---

## Security

### Secret handling rules

1. **Never paste secrets into chat.** Use the CLI, MCP tools, or SDK to fetch them.
2. **Fetch → use → forget.** Do not store secret values in memory files, summaries, or logs.
3. **Never echo secret values** in shell output when others might see it. Use `--quiet` for piping.
4. **Rotate compromised secrets immediately**: `1claw secret rotate <path> <new-value>`.

### Dashboard security

- Never ask the user to sign in to the 1claw dashboard in a browser you control.
- If dashboard changes are needed (policies, agent config, Shroud settings), instruct the user to do it on **their own device/browser** at https://1claw.xyz.
- Never attempt to automate dashboard login flows.

### Shroud (LLM traffic inspection)

When `shroud_enabled` is true on the agent:

- All LLM traffic is routed through `https://shroud.1claw.xyz`
- 6-layer threat detection: Unicode normalization, command injection, social engineering, encoding obfuscation, network threats, filesystem protection
- PII is automatically redacted before reaching the LLM provider
- Per-agent config controls providers, models, token caps, blocked domains

### Intents API (transaction signing)

When `intents_api_enabled` is true:

- Agent submits transaction **intents** — the infrastructure signs with HSM-held keys
- Per-agent guardrails: address allowlists, value caps, chain restrictions, daily limits
- Tenderly simulation available before signing (`--simulate`)
- Every transaction is audit-logged with full calldata
- Idempotency keys prevent replay attacks

### MCP security pipeline

The MCP server runs an inspection pipeline on every tool call:

**Input inspection:** Unicode normalization → threat detection → PII detection → exfiltration protection
**Output inspection:** Threat detection → PII detection → secret redaction

Environment variables to configure:

| Variable | Default | Description |
| -------- | ------- | ----------- |
| `ONECLAW_MCP_SECURITY_ENABLED` | `true` | Master switch |
| `ONECLAW_MCP_SANITIZATION_MODE` | `block` | `block`, `surgical`, or `log_only` |
| `ONECLAW_MCP_REDACT_SECRETS` | `true` | Redact known secret values from outputs |
| `ONECLAW_MCP_PII_DETECTION` | `true` | Detect PII patterns |
| `ONECLAW_MCP_EXFIL_PROTECTION` | `warn` | `block`, `warn`, or `off` |

---

## Common workflows

### Store and retrieve an API key

```bash
1claw secret set api-keys/stripe "sk_live_..."
1claw secret get api-keys/stripe
```

### Inject secrets into a running process

```bash
1claw env run -- node server.js
```

### Share a secret with another agent

```bash
1claw share create <secret-id> --to agent:<agent-id>
```

### Create a policy for read-only access

```bash
1claw policy create \
  --principal-type agent \
  --principal-id <agent-uuid> \
  --path "api-keys/*" \
  --permissions read
```

### Simulate then submit a transaction

```bash
1claw agent tx submit <agent-id> \
  --to 0xRecipient \
  --value 0.01 \
  --chain base \
  --simulate
```

### Check audit trail

```bash
1claw audit list --action secret.read
```

---

## Connecting to the 1claw dashboard

The fastest path from zero to a working agent:

1. **Sign up** at https://1claw.xyz (Google SSO or email)
2. **Create a vault** in the dashboard or via `1claw vault create`
3. **Register an agent** — the dashboard shows agent ID and API key once
4. **Store secrets** — paste or upload via dashboard, or use `1claw secret set`
5. **Set policies** — define which paths the agent can read/write
6. **Configure MCP** — add the agent credentials to your MCP config
7. **(Optional) Enable Shroud** — toggle in the agent settings
8. **(Optional) Enable Intents API** — toggle and set guardrails

The agent is now ready to fetch secrets at runtime, with full audit trail and revocable access.

---

## Troubleshooting

| Problem | Fix |
| ------- | --- |
| `1claw whoami` fails | Run `1claw login` to re-authenticate |
| `ONECLAW_AGENT_API_KEY` not working | Verify the key hasn't been rotated; regenerate with `1claw agent create` |
| MCP tools not appearing | Check env vars are set; restart the MCP server |
| Secret not found | Verify path with `1claw secret list --prefix <prefix>` |
| Transaction rejected | Check guardrails: `1claw agent get <id>` shows allowed chains, limits |
| Shroud blocking requests | Check `shroud_config` in dashboard; adjust thresholds or allowlists |

---

## Links

- **Dashboard:** https://1claw.xyz
- **Docs:** https://docs.1claw.xyz
- **API:** https://api.1claw.xyz
- **MCP:** https://mcp.1claw.xyz
- **Shroud:** https://shroud.1claw.xyz
- **npm — CLI:** https://www.npmjs.com/package/@1claw/cli
- **npm — SDK:** https://www.npmjs.com/package/@1claw/sdk
- **npm — MCP:** https://www.npmjs.com/package/@1claw/mcp
- **npm — OpenClaw Plugin:** https://www.npmjs.com/package/@1claw/openclaw-plugin
