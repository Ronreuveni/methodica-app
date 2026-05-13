// Boots Firebase if firebase-config.js is populated. Exposes `window.fb` with
// a small surface the React app uses (db, auth, docRef, sentinel helpers).
//
// If config is missing or SDK didn't load, `window.fb.ready === false` and the
// app silently falls back to localStorage-only mode — no errors, no popups.

(function () {
  const cfg = window.FIREBASE_CONFIG || {};
  if (!cfg.apiKey || !cfg.projectId) {
    window.fb = { ready: false, reason: 'no-config' };
    return;
  }
  if (typeof firebase === 'undefined') {
    console.warn('[fb] Firebase SDK not loaded — staying offline.');
    window.fb = { ready: false, reason: 'sdk-missing' };
    return;
  }
  try {
    firebase.initializeApp(cfg);
    const db   = firebase.firestore();
    const auth = firebase.auth();
    const workspaceId = window.FIREBASE_WORKSPACE_ID || 'methodica';
    const docRef = db.collection('workspaces').doc(workspaceId);
    window.fb = {
      ready: true,
      db, auth, docRef,
      serverTimestamp: () => firebase.firestore.FieldValue.serverTimestamp(),
      GoogleAuthProvider: firebase.auth.GoogleAuthProvider,
    };
    console.info('[fb] Connected to project ' + cfg.projectId + ' · workspace ' + workspaceId);
  } catch (e) {
    console.error('[fb] init failed:', e);
    window.fb = { ready: false, reason: 'init-failed', error: e };
  }
})();
