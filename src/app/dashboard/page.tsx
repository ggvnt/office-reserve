import Link from "next/link";
import { redirect } from "next/navigation";

import { UserRole } from "@/models/user";
import { getCurrentUser } from "@/server/security/session";
import LogoutButton from "@/features/auth/components/LogoutButton";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/Auth/login");
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-xl bg-white p-6 shadow">
          <h1 className="text-3xl font-bold">
            OfficeReserve Dashboard
          </h1>

          <p className="mt-3">Welcome, {user.name}!</p>
          <p className="mt-1 text-sm text-slate-600">
            Role: {user.role}
          </p>
        </header>

        {/* Admin සහ Employee දෙදෙනාටම */}
        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">
            Bookings
          </h2>

          <nav className="mt-4 flex flex-col gap-3">
            <Link
              href="/resources"
              className="text-blue-600 underline"
            >
              Browse resources and booked times
            </Link>

            <Link
              href="/reservations"
              className="text-blue-600 underline"
            >
              Book a resource / My reservations
            </Link>
          </nav>
        </section>

        {/* Adminට පමණයි */}
        {user.role === UserRole.ADMIN && (
          <section className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold">
              Administration
            </h2>

            <nav className="mt-4 flex flex-col gap-3">
              <Link
                href="/admin/categories"
                className="text-blue-600 underline"
              >
                Manage categories
              </Link>

              <Link
                href="/admin/resources"
                className="text-blue-600 underline"
              >
                Manage resources
              </Link>

              <Link
                href="/admin/approvals"
                className="text-blue-600 underline"
              >
                Booking approvals
              </Link>
            </nav>
          </section>
        )}

        <LogoutButton />
      </div>
    </main>
  );
}