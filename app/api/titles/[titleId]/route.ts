import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireUidFromRequest } from "@/lib/auth/server-auth";
import { logServerError } from "@/lib/server/logger";
import {
  applyStatusPatch,
  getHouseholdIdForUid,
  getTitleRecordById,
} from "@/lib/tracker/server";

const patchSchema = z.object({
  watchedBy: z
    .object({
      matt: z.boolean().optional(),
      jessica: z.boolean().optional(),
      together: z.boolean().optional(),
    })
    .optional(),
  wantToWatchBy: z
    .object({
      matt: z.boolean().optional(),
      jessica: z.boolean().optional(),
      together: z.boolean().optional(),
    })
    .optional(),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ titleId: string }> },
) {
  try {
    const uid = await requireUidFromRequest(request);
    const householdId = await getHouseholdIdForUid(uid);
    const { titleId } = await context.params;

    const record = await getTitleRecordById(householdId, titleId);
    if (!record) {
      return NextResponse.json({ error: "Title not found." }, { status: 404 });
    }

    return NextResponse.json({ record });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load title.";
    const status =
      message === "Missing auth token."
        ? 401
        : message === "Forbidden."
          ? 403
          : 500;
    logServerError("api.titles.get", error, { status });
    return NextResponse.json(
      {
        error:
          status === 500 ? "Failed to load title." : message,
      },
      { status },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ titleId: string }> },
) {
  try {
    const uid = await requireUidFromRequest(request);
    const householdId = await getHouseholdIdForUid(uid);
    const { titleId } = await context.params;

    const patch = patchSchema.parse(await request.json());
    const record = await applyStatusPatch(householdId, titleId, patch);

    return NextResponse.json({ record });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update status.";
    const status =
      message === "Missing auth token."
        ? 401
        : message === "Forbidden."
          ? 403
          : message === "Title not found."
            ? 404
            : 500;
    logServerError("api.titles.patch", error, { status });

    return NextResponse.json(
      {
        error:
          status === 500 ? "Failed to update status." : message,
      },
      { status },
    );
  }
}
