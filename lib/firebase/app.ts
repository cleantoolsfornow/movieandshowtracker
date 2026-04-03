import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";

import { getFirebaseClientConfig } from "@/lib/firebase/config";

let firebaseApp: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (firebaseApp) {
    return firebaseApp;
  }

  firebaseApp = getApps().length
    ? getApp()
    : initializeApp(getFirebaseClientConfig());

  return firebaseApp;
}
