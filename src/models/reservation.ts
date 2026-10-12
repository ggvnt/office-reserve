export enum ReservationStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export interface Reservation {
  id: string;
  resource_id: string;
  user_id: string;
  purpose: string;
  start_time: Date;
  end_time: Date;
  status: ReservationStatus;
  created_at: Date;
  updated_at: Date;
}