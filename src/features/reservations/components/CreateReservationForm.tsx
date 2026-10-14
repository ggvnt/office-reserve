"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { createReservation } from "@/features/reservations/api/reservation-client";

interface ResourceOption {
  id: string;
  name: string;
  location: string;
  requires_approval: boolean;
}

interface Props {
  resources: ResourceOption[];
}

export default function CreateReservationForm({
  resources,
}: Props) {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const startTime = new Date(
      String(formData.get("start_time") ?? "")
    );

    const endTime = new Date(
      String(formData.get("end_time") ?? "")
    );

    setMessage("");
    setIsSuccess(false);

    if (
      Number.isNaN(startTime.getTime()) ||
      Number.isNaN(endTime.getTime())
    ) {
      setMessage("Select valid start and end times.");
      return;
    }

    if (startTime.getTime() <= Date.now()) {
      setMessage("Start time must be in the future.");
      return;
    }

    if (endTime <= startTime) {
      setMessage("End time must be after start time.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createReservation({
        resource_id: String(formData.get("resource_id") ?? ""),
        purpose: String(formData.get("purpose") ?? ""),
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
      });

      form.reset();
      setMessage(
        "Reservation created. Check My Reservations for its status."
      );
      setIsSuccess(true);
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to create reservation."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (resources.length === 0) {
    return (
      <section className="rounded-xl bg-white p-6 shadow">
        <p>No active resources are currently available.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <h2 className="text-xl font-semibold">
        Create a reservation
      </h2>

      <p className="mt-2 text-sm text-slate-600">
        Times use your device&apos;s local timezone.
        Availability is checked when you submit.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <fieldset disabled={isSubmitting} className="space-y-4">
          <div>
            <label
              htmlFor="booking-resource"
              className="block text-sm font-medium"
            >
              Resource
            </label>

            <select
              id="booking-resource"
              name="resource_id"
              required
              defaultValue=""
              className="mt-1 w-full rounded-lg border border-slate-300 p-3"
            >
              <option value="" disabled>
                Select a resource
              </option>

              {resources.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name} — {resource.location}
                  {resource.requires_approval
                    ? " (Approval required)"
                    : " (Instant confirmation)"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="booking-start"
              className="block text-sm font-medium"
            >
              Start date and time
            </label>

            <input
              id="booking-start"
              name="start_time"
              type="datetime-local"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 p-3"
            />
          </div>

          <div>
            <label
              htmlFor="booking-end"
              className="block text-sm font-medium"
            >
              End date and time
            </label>

            <input
              id="booking-end"
              name="end_time"
              type="datetime-local"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 p-3"
            />
          </div>

          <div>
            <label
              htmlFor="booking-purpose"
              className="block text-sm font-medium"
            >
              Purpose
            </label>

            <textarea
              id="booking-purpose"
              name="purpose"
              required
              minLength={3}
              maxLength={1000}
              rows={3}
              placeholder="Team planning meeting"
              className="mt-1 w-full rounded-lg border border-slate-300 p-3"
            />
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? "Booking…" : "Book resource"}
        </button>
      </form>

      <p
        role="status"
        className={`mt-4 text-sm ${
          isSuccess ? "text-green-700" : "text-red-700"
        }`}
      >
        {message}
      </p>
    </section>
  );
}