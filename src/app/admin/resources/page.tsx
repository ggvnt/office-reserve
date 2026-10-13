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

  const categoryNames = new Map(
    categories.map((category) => [category.id, category.name]),
  );

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <Link href="/dashboard" className="text-sm text-blue-600 underline">
            Back to dashboard
          </Link>

          <h1 className="mt-3 text-3xl font-bold">Manage resources</h1>
        </header>

        <CreateResourceForm categories={activeCategories} />

        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">Resources</h2>

          {resources.length === 0 ? (
            <p className="mt-4 text-slate-600">No resources yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th scope="col" className="p-3">
                      Name
                    </th>
                    <th scope="col" className="p-3">
                      Category
                    </th>
                    <th scope="col" className="p-3">
                      Location
                    </th>
                    <th scope="col" className="p-3">
                      Status
                    </th>
                    <th scope="col" className="p-3">
                      Approval
                    </th>
                    <th scope="col" className="p-3">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {resources.map((resource) => (
                    <tr key={resource.id} className="border-b border-slate-100">
                      <td className="p-3 font-medium">{resource.name}</td>
                      <td className="p-3">
                        {categoryNames.get(resource.category_id) ?? "—"}
                      </td>
                      <td className="p-3">{resource.location}</td>
                      <td className="p-3">{resource.status}</td>
                      <td className="p-3">
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
                          categories={categories.map((category) => ({
                            id: category.id,
                            name: category.name,
                            is_active: category.is_active,
                          }))}
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
