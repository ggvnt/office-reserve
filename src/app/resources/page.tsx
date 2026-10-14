import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/server/security/session";
import { listResources } from "@/features/resources/server/resource-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/Auth/login");
  }

  const resources = await listResources();

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <Link
            href="/dashboard"
            className="text-sm text-blue-600 underline"
          >
            Back to dashboard
          </Link>

          <h1 className="mt-3 text-3xl font-bold">
            Browse resources
          </h1>
        </header>

        {resources.length === 0 ? (
          <p className="rounded-xl bg-white p-6 shadow">
            No resources have been added yet.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <article
                key={resource.id}
                className="rounded-xl bg-white p-6 shadow"
              >
                <h2 className="text-xl font-semibold">
                  {resource.name}
                </h2>

                <p className="mt-2 text-slate-600">
                  {resource.location}
                </p>

                <p className="mt-3 text-sm">
                  Status: {resource.status}
                </p>

                <p className="mt-2 text-sm">
                  {resource.requires_approval
                    ? "Bookings require Admin approval."
                    : "Bookings are confirmed immediately if available."}
                </p>

                <Link
                  href={`/resources/${resource.id}`}
                  className="mt-4 inline-block font-medium text-blue-600 underline"
                >
                  View details and booked times
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}