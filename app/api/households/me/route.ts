import { NextRequest, NextResponse } from "next/server";

import { requireUidFromRequest } from "@/lib/auth/server-auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { logServerError } from "@/lib/server/logger";
import { getHouseholdIdForUid } from "@/lib/tracker/server";

type MemberSummary = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  avatarDataUrl: string | null;
};

export async function GET(request: NextRequest) {
  try {
    const uid = await requireUidFromRequest(request);
    const householdId = await getHouseholdIdForUid(uid);

    const householdRef = getAdminDb().collection("households").doc(householdId);
    const householdSnapshot = await householdRef.get();

    if (!householdSnapshot.exists) {
      return NextResponse.json({ error: "Household not found." }, { status: 404 });
    }

    const memberIds = ((householdSnapshot.get("memberIds") as string[] | undefined) ?? []).filter(
      (value): value is string => typeof value === "string",
    );

    const userSnapshots = await Promise.all(
      memberIds.map((memberId) => getAdminDb().collection("users").doc(memberId).get()),
    );

    const members: MemberSummary[] = userSnapshots
      .filter((snapshot) => snapshot.exists)
      .map((snapshot) => ({
        uid: snapshot.id,
        email: (snapshot.get("email") as string | null | undefined) ?? null,
        displayName: (snapshot.get("displayName") as string | null | undefined) ?? null,
        photoURL: (snapshot.get("photoURL") as string | null | undefined) ?? null,
        avatarDataUrl:
          (snapshot.get("avatarDataUrl") as string | null | undefined) ?? null,
      }));

    return NextResponse.json({
      household: {
        id: householdSnapshot.id,
        name: (householdSnapshot.get("name") as string | undefined) ?? "",
        inviteCode:
          (householdSnapshot.get("inviteCode") as string | undefined) ?? "",
        members,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load household.";
    const status =
      message === "Missing auth token."
        ? 401
        : message === "User has no household."
          ? 400
          : 500;
    logServerError("api.households.me", error, { status });

    return NextResponse.json(
      { error: status === 500 ? "Failed to load household." : message },
      { status },
    );
  }
}
