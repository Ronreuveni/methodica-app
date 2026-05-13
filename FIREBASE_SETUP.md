# Firebase setup — real-time team sync

The app works fine **without** Firebase (localStorage only). To turn on live
cross-device sync, do this once:

## 1. Create a Firebase project
1. Go to https://console.firebase.google.com.
2. **Add project** → name it (e.g. `methodica-app`) → continue → disable
   Google Analytics (not needed) → **Create project**.

## 2. Register a Web app
1. Inside the project: **⚙ Project settings → Your apps → `</>`** (Web).
2. App nickname: `methodica`. **Register app**.
3. Copy the 6 lines of the `firebaseConfig` object that appears.

## 3. Paste config into the repo
Open `firebase-config.js` and replace the empty strings with the 6 values:
```js
window.FIREBASE_CONFIG = {
  apiKey:            "AIza...",
  authDomain:        "methodica-app.firebaseapp.com",
  projectId:         "methodica-app",
  storageBucket:     "methodica-app.firebasestorage.app",
  messagingSenderId: "1234567890",
  appId:             "1:1234567890:web:abc..."
};
```
**These are public identifiers — safe to commit.** Real security comes from
the Firestore Rules below, not from hiding the keys.

## 4. Enable Firestore
1. Left nav → **Firestore Database** → **Create database**.
2. Start in **Production mode** → **Next**.
3. Location: **`eur3 (europe-west)`** (closest to Israel) → **Enable**.

## 5. Apply the rules
1. Firestore Database → **Rules** tab.
2. Replace the placeholder rules with the contents of `firestore.rules` from
   this repo. **Publish**.

## 6. (Optional) Enable Google sign-in
The default rules (Phase 1) are **open** — anyone with the URL can edit. For a
quick team rollout that's fine. To lock down to `@methodic.co.il` only:

1. **Authentication → Sign-in method → Google → Enable** (set support email).
2. In `firestore.rules`: comment out Phase 1, uncomment Phase 2 → Publish.
3. In the app, open the sidebar **⚙ הגדרות** panel → **התחבר עם Google**.

## 7. Deploy
No build step. GitHub Pages picks up the new files on the next push. Vercel /
Cloudflare Pages work the same way (static-site deploy, no config needed).

---

## How sync works
- App boots from localStorage → UI paints **instantly**.
- A single `onSnapshot` listener on `workspaces/methodica` keeps state live.
- All edits (drag a chip, edit a project, add a producer, etc.) write back to
  the same doc, debounced 500 ms so rapid changes are batched.
- First connect: if the cloud doc is empty and localStorage has data, the app
  **seeds** the cloud from local state. From then on cloud is the truth.
- localStorage stays as a fast cache for first paint.

## What to do if something breaks
- Sidebar **⚙ הגדרות** panel shows a connection status dot:
  - 🟢 `מסונכרן בענן` — live
  - 🟡 `מצב מקומי` — config missing or SDK didn't load
  - 🔴 `שגיאת סנכרון` — connection or write failed (check browser console)
- Open browser console (F12) for `[fb]` messages.
- Worst case: click **איפוס נתונים מלא** in הגדרות → reloads with clean
  localStorage → snapshot from cloud will repopulate immediately.

## Multi-device test
1. Open the app on your laptop.
2. Open the app on your phone (same URL).
3. Drag a project on the laptop → it appears on the phone in < 1 second.
