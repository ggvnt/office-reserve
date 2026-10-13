import {
  loginUser,
  LoginError,
} from "@/features/server/auth-service";

import { createSession } from "@/server/security/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");

  if (origin !== new URL(request.url).origin) {
    return Response.json(
      { message: "Request origin is not allowed." },
      { status: 403 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { message: "Invalid JSON request." },
      { status: 400 }
    );
  }

  try {
    const user = await loginUser(body);

    await createSession(user.id);

    return Response.json(
      {
        message: "Logged in successfully.",
        user,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    if (error instanceof LoginError) {
      return Response.json(
        { message: error.message },
        { status: error.status }
      );
    }

    console.error("Login failed:", error);

    return Response.json(
      { message: "Unable to log in. Please try again." },
      { status: 500 }
    );
  }
}