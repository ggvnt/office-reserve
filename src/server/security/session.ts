import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";

import {
  insertSession,
  findSessionUser,
  deleteSession,
} from "@/server/repositories/session-repository";

import type { PublicUser } from "@/models/user";

const COOKIE_NAME = "office_reserve_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(
  userId: string
): Promise<void> {
  const cookieStore = await cookies();

  // Login කරන විට කලින් browser session එක ඉවත් කරනවා.
  const existingToken = cookieStore.get(COOKIE_NAME)?.value;

  if (existingToken) {
    await deleteSession(hashToken(existingToken));
  }

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(
    Date.now() + SESSION_SECONDS * 1000
  );

  await insertSession(userId, tokenHash, expiresAt);

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token || !/^[0-9a-f]{64}$/.test(token)) {
    return null;
  }

  return findSessionUser(hashToken(token));
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    await deleteSession(hashToken(token));
  }

  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}