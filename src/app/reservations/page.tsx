import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/server/security/session";
import { ResourceStatus } from "@/models/resource";
import { UserRole } from "@/models/user";

import { listResources } from "@/features/resources/server/resource-service";
import { listMyReservations } from "@/features/reservations/server/reservation-service";

import CreateReservationForm from "@/features/reservations/components/CreateReservationForm";
import CancelReservationButton from "@/features/reservations/components/CancelReservationButton";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Colombo",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-600",
};

export default async function ReservationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/Auth/login");
  }

  const [resources, reservations] = await Promise.all([
    listResources(),
    listMyReservations(),
  ]);

  const activeResources = resources
    .filter((resource) => resource.status === ResourceStatus.ACTIVE)
    .map((resource) => ({
      id: resource.id,
      name: resource.name,
      location: resource.location,
      requires_approval: resource.requires_approval,
    }));

  const resourceNames = new Map(
    resources.map((resource) => [resource.id, resource.name])
  );

  const navLink =
    "rounded-lg px-4 py-3 text-sm text-slate-300 hover:bg-white/10 hover:text-white";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
      <aside className="bg-slate-950 p-6 text-white lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0">
        <Link href="/dashboard" className="text-xl font-bold">
          Office<span className="text-blue-400">Reserve</span>
        </Link>

        <nav className="mt-8 flex flex-col gap-2">
          <Link href="/dashboard" className={navLink}>
            Overview
          </Link>

          <Link href="/resources" className={navLink}>
            Browse resources
          </Link>

          <Link
            href="/reservations"
            aria-current="page"
            className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium"
          >
            My reservations
          </Link>

          {user.role === UserRole.ADMIN && (
            <>
              <p className="mt-5 px-4 text-xs uppercase tracking-wider text-slate-400">
                Administration
              </p>

              <Link href="/admin/categories" className={navLink}>
                Categories
              </Link>

              <Link href="/admin/resources" className={navLink}>
                Resources
              </Link>

              <Link href="/admin/approvals" className={navLink}>
                Booking approvals
              </Link>
            </>
          )}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 p-6 lg:p-10">
        <div className="mx-auto max-w-6xl space-y-6">
          <header>
            <h1 className="text-3xl font-bold tracking-tight">
              Reservations
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Book a resource and manage your reservations.
            </p>
          </header>

          <CreateReservationForm resources={activeResources} />

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-semibold">
              My reservations
            </h2>


            {reservations.length === 0 ? (
              <p className="mt-6 rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">
                No reservations yet. Create one using the form above.
              </p>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th scope="col" className="p-3">Resource</th>
                      <th scope="col" className="p-3">Purpose</th>
                      <th scope="col" className="p-3">Start</th>
                      <th scope="col" className="p-3">End</th>
                      <th scope="col" className="p-3">Status</th>
                      <th scope="col" className="p-3">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {reservations.map((reservation) => (
                      <tr
                        key={reservation.id}
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >
                        <td className="p-3 font-medium">
                          {resourceNames.get(reservation.resource_id) ?? "—"}
                        </td>

                        <td className="p-3">
                          {reservation.purpose}
                        </td>

                        <td className="whitespace-nowrap p-3">
                          {formatDate(reservation.start_time)}
                        </td>

                        <td className="whitespace-nowrap p-3">
                          {formatDate(reservation.end_time)}
                        </td>

                        <td className="p-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              statusStyles[reservation.status] ??
                              "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {reservation.status}
                          </span>
                        </td>

                        <td className="p-3">
                          {reservation.can_cancel ? (
                            <CancelReservationButton
                              reservationId={reservation.id}
                            />
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
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