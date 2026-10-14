import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/server/security/session";
import { UserRole } from "@/models/user";

import { listCategories } from "@/features/categories/server/category-service";
import CreateCategoryForm from "@/features/categories/components/CreateCategoryForm";
import EditCategoryForm from "@/features/categories/components/EditCategoryForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/Auth/login");
  }

  if (user.role !== UserRole.ADMIN) {
    redirect("/dashboard");
  }

  const categories = await listCategories();

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

          <Link
            href="/admin/categories"
            aria-current="page"
            className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium"
          >
            Categories
          </Link>

          <Link href="/admin/resources" className={navLink}>
            Resources
          </Link>

          <Link href="/admin/approvals" className={navLink}>
            Booking approvals
          </Link>
        </nav>
      </aside>

      <main className="min-w-0 flex-1 p-6 lg:p-10">
        <div className="mx-auto max-w-6xl space-y-6">
          <header>
            <h1 className="text-3xl font-bold tracking-tight">
              Manage categories
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Organize meeting rooms and equipment into categories.
            </p>
          </header>

          <CreateCategoryForm />

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">
                Categories
              </h2>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {categories.length} total
              </span>
            </div>

            {categories.length === 0 ? (
              <p className="mt-6 rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">
                No categories yet. Add your first category above.
              </p>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th scope="col" className="p-3">
                        Name
                      </th>
                      <th scope="col" className="p-3">
                        Description
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
                    {categories.map((category) => (
                      <tr
                        key={category.id}
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >
                        <td className="p-3 align-top font-medium">
                          {category.name}
                        </td>

                        <td className="p-3 align-top text-slate-600">
                          {category.description ?? "—"}
                        </td>

                        <td className="p-3 align-top">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                              category.is_active
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {category.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="p-3 align-top">
                          <EditCategoryForm
                            category={{
                              id: category.id,
                              name: category.name,
                              description: category.description,
                              is_active: category.is_active,
                            }}
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