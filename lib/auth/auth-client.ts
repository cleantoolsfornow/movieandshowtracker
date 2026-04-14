import {
  UserCredential,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";

import { getFirebaseAuth, getGoogleProvider } from "@/lib/firebase/auth";
import { ensureUserProfile } from "@/lib/firestore/users";

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
  displayName: string,
): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(
    getFirebaseAuth(),
    email,
    password,
  );
  const trimmedDisplayName = displayName.trim();
  await updateProfile(credential.user, { displayName: trimmedDisplayName });
  await ensureUserProfile(credential.user);
  return credential;
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

export async function updateCurrentUserDisplayName(
  displayName: string,
): Promise<void> {
  const currentUser = getFirebaseAuth().currentUser;
  if (!currentUser) {
    throw new Error("You must be signed in.");
  }

  await updateProfile(currentUser, { displayName });
}
