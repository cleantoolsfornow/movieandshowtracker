import { getAuth, GoogleAuthProvider } from "firebase/auth";

import { getFirebaseApp } from "@/lib/firebase/app";

const googleProvider = new GoogleAuthProvider();

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export function getGoogleProvider() {
  return googleProvider;
}
