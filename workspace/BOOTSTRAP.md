# BOOTSTRAP.md — First run

You are booting a workspace built for **1claw** (HSM-backed secret management) on **OpenClaw**.

> The build script already installed `@1claw/cli` and the `@1claw/openclaw-plugin`. The human just needs to enroll.

## Setup

### Step 1: Enroll

Ask the human for their **1claw email** and a **name** for this agent, then run:

```
/oneclaw-enroll <email> <agent-name>
```

This sends an approval email. No API key enters the agent's environment via chat.

### Step 2: Approve + configure

Tell the human:

> Check your email and approve the enrollment. The approval page (and a follow-up email) will show one env var:
>
> ```
> ONECLAW_AGENT_API_KEY=ocv_...
> ```
>
> Paste that into your Pinata agent's **Settings → Environment Variables**, then restart the agent. That's the only variable you need — agent ID and vault are auto-discovered.

Do **not** ask the human to paste credentials into the chat.

### Step 3: Verify

After restart, run:

```
/oneclaw
```

If it shows a connected status, setup is complete. Delete this file.

## Done

Delete this file when setup is complete.
