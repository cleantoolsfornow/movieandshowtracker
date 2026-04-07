import "server-only";

export function logServerError(
  context: string,
  error: unknown,
  extra?: Record<string, unknown>,
) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error(
    JSON.stringify({
      level: "error",
      context,
      message,
      stack,
      ...extra,
    }),
  );
}
