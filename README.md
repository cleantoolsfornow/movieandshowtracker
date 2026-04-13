# Shared Movie & TV Tracker

## Local development

1. Create `.env.local` from `.env.local.example`.
2. Set Firebase web config (`NEXT_PUBLIC_FIREBASE_*`).
3. Set Firebase Admin SDK config for secure household APIs:
   - `FIREBASE_ADMIN_PROJECT_ID`
   - `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `FIREBASE_ADMIN_PRIVATE_KEY` (preserve newlines as `\n`)
4. Set TheTVDB server config:
   - `TVDB_API_KEY`
   - `TVDB_BASE_URL` (optional, defaults to `https://api4.thetvdb.com/v4`)
5. Start dev:

```bash
npm run dev
```

`npm run dev` opens `http://localhost:3000/onboarding`.  
Use `npm run dev:no-open` to skip auto-open.

## Resetting test data

To wipe the household and tracker Firestore collections for a fresh TVDB-first reset:

```bash
set -a
source .env.local
set +a
npm run reset:tracker-data -- --yes
```

Use `--dry-run` first if you want a preview. This clears Firestore documents only; it does not delete Firebase Auth users.

## Security notes

- Do not commit `.env.local`.
- Household create/join runs through server routes (`/api/households/*`) using verified Firebase ID tokens and Admin SDK (no client-side invite-code Firestore query).
- Firestore rules should keep client writes locked down. Recommended baseline:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    match /households/{householdId} {
      allow read: if request.auth != null && request.auth.uid in resource.data.memberIds;
      allow write: if false;
    }
  }
}
```
