import {
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import type { User } from "firebase/auth";

import { getFirebaseDb } from "@/lib/firebase/firestore";

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  avatarDataUrl: string | null;
  householdId: string | null;
};

function userRef(uid: string) {
  return doc(getFirebaseDb(), "users", uid);
}

export async function ensureUserProfile(user: User): Promise<void> {
  const ref = userRef(user.uid);
  const now = serverTimestamp();

  await runTransaction(getFirebaseDb(), async (transaction) => {
    const snapshot = await transaction.get(ref);

    if (!snapshot.exists()) {
      transaction.set(ref, {
        uid: user.uid,
        email: user.email ?? null,
        displayName: user.displayName ?? null,
        photoURL: user.photoURL ?? null,
        avatarDataUrl: null,
        householdId: null,
        createdAt: now,
        updatedAt: now,
      });
      return;
    }

    transaction.set(
      ref,
      {
        email: user.email ?? null,
        photoURL: user.photoURL ?? null,
        updatedAt: now,
      },
      { merge: true },
    );
  });
}

export async function updateUserDisplayName(
  uid: string,
  displayName: string,
): Promise<void> {
  await updateDoc(userRef(uid), {
    displayName,
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserAvatarDataUrl(
  uid: string,
  avatarDataUrl: string | null,
): Promise<void> {
  await updateDoc(userRef(uid), {
    avatarDataUrl,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToUserProfile(
  uid: string,
  callback: (profile: UserProfile | null) => void,
) {
  return onSnapshot(userRef(uid), (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    const data = snapshot.data();
    callback({
      uid,
      email: (data.email as string | null | undefined) ?? null,
      displayName: (data.displayName as string | null | undefined) ?? null,
      photoURL: (data.photoURL as string | null | undefined) ?? null,
      avatarDataUrl: (data.avatarDataUrl as string | null | undefined) ?? null,
      householdId: (data.householdId as string | null | undefined) ?? null,
    });
  });
}
