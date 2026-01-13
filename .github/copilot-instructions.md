# Tic Track – AI Coding Guide

## Architecture & Navigation
- [App.tsx](App.tsx) owns screen navigation (`home` ↔ `logger` ↔ `viewer`), global sync state, and bootstrapping (database init, Cosmos probe, auto-sync start). Keep long-running work in services and only orchestrate here.
- UI is composed from [src/components/EventLogger.tsx](src/components/EventLogger.tsx), [src/components/EventViewer.tsx](src/components/EventViewer.tsx), and [src/components/SyncPanel.tsx](src/components/SyncPanel.tsx); reuse these patterns when adding screens.
- Colors, typography (Manrope), icons (MaterialIcons), and gradients are defined per component; follow existing `COLORS` objects instead of introducing ad-hoc styling.

## Data & Sync
- Local persistence lives in [src/services/localStorage.ts](src/services/localStorage.ts) using `expo-sqlite`. Always create events via `createEvent()` so UUIDs, timestamps, and `sync_status` are consistent.
- Cloud operations live in [src/services/cosmosClient.ts](src/services/cosmosClient.ts) which signs REST calls manually (SDK is incompatible with Expo). Use the exported helpers instead of raw `fetch`.
- [src/services/eventSync.ts](src/services/eventSync.ts) merges local + remote events and enforces the offline-first contract. Favor `getMergedEvents()`/`syncPendingEvents()` instead of duplicating merge logic.
- When adding new event fields update `[src/types/events.ts](src/types/events.ts)` first, then the SQLite schema/constants, and finally Cosmos payloads (see DEVELOPMENT.md “Add a New Event Field”).

## Azure & Configuration
- Runtime configuration is injected via `app.config.ts` → Expo `extra`. Access it through `getAzureConfig()`; never read `.env` directly inside components.
- Partitioning is `/event_type`; maintain the `event_type` field on every document and supply it in `x-ms-documentdb-partitionkey` headers.
- Use `subscribeToCosmosErrors()` to surface API failures in the UI instead of silent logging.

## UI Conventions
- Forms follow the EventLogger pattern: local state via hooks, live duration feedback, and `Alert.alert` for errors. Keep accessibility labels on pressables that change navigation or settings.
- Lists should leverage `FlatList` with lightweight cards like EventViewer, showing sync badges derived from `sync_status`.
- Sync state is pulled by `refreshSyncState()` in [App.tsx](App.tsx); if you add new sync flows, update this helper rather than duplicating status logic.

## Developer Workflow
- Primary commands: `npx expo start` (dev server), `npx tsc --noEmit` (type check), `npm run lint` (ESLint), `npm run format` (Prettier).
- Cosmos credentials belong in `.env`; never hard-code keys. To run offline, leave the key empty—`initCosmosClient()` gracefully disables cloud sync.
- Tests are manual today (see [TESTING.md](TESTING.md)); add unit tests under a future `__tests__` folder if needed and document the commands here.

## Common Patterns & Tips
- Sync runs every 30s via `startAutoSync()`; guard long operations with the `isSyncing` flag in `eventSync` to prevent overlapping jobs.
- When touching dates, prefer helpers from [src/utils/datetime.ts](src/utils/datetime.ts) for formatting and ISO handling.
- Favor functional React components with hooks. State that must survive navigation (events, sync info) should live in [App.tsx](App.tsx); transient form state stays inside the component.
- Before adding new dependencies, confirm they are Expo-compatible (React Native 0.81 / Expo SDK 54, React 19) and update `app.config.ts` if config is required.
