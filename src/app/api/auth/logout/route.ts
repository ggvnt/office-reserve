import { destroySession } from "@/server/security/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");

  if (origin !== new URL(request.url).origin) {
    return Response.json(
      { message: "Request origin is not allowed." },
      { status: 403 }
    );
  }

  try {
    await destroySession();

    return Response.json(
      { message: "Logged out successfully." },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Logout failed:", error);

    return Response.json(
      { message: "Unable to log out." },
      { status: 500 }
    );
  }
}