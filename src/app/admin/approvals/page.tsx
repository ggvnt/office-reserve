import Link from "next/link";
import { redirect } from "next/navigation";

import { UserRole } from "@/models/user";
import { getCurrentUser } from "@/server/security/session";

import {
  listPendingReservations,
} from "@/features/reservations/server/reservation-service";

import ReviewReservationForm from "@/features/reservations/components/ReviewReservationForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Colombo",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function ApprovalsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/Auth/login");
  }

  if (user.role !== UserRole.ADMIN) {
    redirect("/dashboard");
  }

  const reservations = await listPendingReservations();

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <Link
            href="/dashboard"
            className="text-sm text-blue-600 underline"
          >
            Back to dashboard
          </Link>

          <h1 className="mt-3 text-3xl font-bold">
            Booking approvals
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Times are shown in Sri Lanka time.
          </p>
        </header>

        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">
            Pending requests
          </h2>

          {reservations.length === 0 ? (
            <p className="mt-4 text-slate-600">
              No pending requests.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th scope="col" className="p-3">Resource</th>
                    <th scope="col" className="p-3">Employee</th>
                    <th scope="col" className="p-3">Purpose</th>
                    <th scope="col" className="p-3">Start</th>
                    <th scope="col" className="p-3">End</th>
                    <th scope="col" className="p-3">Review</th>
                  </tr>
                </thead>

                <tbody>
                  {reservations.map((reservation) => (
                    <tr
                      key={reservation.id}
                      className="border-b border-slate-100"
                    >
                      <td className="p-3 align-top font-medium">
                        {reservation.resource_name}
                      </td>

                      <td className="p-3 align-top">
                        <p>{reservation.booked_by_name}</p>
                        <p className="mt-1 text-slate-500">
                          {reservation.booked_by_email}
                        </p>
                      </td>

                      <td className="p-3 align-top">
                        {reservation.purpose}
                      </td>

                      <td className="p-3 align-top">
                        {formatDate(reservation.start_time)}
                      </td>

                      <td className="p-3 align-top">
                        {formatDate(reservation.end_time)}
                      </td>

                      <td className="p-3 align-top">
                        <ReviewReservationForm
                          reservationId={reservation.id}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}