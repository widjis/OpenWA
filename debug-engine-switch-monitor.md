# Debug Session: engine-switch-monitor
- **Status**: [OPEN]
- **Issue**: Monitor local runtime while switching the WhatsApp engine from `baileys` back to `whatsapp-web.js`, focusing on backend boot, frontend/API reachability, and session startup behavior.
- **Debug Server**: Not started
- **Log File**: Not initialized

## Reproduction Steps
1. Set engine selection back to `whatsapp-web.js`.
2. Restart the local app/runtime.
3. Observe backend boot on port `2785`, dashboard reachability, and session initialization logs.

## Hypotheses & Verification
| ID | Hypothesis | Likelihood | Effort | Evidence |
|----|------------|------------|--------|----------|
| A | `ENGINE_TYPE` changes in config, but runtime still reads a different source and does not switch engines. | High | Low | Pending |
| B | Backend boots normally, but auto-starting previously authenticated sessions causes the perceived failure after the engine switch. | High | Low | Pending |
| C | Switching back to `whatsapp-web.js` leaves session auth/state incompatible, so session startup fails while API/frontend remain healthy. | High | Low | Pending |
| D | Frontend appears down because backend is not listening on `2785` yet, while the dev/bundled UI path gives confusing symptoms. | Medium | Low | Pending |
| E | `whatsapp-web.js` reintroduces a runtime engine error during session start (`Puppeteer`, auth, or WA runtime), which is misread as a generic frontend failure. | Medium | Medium | Pending |

## Log Evidence
- User reproduction evidence after saving `whatsapp-web.js`:
  - `Destroying engine for session ... action=shutdown`
  - `[baileys] Baileys engine plugin disabled`
  - `Webhook dispatch lookup failed for session.status`
  - `QueryFailedError: SQLITE_MISUSE: Database handle is closed`
- User reproduction evidence after saving `baileys` from `whatsapp-web.js`:
  - `Configuration saved`
  - `Restart requested profiles=[]`
  - `Docker not available, writing signal file instead`
  - `Graceful shutdown requested delayMs=3000`
  - `Initiating shutdown...`
  - `Destroying engine for session ... action=shutdown`
  - `Dispatching session.status ...`
  - `Webhook delivery failed ... TypeError: fetch failed`
  - `[whatsapp-web.js] WhatsApp-web.js engine plugin disabled`
- Post-restart evidence after the local app was started manually:
  - `Auto-started session: wa-bot ... action=auto_start_success`
  - `Nest application successfully started`
  - `OpenWA is running on: http://localhost:2785`
  - `Dashboard: serving bundled UI at http://localhost:2785`
  - `Session ready: 6281145401505 ... action=ready`
  - Repeated `Webhook delivery failed ... TypeError: fetch failed`

## Hypotheses & Verification
| ID | Hypothesis | Likelihood | Effort | Evidence |
|----|------------|------------|--------|----------|
| A | `ENGINE_TYPE` changes in config, but runtime still reads a different source and does not switch engines. | High | Low | Inconclusive |
| B | Backend boots normally, but auto-starting previously authenticated sessions causes the perceived failure after the engine switch. | High | Low | Inconclusive |
| C | Switching back to `whatsapp-web.js` leaves session auth/state incompatible, so session startup fails while API/frontend remain healthy. | High | Low | Inconclusive |
| D | Frontend appears down because backend is not listening on `2785` yet, while the dev/bundled UI path gives confusing symptoms. | Medium | Low | Inconclusive |
| E | `whatsapp-web.js` reintroduces a runtime engine error during session start (`Puppeteer`, auth, or WA runtime), which is misread as a generic frontend failure. | Medium | Medium | Inconclusive |
| F | Graceful shutdown emits late `session.status` / webhook activity during teardown, producing shutdown-only errors unrelated to whether the engine switch persisted. | High | Low | Confirmed across both engine directions |
| G | In local non-Docker mode, `POST /infra/restart` intentionally shuts the process down after writing `data/.orchestration-request.json`, but no supervisor/orchestrator restarts it. | High | Low | Confirmed across both engine directions |

## Verification Conclusion
- Current evidence supports a shutdown-race hypothesis: while the old `baileys` engine is being destroyed during restart, it still emits a `DISCONNECTED` status path that calls `webhookService.dispatch(...)`; by then SQLite teardown may already be in progress, so the repository lookup fails with `Database handle is closed`.
- This evidence does not yet prove that switching to `whatsapp-web.js` failed. It primarily shows a noisy shutdown path during restart.
- New evidence from the user confirms the app does not come back up after this sequence. The strongest current hypothesis is that the local `POST /infra/restart` flow intentionally shuts the app down after writing `data/.orchestration-request.json`, but with `Docker not available` there is no external supervisor/orchestrator in this local run to bring the process back up.
- This means the immediate "stuck after Save" behavior is likely a restart-orchestration gap in local mode, not an engine-specific boot failure. Reproducing the same flow in the opposite direction (`whatsapp-web.js` -> `baileys`) should confirm whether the behavior is symmetric.
- The opposite-direction reproduction now matches: `whatsapp-web.js` also shuts down cleanly after save/restart request and does not come back by itself. This confirms the "stuck after Save" behavior is symmetric and tied to local restart orchestration, not to `baileys` or `whatsapp-web.js` specifically.
- The post-restart logs show the application and session boot cleanly again. The remaining failures are outbound webhook delivery errors (`fetch failed`), which are separate from the local restart issue.
