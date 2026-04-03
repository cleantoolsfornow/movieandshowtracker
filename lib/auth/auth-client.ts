import {
  UserCredential,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { getFirebaseAuth, getGoogleProvider } from "@/lib/firebase/auth";

export function subscribeToAuthState(
  callback: Parameters<typeof onAuthStateChanged>[1],
) {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export async function signInWithGoogle(): Promise<UserCredential> {
  return signInWithPopup(getFirebaseAuth(), getGoogleProvider());
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<UserCredential> {
  return signInWithEmailAndPassword(getFirebaseAuth(), email, password);
}

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<UserCredential> {
  return createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
}

export async function signOutUser(): Promise<void> {
  await signOut(getFirebaseAuth());
}

export async function getCurrentIdToken(): Promise<string> {
  const currentUser = getFirebaseAuth().currentUser;

  if (!currentUser) {
    throw new Error("You must be signed in.");
  }

  return currentUser.getIdToken();
}
