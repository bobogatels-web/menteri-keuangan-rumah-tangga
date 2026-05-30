---
name: Expo SQLite Web Setup
description: Fixes needed for expo-sqlite to work in web preview (Expo SDK 54 + expo-sqlite 16.x)
---

## Issue 1 — WASM bundling error
Metro can't resolve `./wa-sqlite/wa-sqlite.wasm` on web.

**Fix:** Add `"wasm"` to `assetExts` in `metro.config.js`:
```js
config.resolver.assetExts = [...assetExts, "wasm"];
config.resolver.sourceExts = sourceExts.filter(ext => ext !== "wasm");
```

**Why:** expo-sqlite 16.x uses a wasm-backed worker on web. Metro defaults treat `.wasm` as source and fails to resolve it. Adding to assetExts makes Metro serve it as a binary asset.

## Issue 2 — DBProvider crashes on web mount
"Can't perform a React state update on a component that hasn't mounted yet" — from `useState(() => getAllTransactions())`.

**Fix:** Initialize state as empty arrays; load data inside `useEffect` with a small delay (50ms) so the SQLite worker is ready.

**Why:** On web, expo-sqlite initializes the wasm worker asynchronously. Calling `openDatabaseSync` / `getAllSync` during the React render phase (in useState initializers) triggers state updates before the component mounts.

## Package versions for SDK 54
Run `pnpm exec expo install <pkg> --fix` to downgrade packages installed at wrong major version.
Affected packages when using pnpm add directly: expo-sqlite, expo-file-system, expo-local-authentication, expo-print, expo-sharing, expo-notifications.
