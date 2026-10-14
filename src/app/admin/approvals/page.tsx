import Link from "next/link";
import { redirect } from "next/navigation";

import { UserRole } from "@/models/user";
import { getCurrentUser } from "@/server/security/session";

import { listPendingReservations } from "@/features/reservations/server/reservation-service";
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

  const navLink =
    "rounded-lg px-4 py-3 text-sm text-slate-300 hover:bg-white/10 hover:text-white";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
      <aside className="bg-slate-950 p-6 text-white lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0">
        <Link href="/dashboard" className="text-xl font-bold">
          Office<span className="text-blue-400">Reserve</span>
        </Link>

        <nav
          aria-label="Workspace navigation"
          className="mt-8 flex flex-col gap-2"
        >
          <Link href="/dashboard" className={navLink}>
            Overview
          </Link>

          <Link href="/resources" className={navLink}>
            Browse resources
          </Link>

          <Link href="/reservations" className={navLink}>
            My reservations
          </Link>

          <p className="mt-5 px-4 text-xs uppercase tracking-wider text-slate-400">
            Administration
          </p>

          <Link href="/admin/categories" className={navLink}>
            Categories
          </Link>

          <Link href="/admin/resources" className={navLink}>
            Resources
          </Link>

          <Link
            href="/admin/approvals"
            aria-current="page"
            className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium"
          >
            Booking approvals
          </Link>
        </nav>
      </aside>

      <main className="min-w-0 flex-1 p-6 lg:p-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <header>
            <h1 className="text-3xl font-bold tracking-tight">
              Booking approvals
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Review booking requests. Times are shown in Sri Lanka time.
            </p>
          </header>

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">
                Pending requests
              </h2>

              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                {reservations.length} pending
              </span>
            </div>

            {reservations.length === 0 ? (
              <div className="mt-6 rounded-lg bg-slate-50 p-8 text-center">
                <p className="font-medium">All caught up</p>
                <p className="mt-2 text-sm text-slate-500">
                  No pending booking requests to review.
                </p>
              </div>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th scope="col" className="p-3">Resource</th>
                      <th scope="col" className="p-3">Requested by</th>
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
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >
                        <td className="p-3 align-top font-medium">
                          {reservation.resource_name}
                        </td>

                        <td className="p-3 align-top">
                          <p className="font-medium">
                            {reservation.booked_by_name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {reservation.booked_by_email}
                          </p>
                        </td>

                        <td className="p-3 align-top text-slate-600">
                          {reservation.purpose}
                        </td>

                        <td className="whitespace-nowrap p-3 align-top">
                          {formatDate(reservation.start_time)}
                        </td>

                        <td className="whitespace-nowrap p-3 align-top">
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
    </div>
  );
}