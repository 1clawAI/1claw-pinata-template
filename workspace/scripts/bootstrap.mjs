#!/usr/bin/env node

/**
 * One-key bootstrap: provisions a vault + agent using the human's API key,
 * writes agent-scoped credentials to CLI config, then discards the human key.
 *
 * Runs once during `scripts.build` in manifest.json.
 * The human API key (ONECLAW_HUMAN_API_KEY) is never stored or accessible
 * to the agent after this script completes.
 */

import { createClient } from "@1claw/sdk";
import { execSync } from "node:child_process";

const HUMAN_KEY = process.env.ONECLAW_HUMAN_API_KEY;

if (!HUMAN_KEY) {
  console.log(
    "\n⏭  ONECLAW_HUMAN_API_KEY not set — skipping auto-provisioning.",
  );
  console.log(
    "   You can set up manually: see workspace/BOOTSTRAP.md\n",
  );
  process.exit(0);
}

const BASE_URL = process.env.ONECLAW_BASE_URL || "https://api.1claw.xyz";

async function main() {
  console.log("\n🔐 1claw bootstrap: provisioning vault + agent...\n");

  const client = createClient({ baseUrl: BASE_URL, apiKey: HUMAN_KEY });

  // --- Vault ---
  let vaultId;
  const vaults = await client.vault.list();
  if (vaults.error) {
    console.error("Failed to list vaults:", vaults.error.message);
    process.exit(1);
  }

  if (vaults.data?.vaults?.length) {
    vaultId = vaults.data.vaults[0].id;
    console.log(`   Using existing vault: ${vaultId}`);
  } else {
    const created = await client.vault.create({ name: "openclaw-vault" });
    if (created.error) {
      console.error("Failed to create vault:", created.error.message);
      process.exit(1);
    }
    vaultId = created.data.id;
    console.log(`   Created vault: ${vaultId}`);
  }

  // --- Agent ---
  const agent = await client.agents.create({
    name: "openclaw-agent",
    scopes: ["vault:read"],
  });
  if (agent.error) {
    console.error("Failed to create agent:", agent.error.message);
    process.exit(1);
  }

  const agentId = agent.data.agent.id;
  const agentApiKey = agent.data.api_key;
  console.log(`   Created agent: ${agentId}`);

  // --- Grant read access ---
  const grant = await client.access.grantAgent(vaultId, agentId, ["read"]);
  if (grant.error) {
    console.error("Failed to grant access:", grant.error.message);
    process.exit(1);
  }
  console.log("   Granted agent read access to vault");

  // --- Write to CLI config ---
  const cliSet = (key, value) =>
    execSync(`1claw config set ${key} "${value}"`, { stdio: "pipe" });

  try {
    cliSet("agent-id", agentId);
    cliSet("agent-api-key", agentApiKey);
    cliSet("default-vault", vaultId);
    console.log("   Wrote credentials to ~/.config/1claw/\n");
  } catch {
    console.log("   ⚠ Could not write to CLI config (1claw CLI may not be on PATH).");
    console.log("   Set these env vars manually:");
    console.log(`     ONECLAW_AGENT_ID=${agentId}`);
    console.log(`     ONECLAW_AGENT_API_KEY=${agentApiKey}`);
    console.log(`     ONECLAW_VAULT_ID=${vaultId}\n`);
  }

  // --- Discard human key from this process ---
  delete process.env.ONECLAW_HUMAN_API_KEY;

  console.log("✅ Bootstrap complete!\n");
  console.log("   Vault ID:     ", vaultId);
  console.log("   Agent ID:     ", agentId);
  console.log("   Agent API Key:", agentApiKey.slice(0, 8) + "...");
  console.log("");
  console.log("🔑 SECURITY: You can now revoke or rotate your personal API key");
  console.log("   (1ck_...) from https://1claw.xyz → Settings → API Keys.");
  console.log("   The agent uses its own scoped credentials from here on.\n");
}

main().catch((err) => {
  console.error("Bootstrap failed:", err.message);
  process.exit(1);
});
