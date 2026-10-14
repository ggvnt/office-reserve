import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/server/security/session";
import { listResources } from "@/features/resources/server/resource-service";
import { UserRole } from "@/models/user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  MAINTENANCE: "bg-amber-50 text-amber-700",
  INACTIVE: "bg-slate-100 text-slate-600",
};

export default async function ResourcesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/Auth/login");
  }

  const resources = await listResources();

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

          <Link
            href="/resources"
            aria-current="page"
            className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium"
          >
            Browse resources
          </Link>

          <Link href="/reservations" className={navLink}>
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
              Browse resources
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Explore meeting rooms and equipment, and check booked times.
            </p>
          </header>

          {resources.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
              <h2 className="text-lg font-semibold">
                No resources yet
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Resources will appear here once an administrator adds them.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {resources.map((resource) => (
                <article
                  key={resource.id}
                  className="flex flex-col rounded-xl border border-slate-200 bg-white p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold">
                      {resource.name}
                    </h2>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                        statusStyles[resource.status] ??
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {resource.status}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-slate-500">
                    Location: {resource.location}
                  </p>

                  {resource.description && (
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                      {resource.description}
                    </p>
                  )}

                  <p className="mb-5 mt-4 text-xs text-slate-500">
                    {resource.requires_approval
                      ? "Admin approval required"
                      : "Instant confirmation if available"}
                  </p>

                  <Link
                    href={`/resources/${resource.id}`}
                    className="mt-auto rounded-lg border border-blue-200 px-4 py-2.5 text-center text-sm font-medium text-blue-600 transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    View details and booked times
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}