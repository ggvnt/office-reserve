"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createResource } from "@/features/resources/api/resource-client";

interface CategoryOption {
  id: string;
  name: string;
}

interface CreateResourceFormProps {
  categories: CategoryOption[];
}

export default function CreateResourceForm({
  categories,
}: CreateResourceFormProps) {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    setMessage("");
    setIsSuccess(false);
    setIsSubmitting(true);

    try {
      await createResource({
        category_id: String(formData.get("category_id") ?? ""),
        name: String(formData.get("name") ?? ""),
        description: String(formData.get("description") ?? ""),
        location: String(formData.get("location") ?? ""),
        requires_approval:
          formData.get("requires_approval") === "on",
      });

      form.reset();
      setMessage("Resource created successfully.");
      setIsSuccess(true);
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to create resource."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (categories.length === 0) {
    return (
      <section className="rounded-xl bg-white p-6 shadow">
        <p>Add an active category before creating resources.</p>

        <Link
          href="/admin/categories"
          className="mt-3 inline-block text-blue-600 underline"
        >
          Manage categories
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <h2 className="text-xl font-semibold">Add resource</h2>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <fieldset disabled={isSubmitting} className="space-y-4">
          <div>
            <label
              htmlFor="resource-category"
              className="block text-sm font-medium"
            >
              Category
            </label>

            <select
              id="resource-category"
              name="category_id"
              required
              defaultValue=""
              className="mt-1 w-full rounded-lg border border-slate-300 p-3"
            >
              <option value="" disabled>
                Select a category
              </option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="resource-name"
              className="block text-sm font-medium"
            >
              Name
            </label>

            <input
              id="resource-name"
              name="name"
              type="text"
              required
              minLength={2}
              maxLength={150}
              placeholder="Meeting Room A"
              className="mt-1 w-full rounded-lg border border-slate-300 p-3"
            />
          </div>

          <div>
            <label
              htmlFor="resource-location"
              className="block text-sm font-medium"
            >
              Location
            </label>

            <input
              id="resource-location"
              name="location"
              type="text"
              required
              minLength={2}
              maxLength={150}
              placeholder="Floor 2"
              className="mt-1 w-full rounded-lg border border-slate-300 p-3"
            />
          </div>

          <div>
            <label
              htmlFor="resource-description"
              className="block text-sm font-medium"
            >
              Description (optional)
            </label>

            <textarea
              id="resource-description"
              name="description"
              rows={3}
              maxLength={1000}
              className="mt-1 w-full rounded-lg border border-slate-300 p-3"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              name="requires_approval"
              type="checkbox"
              defaultChecked
            />
            Requires Admin approval for bookings
          </label>
        </fieldset>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? "Saving…" : "Add resource"}
        </button>
      </form>

      <p
        role="status"
        className={`mt-4 text-sm ${
          isSuccess ? "text-green-700" : "text-red-700"
        }`}
      >
        {message}
      </p>
    </section>
  );
}