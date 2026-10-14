import type { ReviewDecision } from "@/models/reservation-review";

interface CreateReservationInput {
  resource_id: string;
  purpose: string;
  start_time: string;
  end_time: string;
}

interface ReviewReservationInput {
  decision: ReviewDecision;
  comment: string;
}

export async function createReservation(
  input: CreateReservationInput
): Promise<void> {
  const response = await fetch("/api/reservations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify(input),
  });

  const data: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : "Unable to create reservation.";

    throw new Error(message);
  }
}

export async function cancelReservation(id: string): Promise<void> {
  const response = await fetch(
    `/api/reservations/${encodeURIComponent(id)}/cancel`,
    {
      method: "POST",
      credentials: "same-origin",
    }
  );

  const data: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : "Unable to cancel reservation.";

    throw new Error(message);
  }
}

export async function reviewReservation(
  id: string,
  input: ReviewReservationInput
): Promise<void> {
  const response = await fetch(
    `/api/reservations/${encodeURIComponent(id)}/review`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify(input),
    }
  );

  const data: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : "Unable to review reservation.";

    throw new Error(message);
  }
}