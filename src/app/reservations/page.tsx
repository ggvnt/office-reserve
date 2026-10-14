import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/server/security/session";
import { ResourceStatus } from "@/models/resource";

import { listResources } from "@/features/resources/server/resource-service";
import { listMyReservations } from "@/features/reservations/server/reservation-service";

import CreateReservationForm from "@/features/reservations/components/CreateReservationForm";
// import { ReservationStatus } from "@/models/reservation";
import CancelReservationButton from "@/features/reservations/components/CancelReservationButton";
import { ReservationStatus } from "@/models/reservation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Colombo",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

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
    resources.map((resource) => [resource.id, resource.name]),
  );

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <Link href="/dashboard" className="text-sm text-blue-600 underline">
            Back to dashboard
          </Link>

          <h1 className="mt-3 text-3xl font-bold">Reservations</h1>
        </header>

        <CreateReservationForm resources={activeResources} />

        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">My reservations</h2>

          <p className="mt-2 text-sm text-slate-600">
            Booking times below are shown in Sri Lanka time.
          </p>

          {reservations.length === 0 ? (
            <p className="mt-4 text-slate-600">You have no reservations yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th scope="col" className="p-3">
                      Resource
                    </th>
                    <th scope="col" className="p-3">
                      Purpose
                    </th>
                    <th scope="col" className="p-3">
                      Start
                    </th>
                    <th scope="col" className="p-3">
                      End
                    </th>
                    <th scope="col" className="p-3">
                      Status
                    </th>
                    <th scope="col" className="p-3">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {reservations.map((reservation) => (
                    <tr
                      key={reservation.id}
                      className="border-b border-slate-100"
                    >
                      <td className="p-3 font-medium">
                        {resourceNames.get(reservation.resource_id) ?? "—"}
                      </td>

                      <td className="p-3">{reservation.purpose}</td>

                      <td className="p-3">
                        {formatDate(reservation.start_time)}
                      </td>

                      <td className="p-3">
                        {formatDate(reservation.end_time)}
                      </td>

                      <td className="p-3">{reservation.status}</td>
                      <td className="p-3">
                        {reservation.can_cancel ? (
                          <CancelReservationButton
                            reservationId={reservation.id}
                          />
                        ) : (
                          <span className="text-slate-500">—</span>
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
  );
}
