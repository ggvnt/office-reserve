"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { ReviewDecision } from "@/models/reservation-review";
import { reviewReservation } from "@/features/reservations/api/reservation-client";

export default function ReviewReservationForm({
  reservationId,
}: {
  reservationId: string;
}) {
  const router = useRouter();

  const [comment, setComment] = useState("");
  const [decision, setDecision] = useState(ReviewDecision.APPROVED);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setIsSuccess(false);
    setIsSubmitting(true);

    try {
      await reviewReservation(reservationId, {
        decision,
        comment,
      });

      setMessage("Reservation reviewed successfully.");
      setIsSuccess(true);
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to review reservation."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="min-w-64 space-y-3">
      <fieldset disabled={isSubmitting} className="space-y-3">
        <div>
          <label
            htmlFor={`decision-${reservationId}`}
            className="block text-sm font-medium"
          >
            Decision
          </label>

          <select
            id={`decision-${reservationId}`}
            value={decision}
            onChange={(event) =>
              setDecision(
                event.target.value === ReviewDecision.REJECTED
                  ? ReviewDecision.REJECTED
                  : ReviewDecision.APPROVED
              )
            }
            className="mt-1 w-full rounded-lg border border-slate-300 p-2"
          >
            <option value={ReviewDecision.APPROVED}>Approve</option>
            <option value={ReviewDecision.REJECTED}>Reject</option>
          </select>
        </div>

        <div>
          <label
            htmlFor={`comment-${reservationId}`}
            className="block text-sm font-medium"
          >
            Comment (optional)
          </label>

          <textarea
            id={`comment-${reservationId}`}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={1000}
            rows={2}
            className="mt-1 w-full rounded-lg border border-slate-300 p-2"
          />
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`rounded-lg px-4 py-2 text-white disabled:opacity-50 ${
          decision === ReviewDecision.APPROVED
            ? "bg-green-700"
            : "bg-red-600"
        }`}
      >
        {isSubmitting
          ? "Saving…"
          : decision === ReviewDecision.APPROVED
            ? "Approve reservation"
            : "Reject reservation"}
      </button>

      <p
        role="status"
        className={`text-sm ${
          isSuccess ? "text-green-700" : "text-red-700"
        }`}
      >
        {message}
      </p>
    </form>
  );
}