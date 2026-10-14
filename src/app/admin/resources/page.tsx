import Link from "next/link";
import { redirect } from "next/navigation";

import { UserRole } from "@/models/user";
import { getCurrentUser } from "@/server/security/session";

import { listCategories } from "@/features/categories/server/category-service";
import { listResources } from "@/features/resources/server/resource-service";

import CreateResourceForm from "@/features/resources/components/CreateResourceForm";
import EditResourceForm from "@/features/resources/components/EditResourceForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  MAINTENANCE: "bg-amber-50 text-amber-700",
  INACTIVE: "bg-slate-100 text-slate-600",
};

export default async function AdminResourcesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/Auth/login");
  }

  if (user.role !== UserRole.ADMIN) {
    redirect("/dashboard");
  }

  const [categories, resources] = await Promise.all([
    listCategories(),
    listResources(),
  ]);

  const activeCategories = categories
    .filter((category) => category.is_active)
    .map((category) => ({
      id: category.id,
      name: category.name,
    }));

  const editCategories = categories.map((category) => ({
    id: category.id,
    name: category.name,
    is_active: category.is_active,
  }));

  const categoryNames = new Map(
    categories.map((category) => [category.id, category.name])
  );

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

          <Link
            href="/admin/resources"
            aria-current="page"
            className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium"
          >
            Resources
          </Link>

          <Link href="/admin/approvals" className={navLink}>
            Booking approvals
          </Link>
        </nav>
      </aside>

      <main className="min-w-0 flex-1 p-6 lg:p-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <header>
            <h1 className="text-3xl font-bold tracking-tight">
              Manage resources
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Add rooms and equipment, update details, and manage booking rules.
            </p>
          </header>

          <CreateResourceForm categories={activeCategories} />

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">
                Resources
              </h2>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {resources.length} total
              </span>
            </div>

            {resources.length === 0 ? (
              <p className="mt-6 rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">
                No resources yet. Add your first resource above.
              </p>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th scope="col" className="p-3">Name</th>
                      <th scope="col" className="p-3">Category</th>
                      <th scope="col" className="p-3">Location</th>
                      <th scope="col" className="p-3">Status</th>
                      <th scope="col" className="p-3">Approval</th>
                      <th scope="col" className="p-3">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {resources.map((resource) => (
                      <tr
                        key={resource.id}
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >
                        <td className="p-3 align-top font-medium">
                          {resource.name}
                        </td>

                        <td className="p-3 align-top text-slate-600">
                          {categoryNames.get(resource.category_id) ?? "—"}
                        </td>

                        <td className="p-3 align-top text-slate-600">
                          {resource.location}
                        </td>

                        <td className="p-3 align-top">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                              statusStyles[resource.status] ??
                              "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {resource.status}
                          </span>
                        </td>

                        <td className="p-3 align-top text-slate-600">
                          {resource.requires_approval
                            ? "Required"
                            : "Not required"}
                        </td>

                        <td className="p-3 align-top">
                          <EditResourceForm
                            resource={{
                              id: resource.id,
                              category_id: resource.category_id,
                              name: resource.name,
                              description: resource.description,
                              location: resource.location,
                              status: resource.status,
                              requires_approval: resource.requires_approval,
                            }}
                            categories={editCategories}
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