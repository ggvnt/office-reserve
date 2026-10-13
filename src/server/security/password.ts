import "server-only";
import { randomBytes, scrypt ,timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

export async function hashPassword(
  password: string
): Promise<string> {
  const salt = randomBytes(16).toString("hex");

  const hash = (await scryptAsync(
    password,
    salt,
    64
  )) as Buffer;

  return `scrypt:${salt}:${hash.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const parts = storedHash.split(":");

  if (parts.length !== 3) {
    return false;
  }

  const [algorithm, salt, hashHex] = parts;

  if (
    algorithm !== "scrypt" ||
    !/^[0-9a-f]{32}$/i.test(salt) ||
    !/^[0-9a-f]{128}$/i.test(hashHex)
  ) {
    return false;
  }

  const storedBuffer = Buffer.from(hashHex, "hex");

  const suppliedBuffer = (await scryptAsync(
    password,
    salt,
    64
  )) as Buffer;

  return timingSafeEqual(storedBuffer, suppliedBuffer);
}