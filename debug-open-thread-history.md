# Debug Session: open-thread-history
- **Status**: [OPEN]
- **Issue**: Refreshing Chatbox is fine, but clicking a specific thread triggers `whatsapp-web.js` `Client.getChatById()` / `getChatHistory()` runtime error `r: r`.
- **Debug Server**: Pending startup
- **Log File**: `.dbg/trae-debug-log-open-thread-history.ndjson`

## Reproduction Steps
1. Run local dev with a connected `whatsapp-web.js` session.
2. Open Chatbox so the sidebar loads normally.
3. Click one specific thread in the sidebar.
4. Observe backend error from `Client.getChatById()` -> `WhatsAppWebJsAdapter.getChatHistory()`.

## Hypotheses & Verification
| ID | Hypothesis | Likelihood | Effort | Evidence |
|----|------------|------------|--------|----------|
| A | Clicking a thread triggers a live `getChatHistory(chatId)` and `whatsapp-web.js` fails at `getChatById(chatId)` for that thread. | High | Low | Pending |
| B | The sidebar is already protected by persisted fallback, but thread detail/history still depends on a brittle live engine call. | High | Low | Pending |
| C | `getChatHistory()` should resolve/de-normalize the target id before `getChatById()`, similar to send/read paths. | Medium | Medium | Pending |
| D | When the live history fetch fails, the endpoint should fall back to persisted messages so opening a thread stays usable. | High | Medium | Pending |

## Log Evidence
- Terminal stack trace points to `Client.getChatById()` -> `WhatsAppWebJsAdapter.getChatHistory()` when a thread is clicked.
- Sidebar list no longer crashes because `getChats()` already falls back to persisted chat summaries.

## Verification Conclusion
- Pending instrumentation and runtime reproduction.
