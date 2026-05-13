// Firebase Web SDK configuration.
//
// These values are public identifiers for your Firebase project — they are
// NOT secrets. Real protection comes from Firestore Security Rules, not from
// hiding these values. Safe to commit to a public repo.
//
// HOW TO POPULATE:
//   Firebase Console → ⚙ Project settings → Your apps → Web app → Config
//   Paste the 6 values below. Save the file. Reload the app.
//
// While these are empty strings, the app runs in offline-only mode using
// localStorage (current behaviour, no risk).

window.FIREBASE_CONFIG = {
  apiKey:            "",
  authDomain:        "",
  projectId:         "",
  storageBucket:     "",
  messagingSenderId: "",
  appId:             ""
};

// Path that all studio data syncs to: workspaces/{id}
window.FIREBASE_WORKSPACE_ID = 'methodica';
