import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { requireUidFromRequest } from "@/lib/auth/server-auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { generateSecureInviteCode } from "@/lib/households/server";
import { logServerError } from "@/lib/server/logger";

export async function POST(request: NextRequest) {
  try {
    const uid = await requireUidFromRequest(request);
    const adminDb = getAdminDb();
    const body = (await request.json()) as { householdName?: string };
    const householdName = body.householdName?.trim();

    if (!householdName) {
      return NextResponse.json(
        { error: "Household name is required." },
        { status: 400 },
      );
    }

    const result = await adminDb.runTransaction(async (transaction) => {
      const userRef = adminDb.collection("users").doc(uid);
      const userSnapshot = await transaction.get(userRef);

      if (userSnapshot.exists) {
        const existingHouseholdId = userSnapshot.get("householdId") as
          | string
          | null
          | undefined;

        if (existingHouseholdId) {
          return {
            householdId: existingHouseholdId,
            inviteCode: null,
            alreadyMember: true,
          };
        }
      }

      const now = FieldValue.serverTimestamp();

      let inviteCode = "";
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const candidate = generateSecureInviteCode();
        const existingByCode = await adminDb
          .collection("households")
          .where("inviteCode", "==", candidate)
          .limit(1)
          .get();

        if (existingByCode.empty) {
          inviteCode = candidate;
          break;
        }
      }

      if (!inviteCode) {
        throw new Error("Could not generate unique invite code.");
      }

      const householdRef = adminDb.collection("households").doc();

      transaction.set(householdRef, {
        name: householdName,
        inviteCode,
        memberIds: [uid],
        createdBy: uid,
        createdAt: now,
        updatedAt: now,
      });

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
        householdId: householdRef.id,
        inviteCode,
        alreadyMember: false,
      };
    });

    if (result.alreadyMember) {
      return NextResponse.json(
        { error: "User is already in a household." },
        { status: 409 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create household.";
    const status = message === "Missing auth token." ? 401 : 500;
    logServerError("api.households.create", error, { status });
    return NextResponse.json(
      { error: status === 401 ? message : "Failed to create household." },
      { status },
    );
  }
}
