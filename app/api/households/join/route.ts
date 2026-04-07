import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { requireUidFromRequest } from "@/lib/auth/server-auth";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  isValidInviteCode,
  normalizeInviteCode,
} from "@/lib/households/invite";
import { logServerError } from "@/lib/server/logger";

export async function POST(request: NextRequest) {
  try {
    const uid = await requireUidFromRequest(request);
    const adminDb = getAdminDb();
    const body = (await request.json()) as { inviteCode?: string };

    const inviteCode = normalizeInviteCode(body.inviteCode ?? "");
    if (!isValidInviteCode(inviteCode)) {
      return NextResponse.json(
        { error: "Invite code format is invalid." },
        { status: 400 },
      );
    }

    const householdByCode = await adminDb
      .collection("households")
      .where("inviteCode", "==", inviteCode)
      .limit(1)
      .get();

    if (householdByCode.empty) {
      return NextResponse.json(
        { error: "Invite code not found." },
        { status: 404 },
      );
    }

    const householdDoc = householdByCode.docs[0];

    const result = await adminDb.runTransaction(async (transaction) => {
      const userRef = adminDb.collection("users").doc(uid);
      const householdRef = adminDb
        .collection("households")
        .doc(householdDoc.id);

      const [userSnapshot, householdSnapshot] = await Promise.all([
        transaction.get(userRef),
        transaction.get(householdRef),
      ]);

      if (!householdSnapshot.exists) {
        throw new Error("Household no longer exists.");
      }

      const currentHouseholdId = userSnapshot.exists
        ? ((userSnapshot.get("householdId") as string | null | undefined) ??
          null)
        : null;

      if (currentHouseholdId && currentHouseholdId !== householdRef.id) {
        return {
          conflict: true,
          householdId: currentHouseholdId,
        };
      }

      const now = FieldValue.serverTimestamp();

      transaction.set(
        householdRef,
        {
          memberIds: FieldValue.arrayUnion(uid),
          updatedAt: now,
        },
        { merge: true },
      );

      transaction.set(
        userRef,
        {
          uid,
          householdId: householdRef.id,
          updatedAt: now,
        },
        { merge: true },
      );

      return {
        conflict: false,
        householdId: householdRef.id,
      };
    });

    if (result.conflict) {
      return NextResponse.json(
        { error: "User is already in another household." },
        { status: 409 },
      );
    }

    return NextResponse.json({
      householdId: result.householdId,
      inviteCode,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to join household.";
    const status = message === "Missing auth token." ? 401 : 500;
    logServerError("api.households.join", error, { status });
    return NextResponse.json(
      { error: status === 401 ? message : "Failed to join household." },
      { status },
    );
  }
}
