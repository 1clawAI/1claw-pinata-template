# HEARTBEAT.md

Keep this file tiny. The heartbeat runner loads it when present.

Optional periodic checks (uncomment or edit as needed):

- `1claw whoami` — verify the session is still authenticated.
- `1claw vault list` — confirm vault access is healthy.
- `1claw agent get <agent-id>` — check agent status and token TTL.

If nothing here applies, leave only comments or reply `HEARTBEAT_OK` when polled.
