import "server-only";
import { hashPassword } from "@/server/security/password";
import { createUser } from "@/server/repositories/user-repository";
import type { PublicUser } from "@/models/user";

export class RegistrationError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "RegistrationError";
  }
}

export async function registerEmployee(
  input: unknown
): Promise<PublicUser> {
  if (
    typeof input !== "object" ||
    input === null ||
    !("name" in input) ||
    !("email" in input) ||
    !("password" in input) ||
    typeof input.name !== "string" ||
    typeof input.email !== "string" ||
    typeof input.password !== "string"
  ) {
    throw new RegistrationError(
      "Name, email and password are required.",
      400
    );
  }

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (name.length < 2 || name.length > 100) {
    throw new RegistrationError(
      "Name must contain 2–100 characters.",
      400
    );
  }

  if (
    email.length > 255 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw new RegistrationError(
      "Enter a valid email address.",
      400
    );
  }

  if (password.length < 12 || password.length > 128) {
    throw new RegistrationError(
      "Password must contain 12–128 characters.",
      400
    );
  }

  const passwordHash = await hashPassword(password);

  try {
    return await createUser({
      name,
      email,
      passwordHash,
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      throw new RegistrationError(
        "An account with this email already exists.",
        409
      );
    }

    throw error;
  }
}