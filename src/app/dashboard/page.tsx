import Link from "next/link";
import { redirect } from "next/navigation";

import { UserRole } from "@/models/user";
import { getCurrentUser } from "@/server/security/session";
import LogoutButton from "@/features/auth/components/LogoutButton";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bookingActions = [
  {
    href: "/resources",
    symbol: "▦",
    title: "Explore resources",
    description: "Find meeting rooms and equipment, and check booked times.",
    action: "Browse resources",
    color: "bg-blue-50 text-blue-600",
  },
  {
    href: "/reservations",
    symbol: "↗",
    title: "Your reservations",
    description:
      "Book a resource, track approvals, or cancel an upcoming booking.",
    action: "Manage bookings",
    color: "bg-emerald-50 text-emerald-700",
  },
];

const adminActions = [
  {
    href: "/admin/categories",
    symbol: "≡",
    title: "Categories",
    description: "Organize resources into categories and manage their status.",
    action: "Manage categories",
    color: "bg-violet-50 text-violet-600",
  },
  {
    href: "/admin/resources",
    symbol: "▦",
    title: "Resources",
    description:
      "Add spaces and equipment, edit details, and set booking rules.",
    action: "Manage resources",
    color: "bg-blue-50 text-blue-600",
  },
  {
    href: "/admin/approvals",
    symbol: "✓",
    title: "Booking approvals",
    description: "Review pending requests and approve or reject reservations.",
    action: "Review requests",
    color: "bg-amber-50 text-amber-700",
  },
];

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/Auth/login");
  }

  const isAdmin = user.role === UserRole.ADMIN;
  const initials =
    user.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "U";

  const navLink =
    "rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
      {/* left Navigation bar */}
      <aside className="bg-slate-950 px-5 py-6 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col">
        <Link href="/dashboard" className="flex items-center gap-3 px-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <rect x="4" y="5" width="16" height="16" rx="3" />
              <path d="M8 3v4M16 3v4M4 10h16m-11 5 2 2 4-4" />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-tight">
            Office<span className="text-blue-400">Reserve</span>
          </span>
        </Link>

        <nav
          aria-label="Dashboard navigation"
          className="mt-8 flex flex-col gap-1"
        >
          <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Workspace
          </p>

          <Link
            href="/dashboard"
            aria-current="page"
            className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white"
          >
            Overview
          </Link>

          <Link href="/resources" className={navLink}>
            Browse resources
          </Link>

          <Link href="/reservations" className={navLink}>
            My reservations
          </Link>

          {isAdmin && (
            <>
              <p className="mb-2 mt-6 px-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
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

        <div className="mt-8 border-t border-white/10 px-3 pt-5 lg:mt-auto">
          <p className="text-sm font-medium">
            {isAdmin ? "Administrator workspace" : "Employee workspace"}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Shared spaces. Organized schedules.
          </p>
        </div>
      </aside>

      {/* Main content area */}
      <main className="min-w-0 flex-1">
        {/* header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5 lg:px-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Workspace
            </p>
            <h1 className="mt-1 text-xl font-bold tracking-tight">Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700"
              >
                {initials}
              </span>

              <div className="hidden sm:block">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-slate-500">
                  {isAdmin ? "Admin" : "Employee"}
                </p>
              </div>
            </div>

            <LogoutButton />
          </div>
        </header>

        <div className="mx-auto max-w-9xl space-y-9 p-6 lg:p-10">
          {/* welcome board */}
          <section className="relative isolate overflow-hidden rounded-3xl bg-slate-900 px-6 py-10 text-white shadow-lg sm:px-10 width-full">
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-cover bg-center"
              // style={{
              //   backgroundImage: "url('/images/office-background.png')",
              // }}
            />

            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/35"
            />

            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">
                Your workspace, organized
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome back, {user.name}.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-200 sm:text-base">
                Find the right space, reserve your time, and keep your next
                meeting on track.
              </p>

              <Link
                href="/reservations"
                className="mt-6 inline-flex items-center gap-3 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Make a reservation
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </section>
          <section aria-labelledby="bookings-heading">
            <div className="mb-5">
              <h2
                id="bookings-heading"
                className="text-xl font-bold tracking-tight"
              >
                Plan your workday
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Everything you need to find and book a resource.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {bookingActions.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 motion-reduce:transform-none"
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${item.color}`}
                  >
                    {item.symbol}
                  </span>

                  <h3 className="mt-5 text-lg font-bold">{item.title}</h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>

                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                    {item.action}
                    <span
                      aria-hidden="true"
                      className="transition group-hover:translate-x-1 motion-reduce:transform-none"
                    >
                      →
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
          {isAdmin && (
            <section aria-labelledby="admin-heading">
              <div className="mb-5">
                <h2
                  id="admin-heading"
                  className="text-xl font-bold tracking-tight"
                >
                  Administration
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Manage your resources and coordinate booking requests.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {adminActions.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 motion-reduce:transform-none"
                  >
                    <span
                      aria-hidden="true"
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${item.color}`}
                    >
                      {item.symbol}
                    </span>

                    <h3 className="mt-5 text-lg font-bold">{item.title}</h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>

                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                      {item.action}
                      <span aria-hidden="true">→</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
          <footer className="border-t border-slate-200 pt-5 text-xs text-slate-500">
            OfficeReserve · Meeting rooms and shared equipment, in one place.
          </footer>
        </div>
      </main>
    </div>
  );
}
