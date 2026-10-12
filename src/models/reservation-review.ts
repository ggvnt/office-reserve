export enum ReviewDecision {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface ReservationReview {
  id: string;
  reservation_id: string;
  reviewer_id: string;
  decision: ReviewDecision;
  comment: string | null;
  reviewed_at: Date;
}