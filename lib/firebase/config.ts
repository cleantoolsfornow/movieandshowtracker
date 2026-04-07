import { z } from "zod";
import type { FirebaseOptions } from "firebase/app";

const firebaseClientEnvSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
});

export function getFirebaseClientConfig(): FirebaseOptions {
  const parsed = firebaseClientEnvSchema.parse({
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });

  return {
    apiKey: parsed.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: parsed.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: parsed.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: parsed.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: parsed.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: parsed.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}
