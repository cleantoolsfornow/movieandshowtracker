const INVITE_LENGTH = 12;

export function normalizeInviteCode(input: string): string {
  return input.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

export function isValidInviteCode(input: string): boolean {
  return /^[A-Z2-9]{12}$/.test(normalizeInviteCode(input));
}

export function formatInviteCode(input: string): string {
  const normalized = normalizeInviteCode(input);
  if (normalized.length !== INVITE_LENGTH) {
    return normalized;
  }

  return `${normalized.slice(0, 4)}-${normalized.slice(4, 8)}-${normalized.slice(8)}`;
}
