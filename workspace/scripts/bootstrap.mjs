#!/usr/bin/env node

/**
 * One-key bootstrap: provisions a vault + agent using the human's API key
 * via the 1claw CLI, then writes agent-scoped credentials to both the
 * OpenClaw config (for the plugin) and 1claw CLI config (for CLI usage).
 *
 * Runs once during `scripts.build` in manifest.json.
 * The human API key (ONECLAW_HUMAN_API_KEY) is never stored in the config.
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

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

function updateOpenClawConfig(agentId, agentApiKey, vaultId) {
  const configPath = join(homedir(), ".openclaw", "openclaw.json");
  let config = {};

  if (existsSync(configPath)) {
    try {
      config = JSON.parse(readFileSync(configPath, "utf-8"));
    } catch {
      console.log("   ⚠ Could not parse existing openclaw.json, creating fresh plugin config");
    }
  }

  if (!config.plugins) config.plugins = {};
  if (!config.plugins.entries) config.plugins.entries = {};

  config.plugins.entries["1claw"] = {
    ...config.plugins.entries["1claw"],
    enabled: true,
    config: {
      ...(config.plugins.entries["1claw"]?.config || {}),
      apiKey: agentApiKey,
      agentId: agentId,
      vaultId: vaultId,
    },
  };

  writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
  console.log(`   Wrote plugin config to ${configPath}`);
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
    // No vaults yet
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

  // --- Link vault as default for CLI ---
  try {
    cli(`1claw vault link ${vaultId}`);
  } catch {
    // Non-fatal
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

  // --- Write to OpenClaw config (plugin reads from here) ---
  try {
    updateOpenClawConfig(agentId, agentApiKey, vaultId);
  } catch (err) {
    console.error("Failed to update OpenClaw config:", err.message);
  }

  // --- Also write to 1claw CLI config ---
  try {
    cli(`1claw config set agent-id ${agentId}`);
    cli(`1claw config set agent-api-key ${agentApiKey}`);
    cli(`1claw config set default-vault ${vaultId}`);
    console.log("   Wrote credentials to ~/.config/1claw/");
  } catch {
    // Non-fatal — OpenClaw config is the primary target
  }

  // --- Discard human key from this process ---
  delete process.env.ONECLAW_HUMAN_API_KEY;

  console.log("\n✅ Bootstrap complete!\n");
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
