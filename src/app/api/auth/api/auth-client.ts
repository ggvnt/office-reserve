import type {
  RegisterInput,
  RegisterResult,
} from "@/features/auth/types";

export async function registerUser(
  input: RegisterInput
): Promise<RegisterResult> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data: unknown = await response.json();

  if (
    typeof data !== "object" ||
    data === null ||
    !("message" in data) ||
    typeof data.message !== "string"
  ) {
    throw new Error("Unexpected server response.");
  }

  return {
    success: response.ok,
    message: data.message,
  };
}