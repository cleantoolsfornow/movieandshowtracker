import { getCurrentIdToken } from "@/lib/auth/auth-client";

type HouseholdApiResponse = {
  householdId: string;
  inviteCode: string;
};

async function postAuthed<TRequest extends Record<string, unknown>>(
  path: string,
  payload: TRequest,
): Promise<HouseholdApiResponse> {
  const idToken = await getCurrentIdToken();

  const response = await fetch(path, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as
    | HouseholdApiResponse
    | { error?: string };

  if (!response.ok) {
    throw new Error(
      "error" in data && data.error ? data.error : "Request failed.",
    );
  }

  if (!("householdId" in data) || !("inviteCode" in data)) {
    throw new Error("Invalid server response.");
  }

  return data;
}

export async function createHouseholdViaApi(
  householdName: string,
): Promise<HouseholdApiResponse> {
  return postAuthed("/api/households/create", { householdName });
}

export async function joinHouseholdViaApi(
  inviteCode: string,
): Promise<HouseholdApiResponse> {
  return postAuthed("/api/households/join", { inviteCode });
}
