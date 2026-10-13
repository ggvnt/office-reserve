import "server-only";
import { db } from "@/server/db/pool";
import type { user, PublicUser } from "@/models/user";

interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
}

export async function createUser(
  input: CreateUserInput
): Promise<PublicUser> {
  const result = await db.query<PublicUser>(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'EMPLOYEE')
     RETURNING id, name, email, role, is_active, created_at`,
    [
      input.name,
      input.email,
      input.passwordHash,
    ]
  );

  return result.rows[0];
}

export async function findUserByEmail(
  email: string
): Promise<user | null> {
  const result = await db.query<user>(
    `SELECT id, name, email, password_hash,
            role, is_active, created_at
     FROM users
     WHERE LOWER(email) = $1`,
    [email.trim().toLowerCase()]
  );

  return result.rows[0] ?? null;
}