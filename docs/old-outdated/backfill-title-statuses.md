# Legacy `titleStatuses` Backfill

This repository now uses normalized status storage:

- `titleUserStatuses`
- `titleHouseholdStatuses`

If you need to migrate historical legacy data from `titleStatuses`, use the one-time best-effort script:

```bash
node scripts/backfill-title-statuses.mjs --dry-run
node scripts/backfill-title-statuses.mjs
```

## Required environment variables

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

## Backfill rules

- `watchedBy.memberOne === true` maps to `household.memberIds[0]`
- `watchedBy.memberTwo === true` maps to `household.memberIds[1]`
- `wantToWatchBy.memberOne === true` maps to `household.memberIds[0]`
- `wantToWatchBy.memberTwo === true` maps to `household.memberIds[1]`
- `watchedBy.together === true` maps to `watchedTogether: true`
- `wantToWatchBy.together === true` maps to `householdWantsToWatch: true`

Ambiguous records are skipped and logged. The script does not infer missing historical truth.

## Optional legacy cleanup

After validating normalized status data, you can remove old `titleStatuses` docs:

```bash
node scripts/delete-legacy-title-statuses.mjs --dry-run
node scripts/delete-legacy-title-statuses.mjs
```
