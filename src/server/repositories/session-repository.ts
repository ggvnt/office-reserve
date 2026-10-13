import "server-only";
import { db } from "@/server/db/pool";
import type { PublicUser } from "@/models/user";

export async function insertSession(
  userId: string,
  tokenHash: string,
  expiresAt: Date
): Promise<void> {
  await db.query(
    `INSERT INTO sessions (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );
}

export async function findSessionUser(
  tokenHash: string
): Promise<PublicUser | null> {
  const result = await db.query<PublicUser>(
    `SELECT u.id, u.name, u.email, u.role,
            u.is_active, u.created_at
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1
       AND s.expires_at > CURRENT_TIMESTAMP
       AND u.is_active = TRUE`,
    [tokenHash]
  );

  return result.rows[0] ?? null;
}

export async function deleteSession(
  tokenHash: string
): Promise<void> {
  await db.query(
    "DELETE FROM sessions WHERE token_hash = $1",
    [tokenHash]
  );
}