import {
  listMyReservations,
  addReservation,
  ReservationError,
} from "@/features/reservations/server/reservation-service";

import {
  AuthorizationError,
} from "@/server/security/permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function handleError(error: unknown): Response {
  if (
    error instanceof ReservationError ||
    error instanceof AuthorizationError
  ) {
    return Response.json(
      { message: error.message },
      { status: error.status }
    );
  }

  console.error("Reservations request failed:", error);

  return Response.json(
    { message: "Unable to process the request." },
    { status: 500 }
  );
}



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
    const reservation = await addReservation(body);

    return Response.json(
      {
        message: "Reservation created successfully.",
        reservation,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function GET() {
  try {
    const reservations = await listMyReservations();

    return Response.json(
      { reservations },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return handleError(error);
  }
}