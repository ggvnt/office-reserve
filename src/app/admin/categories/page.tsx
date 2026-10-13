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

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <Link href="/dashboard" className="text-sm text-blue-600 underline">
            Back to dashboard
          </Link>

          <h1 className="mt-3 text-3xl font-bold">Manage categories</h1>
        </header>

        <CreateCategoryForm />

        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">Categories</h2>

          {categories.length === 0 ? (
            <p className="mt-4 text-slate-600">
              No categories yet. Add your first category above.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th scope="col" className="p-3">
                      Name
                    </th>
                    <th scope="col" className="p-3">
                      Description
                    </th>
                    <th scope="col" className="p-3">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="border-b border-slate-100">
                      <td className="p-3 font-medium">{category.name}</td>

                      <td className="p-3">{category.description ?? "—"}</td>

                      <td className="p-3">
                        {category.is_active ? "Active" : "Inactive"}
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
  );
}
