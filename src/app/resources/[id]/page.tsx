import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ResourceStatus } from "@/models/resource";
import { getCurrentUser } from "@/server/security/session";

import {
  getResourceAvailability,
  ResourceError,
  type ResourceAvailability,
} from "@/features/resources/server/resource-service";

import CreateReservationForm from "@/features/reservations/components/CreateReservationForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Colombo",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function ResourceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/Auth/login");
  }

  const { id } = await params;
  let availability: ResourceAvailability;

  try {
    availability = await getResourceAvailability(id);
  } catch (error) {
    if (
      error instanceof ResourceError &&
      (error.status === 400 || error.status === 404)
    ) {
      notFound();
    }

    throw error;
  }

  const { resource, bookings } = availability;

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <Link
            href="/resources"
            className="text-sm text-blue-600 underline"
          >
            Back to resources
          </Link>

          <h1 className="mt-3 text-3xl font-bold">
            {resource.name}
          </h1>
        </header>

        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">Details</h2>

          <p className="mt-4">
            Location: {resource.location}
          </p>

          <p className="mt-2">
            Status: {resource.status}
          </p>

          <p className="mt-2">
            {resource.requires_approval
              ? "Bookings require Admin approval."
              : "Bookings are confirmed immediately if available."}
          </p>

          {resource.description && (
            <p className="mt-4 whitespace-pre-wrap text-slate-600">
              {resource.description}
            </p>
          )}
        </section>

        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">
            Confirmed booking times
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Current and upcoming bookings, shown in Sri Lanka time.
          </p>

          {bookings.length === 0 ? (
            <p className="mt-4">
              No current or upcoming confirmed bookings.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th scope="col" className="p-3">Start</th>
                    <th scope="col" className="p-3">End</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-slate-100"
                    >
                      <td className="p-3">
                        {formatDate(booking.start_time)}
                      </td>
                      <td className="p-3">
                        {formatDate(booking.end_time)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-4 text-sm text-slate-600">
            Pending requests do not reserve time.
            Availability is checked again when booking or approving.
          </p>
        </section>

        {resource.status === ResourceStatus.ACTIVE ? (
          <CreateReservationForm
            resources={[
              {
                id: resource.id,
                name: resource.name,
                location: resource.location,
                requires_approval: resource.requires_approval,
              },
            ]}
          />
        ) : (
          <section className="rounded-xl bg-white p-6 shadow">
            <p>
              This resource is currently unavailable for new bookings.
            </p>
          </section>
        )}

        <Link
          href="/reservations"
          className="inline-block text-blue-600 underline"
        >
          View my reservations
        </Link>
      </div>
    </main>
  );
}