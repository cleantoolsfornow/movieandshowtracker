export function getPostSignInPath(nextPath?: string | null): string {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/dashboard";
  }

  return nextPath.startsWith("//") ? "/dashboard" : nextPath;
}

export function getAuthErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Something went wrong. Please try again.";
  }

  switch (error.message) {
    case "Firebase: Error (auth/invalid-credential).":
      return "Email or password is incorrect.";
    case "Firebase: Error (auth/email-already-in-use).":
      return "This email is already in use.";
    case "Firebase: Error (auth/weak-password).":
      return "Password must be at least 6 characters.";
    default:
      return error.message;
  }
}
