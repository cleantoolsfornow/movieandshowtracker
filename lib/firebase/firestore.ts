import { getFirestore } from "firebase/firestore";

import { getFirebaseApp } from "@/lib/firebase/app";

export function getFirebaseDb() {
  return getFirestore(getFirebaseApp());
}
