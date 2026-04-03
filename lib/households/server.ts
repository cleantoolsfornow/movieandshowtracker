import "server-only";

import { randomBytes } from "node:crypto";

const INVITE_LENGTH = 12;
const INVITE_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateSecureInviteCode(): string {
  const bytes = randomBytes(INVITE_LENGTH);
  let output = "";

  for (let i = 0; i < INVITE_LENGTH; i += 1) {
    output += INVITE_CHARSET[bytes[i] % INVITE_CHARSET.length];
  }

  return output;
}
