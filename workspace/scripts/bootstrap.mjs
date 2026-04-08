#!/usr/bin/env node

/**
 * One-key bootstrap: provisions a vault + agent using the human's API key
 * via the 1claw CLI, writes agent-scoped credentials to CLI config,
 * then discards the human key.
 *
 * Runs once during `scripts.build` in manifest.json.
 * Uses only the CLI (no SDK import) to avoid ESM resolution issues.
 */

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

function cli(cmd) {
  return execSync(cmd, {
    encoding: "utf-8",
    env: { ...process.env, ONECLAW_API_KEY: HUMAN_KEY },
  }).trim();
}

function cliJson(cmd) {
  const raw = cli(`${cmd} --json`);
  return JSON.parse(raw);
}

async function main() {
  console.log("\n🔐 1claw bootstrap: provisioning vault + agent...\n");

  // --- Vault ---
  let vaultId;
  try {
    const vaults = cliJson("1claw vault list");
    const list = vaults.vaults || vaults;
    if (Array.isArray(list) && list.length > 0) {
      vaultId = list[0].id;
      console.log(`   Using existing vault: ${vaultId}`);
    }
  } catch {
    // No vaults yet — will create one below
  }

  if (!vaultId) {
    try {
      const created = cliJson("1claw vault create openclaw-vault");
      vaultId = created.id || created.vault?.id;
      console.log(`   Created vault: ${vaultId}`);
    } catch (err) {
      console.error("Failed to create vault:", err.message);
      process.exit(1);
    }
  }

  // --- Link vault as default ---
  try {
    cli(`1claw vault link ${vaultId}`);
  } catch {
    // Non-fatal — config set below will handle it
  }

  // --- Agent ---
  let agentId, agentApiKey;
  try {
    const agent = cliJson("1claw agent create openclaw-agent");
    agentId = agent.id || agent.agent?.id;
    agentApiKey = agent.api_key || agent.apiKey;
    console.log(`   Created agent: ${agentId}`);
  } catch (err) {
    console.error("Failed to create agent:", err.message);
    process.exit(1);
  }

  // --- Grant read access ---
  try {
    cli(
      `1claw policy create --principal-type agent --principal-id ${agentId} --path "*" --permissions read`,
    );
    console.log("   Granted agent read access to vault");
  } catch (err) {
    console.error("Failed to grant access:", err.message);
    process.exit(1);
  }

  // --- Write agent credentials to CLI config ---
  try {
    cli(`1claw config set agent-id ${agentId}`);
    cli(`1claw config set agent-api-key ${agentApiKey}`);
    cli(`1claw config set default-vault ${vaultId}`);
    console.log("   Wrote credentials to ~/.config/1claw/\n");
  } catch {
    console.log(
      "   ⚠ Could not write to CLI config. Set these env vars manually:",
    );
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
  console.log(
    "🔑 SECURITY: You can now revoke or rotate your personal API key",
  );
  console.log(
    "   (1ck_...) from https://1claw.xyz → Settings → API Keys.",
  );
  console.log(
    "   The agent uses its own scoped credentials from here on.\n",
  );
}

main().catch((err) => {
  console.error("Bootstrap failed:", err.message);
  process.exit(1);
});
