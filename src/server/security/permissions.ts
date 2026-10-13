import "server-only";

import { getCurrentUser } from "@/server/security/session";
import { UserRole, type PublicUser } from "@/models/user";

export class AuthorizationError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function requireUser(): Promise<PublicUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthorizationError(
      "Please log in to continue.",
      401
    );
  }

  return user;
}

export async function requireAdmin(): Promise<PublicUser> {
  const user = await requireUser();

  if (user.role !== UserRole.ADMIN) {
    throw new AuthorizationError(
      "Admin access is required.",
      403
    );
  }

  return user;
}