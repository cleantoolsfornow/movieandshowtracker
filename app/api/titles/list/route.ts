import { NextRequest, NextResponse } from "next/server";

import { requireUidFromRequest } from "@/lib/auth/server-auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { logServerError } from "@/lib/server/logger";
import { mapTitleRecord, getHouseholdIdForUid } from "@/lib/tracker/server";
import type { TitleRecord } from "@/lib/tracker/types";

function filterRecords(
  records: TitleRecord[],
  params: URLSearchParams,
): TitleRecord[] {
  const mediaType = params.get("mediaType");
  const watchedBy = params.get("watchedBy");
  const wantBy = params.get("wantBy");

  return records.filter((record) => {
    if (mediaType && mediaType !== "all" && record.title.mediaType !== mediaType) {
      return false;
    }

    if (watchedBy && watchedBy !== "all") {
      if (!record.status.watchedBy[watchedBy as keyof typeof record.status.watchedBy]) {
        return false;
      }
    }

    if (wantBy && wantBy !== "all") {
      if (!record.status.wantToWatchBy[wantBy as keyof typeof record.status.wantToWatchBy]) {
        return false;
      }
    }

    return true;
  });
}

function sortRecords(records: TitleRecord[], sortBy: string | null): TitleRecord[] {
  const copied = [...records];

  switch (sortBy) {
    case "alpha":
      copied.sort((a, b) => a.title.title.localeCompare(b.title.title));
      break;
    case "release":
      copied.sort((a, b) => (b.title.releaseYear ?? 0) - (a.title.releaseYear ?? 0));
      break;
    case "updated":
    default:
      copied.sort((a, b) => {
        const aDate = a.title.updatedAt ?? "";
        const bDate = b.title.updatedAt ?? "";
        return bDate.localeCompare(aDate);
      });
      break;
  }

  return copied;
}

export async function GET(request: NextRequest) {
  try {
    const uid = await requireUidFromRequest(request);
    const householdId = await getHouseholdIdForUid(uid);

    const titleSnapshots = await getAdminDb()
      .collection("titles")
      .where("householdId", "==", householdId)
      .limit(250)
      .get();

    const titleIds = titleSnapshots.docs.map((doc) => doc.id);

    const statusSnapshots = await Promise.all(
      titleIds.map((titleId) => getAdminDb().collection("titleStatuses").doc(titleId).get()),
    );

    const statusMap = new Map(statusSnapshots.map((snapshot) => [snapshot.id, snapshot]));

    const records = titleSnapshots.docs.map((titleSnapshot) =>
      mapTitleRecord(titleSnapshot, statusMap.get(titleSnapshot.id)),
    );

    const filtered = filterRecords(records, request.nextUrl.searchParams);
    const sorted = sortRecords(filtered, request.nextUrl.searchParams.get("sort"));

    return NextResponse.json({ records: sorted });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load titles.";
    const status = message === "Missing auth token." ? 401 : 500;
    logServerError("api.titles.list", error, { status });
    return NextResponse.json(
      { error: status === 401 ? message : "Failed to load titles." },
      { status },
    );
  }
}
