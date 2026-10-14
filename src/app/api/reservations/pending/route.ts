import {
  listPendingReservations,
} from "@/features/reservations/server/reservation-service";

import {
  AuthorizationError,
} from "@/server/security/permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const reservations = await listPendingReservations();

    return Response.json(
      { reservations },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return Response.json(
        { message: error.message },
        { status: error.status }
      );
    }

    console.error("Pending reservations request failed:", error);

    return Response.json(
      { message: "Unable to load pending reservations." },
      { status: 500 }
    );
  }
}