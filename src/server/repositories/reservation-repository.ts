import "server-only";

import type { PoolClient } from "pg";
import { db } from "@/server/db/pool";
import type { ReviewDecision } from "@/models/reservation-review";

import type {
  Reservation,
  ReservationStatus,
} from "@/models/reservation";

interface CreateReservationInput {
  resource_id: string;
  user_id: string;
  purpose: string;
  start_time: Date;
  end_time: Date;
  status: ReservationStatus;
}

interface ReviewReservationInput {
  reservation_id: string;
  reviewer_id: string;
  decision: ReviewDecision;
  status: ReservationStatus;
  comment: string | null;
}

export interface PendingReservation extends Reservation {
  resource_name: string;
  booked_by_name: string;
  booked_by_email: string;
}

export interface ResourceBooking {
  id: string;
  start_time: Date;
  end_time: Date;
}

export async function createReservation(
  client: PoolClient,
  input: CreateReservationInput
): Promise<Reservation> {
  const result = await client.query<Reservation>(
    `INSERT INTO reservations (
       resource_id, user_id, purpose,
       start_time, end_time, status
     )
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, resource_id, user_id, purpose,
               start_time, end_time, status,
               created_at, updated_at`,
    [
      input.resource_id,
      input.user_id,
      input.purpose,
      input.start_time,
      input.end_time,
      input.status,
    ]
  );

  return result.rows[0];
}

export async function findReservationsByUser(
  userId: string
): Promise<Reservation[]> {
  const result = await db.query<Reservation>(
    `SELECT id, resource_id, user_id, purpose,
            start_time, end_time, status,
            created_at, updated_at
     FROM reservations
     WHERE user_id = $1
     ORDER BY start_time DESC`,
    [userId]
  );

  return result.rows;
}

export async function findConfirmedOverlap(
  client: PoolClient,
  resourceId: string,
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  const result = await client.query(
    `SELECT 1
     FROM reservations
     WHERE resource_id = $1
       AND status = 'CONFIRMED'
       AND start_time < $3
       AND end_time > $2
     LIMIT 1`,
    [resourceId, startTime, endTime]
  );

  return result.rows.length > 0;
}

export async function cancelOwnReservation(
  id: string,
  userId: string
): Promise<Reservation | null> {
  const result = await db.query<Reservation>(
    `UPDATE reservations
     SET status = 'CANCELLED'
     WHERE id = $1
       AND user_id = $2
       AND status IN ('PENDING', 'CONFIRMED')
       AND start_time > CURRENT_TIMESTAMP
     RETURNING id, resource_id, user_id, purpose,
               start_time, end_time, status,
               created_at, updated_at`,
    [id, userId]
  );

  return result.rows[0] ?? null;
}


export async function findPendingReservations(): Promise<
  PendingReservation[]
> {
  const result = await db.query<PendingReservation>(
    `SELECT
       r.id, r.resource_id, r.user_id, r.purpose,
       r.start_time, r.end_time, r.status,
       r.created_at, r.updated_at,
       res.name AS resource_name,
       u.name AS booked_by_name,
       u.email AS booked_by_email
     FROM reservations r
     JOIN resources res ON res.id = r.resource_id
     JOIN users u ON u.id = r.user_id
     WHERE r.status = 'PENDING'
     ORDER BY r.start_time ASC`
  );

  return result.rows;
}

export async function findReservationForUpdate(
  client: PoolClient,
  id: string
): Promise<Reservation | null> {
  const result = await client.query<Reservation>(
    `SELECT id, resource_id, user_id, purpose,
            start_time, end_time, status,
            created_at, updated_at
     FROM reservations
     WHERE id = $1
     FOR UPDATE`,
    [id]
  );

  return result.rows[0] ?? null;
}



export async function saveReservationReview(
  client: PoolClient,
  input: ReviewReservationInput
): Promise<Reservation | null> {
  const result = await client.query<Reservation>(
    `UPDATE reservations
     SET status = $1
     WHERE id = $2
       AND status = 'PENDING'
     RETURNING id, resource_id, user_id, purpose,
               start_time, end_time, status,
               created_at, updated_at`,
    [input.status, input.reservation_id]
  );

  const reservation = result.rows[0];

  if (!reservation) {
    return null;
  }

  await client.query(
    `INSERT INTO reservation_reviews (
       reservation_id, reviewer_id, decision, comment
     )
     VALUES ($1, $2, $3, $4)`,
    [
      input.reservation_id,
      input.reviewer_id,
      input.decision,
      input.comment,
    ]
  );

  return reservation;
}

export async function findUpcomingResourceBookings(
  resourceId: string
): Promise<ResourceBooking[]> {
  const result = await db.query<ResourceBooking>(
    `SELECT id, start_time, end_time
     FROM reservations
     WHERE resource_id = $1
       AND status = 'CONFIRMED'
       AND end_time > CURRENT_TIMESTAMP
     ORDER BY start_time ASC`,
    [resourceId]
  );

  return result.rows;
}