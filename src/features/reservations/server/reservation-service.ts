import "server-only";

import { db } from "@/server/db/pool";
import { requireUser , requireAdmin } from "@/server/security/permissions";

import {
  findReservationsByUser,
  findConfirmedOverlap,
  createReservation,
  cancelOwnReservation,
  findPendingReservations,
  findReservationForUpdate,
  saveReservationReview,
  type PendingReservation,
} from "@/server/repositories/reservation-repository";

import {
  ReservationStatus,
  type Reservation,
} from "@/models/reservation";

import { ReviewDecision } from "@/models/reservation-review";

import {
  ResourceStatus,
  type Resource,
} from "@/models/resource";


export class ReservationError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ReservationError";
  }
}

export interface MyReservation extends Reservation {
  can_cancel: boolean;
}

export async function listMyReservations(): Promise<MyReservation[]> {
  const user = await requireUser();
  const reservations = await findReservationsByUser(user.id);
  const now = Date.now();

  return reservations.map((reservation) => ({
    ...reservation,
    can_cancel:
      (reservation.status === ReservationStatus.PENDING ||
        reservation.status === ReservationStatus.CONFIRMED) &&
      reservation.start_time.getTime() > now,
  }));
}

export async function addReservation(
  input: unknown
): Promise<Reservation> {
  const user = await requireUser();

  if (
    typeof input !== "object" ||
    input === null ||
    !("resource_id" in input) ||
    typeof input.resource_id !== "string" ||
    !("purpose" in input) ||
    typeof input.purpose !== "string" ||
    !("start_time" in input) ||
    typeof input.start_time !== "string" ||
    !("end_time" in input) ||
    typeof input.end_time !== "string"
  ) {
    throw new ReservationError(
      "Resource, purpose, start time and end time are required.",
      400
    );
  }

  const resourceId = input.resource_id.trim();
  const purpose = input.purpose.trim();

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(resourceId)) {
    throw new ReservationError("Invalid resource ID.", 400);
  }

  if (purpose.length < 3 || purpose.length > 1000) {
    throw new ReservationError(
      "Purpose must contain 3–1000 characters.",
      400
    );
  }

  // Timezone එක පැහැදිලිව තිබිය යුතුයි: Z හෝ +05:30 වගේ.
  const timePattern =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/;

  if (
    !timePattern.test(input.start_time) ||
    !timePattern.test(input.end_time)
  ) {
    throw new ReservationError(
      "Provide date/time values with a timezone.",
      400
    );
  }

  const startTime = new Date(input.start_time);
  const endTime = new Date(input.end_time);

  if (
    Number.isNaN(startTime.getTime()) ||
    Number.isNaN(endTime.getTime())
  ) {
    throw new ReservationError("Invalid date/time.", 400);
  }

  if (endTime <= startTime) {
    throw new ReservationError(
      "End time must be after start time.",
      400
    );
  }

  if (startTime.getTime() <= Date.now()) {
    throw new ReservationError(
      "Booking start time must be in the future.",
      400
    );
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // එකම resource එකේ booking operations අනුපිළිවෙළට කරනවා.
    const result = await client.query<Resource>(
      `SELECT id, status, requires_approval
       FROM resources
       WHERE id = $1
       FOR UPDATE`,
      [resourceId]
    );

    const resource = result.rows[0];

    if (!resource) {
      throw new ReservationError("Resource not found.", 404);
    }

    if (resource.status !== ResourceStatus.ACTIVE) {
      throw new ReservationError(
        "This resource is currently unavailable for bookings.",
        409
      );
    }

    if (startTime.getTime() <= Date.now()) {
      throw new ReservationError(
        "Booking start time must be in the future.",
        400
      );
    }

    const overlaps = await findConfirmedOverlap(
      client,
      resource.id,
      startTime,
      endTime
    );

    if (overlaps) {
      throw new ReservationError(
        "This resource already has a confirmed booking at that time.",
        409
      );
    }

    const reservation = await createReservation(client, {
      resource_id: resource.id,
      user_id: user.id,
      purpose,
      start_time: startTime,
      end_time: endTime,
      status: resource.requires_approval
        ? ReservationStatus.PENDING
        : ReservationStatus.CONFIRMED,
    });

    await client.query("COMMIT");

    return reservation;
  } catch (error) {
    await client.query("ROLLBACK");

    // Database exclusion constraint එකෙන් overlap එකක් වැළැක්වූ විට.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23P01"
    ) {
      throw new ReservationError(
        "This resource already has a confirmed booking at that time.",
        409
      );
    }

    throw error;
  } finally {
    client.release();
  }
}

export async function cancelReservation(
  id: string
): Promise<Reservation> {
  const user = await requireUser();

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(id)) {
    throw new ReservationError(
      "Invalid reservation ID.",
      400
    );
  }

  const reservation = await cancelOwnReservation(id, user.id);

  if (!reservation) {
    throw new ReservationError(
      "Reservation was not found or cannot be cancelled.",
      409
    );
  }

  return reservation;
}

export async function listPendingReservations(): Promise<
  PendingReservation[]
> {
  await requireAdmin();

  return findPendingReservations();
}

export async function reviewReservation(
  id: string,
  input: unknown
): Promise<Reservation> {
  const admin = await requireAdmin();

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(id)) {
    throw new ReservationError("Invalid reservation ID.", 400);
  }

  if (
    typeof input !== "object" ||
    input === null ||
    !("decision" in input)
  ) {
    throw new ReservationError(
      "An approval or rejection decision is required.",
      400
    );
  }

  let decision: ReviewDecision;

  if (input.decision === ReviewDecision.APPROVED) {
    decision = ReviewDecision.APPROVED;
  } else if (input.decision === ReviewDecision.REJECTED) {
    decision = ReviewDecision.REJECTED;
  } else {
    throw new ReservationError("Invalid review decision.", 400);
  }

  let comment: string | null = null;

  if (
    "comment" in input &&
    input.comment !== null &&
    input.comment !== undefined
  ) {
    if (typeof input.comment !== "string") {
      throw new ReservationError("Comment must be text.", 400);
    }

    comment = input.comment.trim() || null;

    if (comment && comment.length > 1000) {
      throw new ReservationError(
        "Comment must not exceed 1000 characters.",
        400
      );
    }
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const lookup = await client.query<{ resource_id: string }>(
      "SELECT resource_id FROM reservations WHERE id = $1",
      [id]
    );

    const booking = lookup.rows[0];

    if (!booking) {
      throw new ReservationError("Reservation not found.", 404);
    }

    // Booking creation සහ review දෙකම resource එක මුලින් lock කරනවා.
    const resourceResult = await client.query<{
      id: string;
      status: ResourceStatus;
    }>(
      `SELECT id, status
       FROM resources
       WHERE id = $1
       FOR UPDATE`,
      [booking.resource_id]
    );

    const resource = resourceResult.rows[0];

    if (!resource) {
      throw new ReservationError("Resource not found.", 404);
    }

    const reservation = await findReservationForUpdate(client, id);

    if (!reservation) {
      throw new ReservationError("Reservation not found.", 404);
    }

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new ReservationError(
        "Only pending reservations can be reviewed.",
        409
      );
    }

    if (decision === ReviewDecision.APPROVED) {
      if (resource.status !== ResourceStatus.ACTIVE) {
        throw new ReservationError(
          "This resource is not active.",
          409
        );
      }

      if (reservation.start_time.getTime() <= Date.now()) {
        throw new ReservationError(
          "A reservation that has already started cannot be approved.",
          409
        );
      }

      const overlaps = await findConfirmedOverlap(
        client,
        reservation.resource_id,
        reservation.start_time,
        reservation.end_time
      );

      if (overlaps) {
        throw new ReservationError(
          "A confirmed booking already overlaps this reservation.",
          409
        );
      }
    }

    const updated = await saveReservationReview(client, {
      reservation_id: reservation.id,
      reviewer_id: admin.id,
      decision,
      status:
        decision === ReviewDecision.APPROVED
          ? ReservationStatus.CONFIRMED
          : ReservationStatus.REJECTED,
      comment,
    });

    if (!updated) {
      throw new ReservationError(
        "This reservation is no longer pending.",
        409
      );
    }

    await client.query("COMMIT");

    return updated;
  } catch (error) {
    await client.query("ROLLBACK");

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23P01"
    ) {
      throw new ReservationError(
        "A confirmed booking already overlaps this reservation.",
        409
      );
    }

    throw error;
  } finally {
    client.release();
  }
}