"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelReservation } from "@/features/reservations/api/reservation-client";

export default function CancelReservationButton({
  reservationId,
}: {
  reservationId: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleCancel() {
    if (!window.confirm("Cancel this reservation?")) {
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      await cancelReservation(reservationId);
      setMessage("Reservation cancelled.");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to cancel reservation."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleCancel}
        disabled={isSubmitting}
        className="rounded-lg bg-red-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? "Cancelling…" : "Cancel"}
      </button>

      <p role="status" className="mt-2 text-sm">
        {message}
      </p>
    </div>
  );
}