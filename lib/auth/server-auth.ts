import "server-only";

import { NextRequest } from "next/server";

import { getAdminAuth } from "@/lib/firebase/admin";

export async function requireUidFromRequest(request: NextRequest): Promise<string> {
  const authorization = request.headers.get("authorization") ?? "";

  if (!authorization.startsWith("Bearer ")) {
    throw new Error("Missing auth token.");
  }

  const idToken = authorization.slice("Bearer ".length).trim();
  if (!idToken) {
    throw new Error("Missing auth token.");
  }

  const decoded = await getAdminAuth().verifyIdToken(idToken);
  return decoded.uid;
}
