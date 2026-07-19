(2026-07-03)

## Feature:
- Baileys to OpenWA migration documentation

## Changes:
- Added `docs/26-baileys-openwa-feature-mapping.md`
- Added a feature-mapping table for common Baileys capabilities versus the public OpenWA surface
- Documented which areas are exposed, partial, or not exposed, with emphasis on presence and typing-related gaps
- Updated `docs/README.md` to include the new documentation entry

## Notes:
- The document is migration-oriented rather than a raw engine capability matrix
- Outbound typing is exposed in OpenWA, while inbound presence and typing observation remain outside the current public contract

(2026-07-19)

## Feature:
- Local Infrastructure restart behavior for engine switching

## Changes:
- Updated `POST /infra/restart` to avoid shutting the app down when Docker orchestration is unavailable
- Returned a manual-restart message for local mode so engine changes stay saved without killing the running app
- Updated the Infrastructure page to stop waiting for a fake restart in local mode and surface the backend message immediately
- Added a regression test covering the non-Docker restart path

## Notes:
- Local non-Docker mode now behaves as "save config, then restart manually" for engine changes
- Docker-backed environments keep the existing orchestrated restart flow
