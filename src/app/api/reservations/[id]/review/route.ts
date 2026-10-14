import {
  reviewReservation,
  ReservationError,
} from "@/features/reservations/server/reservation-service";

import {
  AuthorizationError,
} from "@/server/security/permissions";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
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
    const { id } = await context.params;
    const reservation = await reviewReservation(id, body);

    return Response.json({
      message: "Reservation reviewed successfully.",
      reservation,
    });
  } catch (error) {
    if (
      error instanceof ReservationError ||
      error instanceof AuthorizationError
    ) {
      return Response.json(
        { message: error.message },
        { status: error.status }
      );
    }

    console.error("Reservation review failed:", error);

    return Response.json(
      { message: "Unable to review reservation." },
      { status: 500 }
    );
  }
}