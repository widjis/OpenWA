# 26 - Baileys to OpenWA Feature Mapping

## 26.1 Purpose

This document helps teams evaluate whether an existing **Baileys-based** implementation can be migrated to **OpenWA** without losing critical behavior.

It focuses on:

- Common messaging and session-management use cases
- Features that are exposed through OpenWA's REST API, webhooks, or WebSocket surface
- Important gaps between **raw Baileys capabilities** and the **normalized OpenWA platform surface**

> OpenWA is an application platform built on top of pluggable WhatsApp engines. It does **not** expose every low-level engine signal one-to-one. Some Baileys capabilities are normalized, reduced, or intentionally kept internal to provide a more stable API contract.

---

## 26.2 Status Legend

| Status | Meaning |
| --- | --- |
| **Exposed** | Available through a public OpenWA surface (REST API, webhook, WebSocket, or SDK). |
| **Partial** | Supported in a narrower or normalized form, or with engine-specific limitations. |
| **Not Exposed** | Potentially available inside the engine/library, but not available as a public OpenWA contract. |

---

## 26.3 Feature Mapping Table

| Baileys / WhatsApp Capability | OpenWA Status | OpenWA Surface | Notes |
| --- | --- | --- | --- |
| Session create / start / stop / delete | **Exposed** | REST / SDK / Dashboard | First-class session lifecycle management. |
| QR login | **Exposed** | REST / WebSocket / Dashboard | QR retrieval is part of the public session flow. |
| Phone-number pairing code | **Exposed** | REST / SDK / Dashboard | Supported as an alternative to QR. |
| Send text message | **Exposed** | REST / SDK | Core messaging feature. |
| Send media (image, video, audio, document, sticker) | **Exposed** | REST / SDK | Public API covers common outbound media operations. |
| Send location / contact card | **Exposed** | REST / SDK | Available as normalized messaging actions. |
| Reply / forward / react / delete message | **Exposed** | REST / SDK | Exposed as high-level message actions. |
| Outgoing delivery ack updates | **Exposed** | Webhook / WebSocket | Normalized to OpenWA delivery-status events. |
| Incoming message events | **Exposed** | Webhook / WebSocket | Primary event contract for inbound automation. |
| Message reaction events | **Exposed** | Webhook / WebSocket | Exposed as normalized reaction events. |
| Message revoke / delete events | **Exposed** | Webhook / WebSocket | Available as revoked-message events. |
| Chat list / recent chats | **Exposed** | REST / SDK | Public chat listing is available. |
| Mark chat read / unread | **Exposed** | REST / SDK | Public chat-state operations. |
| Delete chat from chat list | **Exposed** | REST / SDK | Public endpoint exists. |
| Send typing / recording / paused state | **Exposed** | REST / SDK | OpenWA exposes this as `sendChatState`. |
| Simulated typing before send | **Exposed** | Config / runtime behavior | Built-in best-effort humanizing delay before single sends. |
| Contacts list / lookup / existence check | **Exposed** | REST / SDK | Public contact operations are available. |
| Profile picture lookup | **Exposed** | REST / SDK | Exposed as a normalized contact action. |
| Group list / group metadata | **Exposed** | REST / SDK | Public group operations are available. |
| Group management (create, participants, subject, description, invite) | **Exposed** | REST / SDK | High-level group administration is supported. |
| History sync available to the engine | **Partial** | REST / local persistence | OpenWA exposes stored/history views, but not every raw history-sync primitive. |
| Full raw Baileys message payloads | **Not Exposed** | None | OpenWA normalizes payloads into engine-agnostic message DTOs. |
| Raw socket / event bus access | **Not Exposed** | None | OpenWA intentionally hides engine internals behind its service boundary. |
| Presence updates from other users (`presence.update`) | **Not Exposed** | None | There is no public `presence.update` event contract. |
| Typing detection from other users | **Not Exposed** | None | Outbound typing is supported; inbound typing observation is not publicly exposed. |
| Online / offline presence observation | **Not Exposed** | None | No public presence-watch API or event stream. |
| Contact-update realtime events | **Not Exposed** | None | Internal engine updates may exist, but OpenWA does not publish `contact.update`. |
| Chat-update realtime deltas | **Not Exposed** | None | Internal synchronization exists, but there is no raw public chat-delta stream. |
| Low-level Baileys connection events | **Partial** | WebSocket / Webhook / session status | OpenWA exposes session lifecycle states, not all native transport-level events. |
| Engine-specific JID dialect details | **Not Exposed** | None | OpenWA normalizes ids to a neutral dialect where possible. |
| Status / stories posting | **Partial** | REST / SDK | Available, but engine-limited; some operations are Baileys-only. |
| Labels / catalog / channels | **Partial** | REST / SDK | Publicly exposed, but availability depends on account type and engine support. |

---

## 26.4 Important Gaps

### Presence And Typing

OpenWA **does expose outbound typing/recording/paused** to a specific chat, but it does **not** expose the inbound presence stream that many direct Baileys integrations use for:

- detecting whether a user is currently typing
- detecting whether a user is online or offline
- observing transient presence changes for agent-assist workflows

For migrations, this means:

- If your current Baileys app only **sends** typing indicators, OpenWA is sufficient.
- If your current Baileys app **observes** typing or presence from other users, this is currently a gap.

### Raw Event Access

Direct Baileys implementations often depend on:

- raw socket events
- engine-specific payload fields
- low-level connection and sync events
- custom listeners over `contacts.update`, `chats.update`, or similar internal deltas

OpenWA intentionally collapses these into a smaller, engine-agnostic contract. That improves platform stability, but it also means a migration may lose:

- payload richness
- event granularity
- tight control over engine behavior

### Engine-Specific Features

Some capabilities are exposed only when the active engine supports them. A practical example is the **Status/Stories** module, where some send operations are explicitly marked **Baileys only**.

Treat these features as:

- public but engine-limited
- stable at the API layer
- variable at runtime depending on the selected engine

---

## 26.5 Migration Guidance

### Good Migration Candidates

OpenWA is a strong replacement when the current Baileys implementation is mostly centered on:

- session lifecycle management
- sending text and media
- inbound message automation
- webhooks
- reactions, replies, and message history
- multi-session operational management

### High-Risk Migration Areas

Migration needs deeper validation when the current Baileys implementation depends on:

- presence detection
- typing detection
- online/offline observation
- raw event listeners
- direct socket lifecycle control
- custom parsing of native Baileys payloads

### Recommended Audit Checklist

Before migration, inventory the current Baileys app by asking:

1. Do we consume raw Baileys events directly?
2. Do we react to `presence.update` or typing indicators from users?
3. Do we depend on engine-native payload fields not visible in OpenWA's webhook payloads?
4. Do we need low-level reconnect or socket-state hooks?
5. Are any features engine-specific and therefore sensitive to `ENGINE_TYPE`?

If the answer is "yes" to one or more of the above, run a proof of concept before replacing the existing Baileys implementation.

---

## 26.6 Evidence In This Repository

The mapping above is based on the current documented and implemented OpenWA surface:

- Public typing state endpoint exists in `POST /api/sessions/:id/chats/typing`
- `SIMULATE_TYPING` exists as a built-in send behavior
- The engine callback contract includes message / ack / reaction / revoked / session-state signals, but not a general `onPresence`
- The API specification explicitly states that `presence.update` and `contact.update` are not emitted as public events
- Some Status operations are documented as Baileys-only

---

<div align="center">

[Documentation Index](./README.md)

</div>
