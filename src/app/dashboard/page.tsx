import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/security/session";
import LogoutButton from "@/features/auth/components/LogoutButton";
import Link from "next/link";
import { UserRole } from "@/models/user";

export const runtime = "nodejs";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/Auth/login");
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8 text-slate-900">
      <section className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow">
        <div className="mt-6">
          <LogoutButton />
        </div>
        <h1 className="text-3xl font-bold">OfficeReserve Dashboard</h1>

        <p className="mt-4">Welcome, {user.name}!</p>
        <p className="mt-2 text-slate-600">Role: {user.role}</p>
      </section>
      {user.role === UserRole.ADMIN && (
        <>
          <div className="mt-6">
            <Link
              href="/admin/categories"
              className="font-medium text-blue-600 underline"
            >
              Manage categories
            </Link>
          </div>
          <div className="mt-6">
            <Link
              href="/admin/resources"
              className="font-medium text-blue-600 underline"
            >
              Manage resources
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
