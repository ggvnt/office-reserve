"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateCategory } from "@/features/categories/api/category-client";

interface EditableCategory {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

interface EditCategoryFormProps {
  category: EditableCategory;
}

export default function EditCategoryForm({
  category,
}: EditCategoryFormProps) {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    setMessage("");
    setIsSuccess(false);
    setIsSubmitting(true);

    try {
      await updateCategory(category.id, {
        name: String(formData.get("name") ?? ""),
        description: String(formData.get("description") ?? ""),
        is_active: formData.get("is_active") === "on",
      });

      setMessage("Category updated successfully.");
      setIsSuccess(true);
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to update category."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function openEditor() {
    setMessage("");
    setIsSuccess(false);
    setIsEditing(true);
  }

  return (
    <div className="min-w-64">
      {!isEditing ? (
        <button
          type="button"
          onClick={openEditor}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          Edit
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label
              htmlFor={`name-${category.id}`}
              className="block text-sm font-medium"
            >
              Name
            </label>

            <input
              id={`name-${category.id}`}
              name="name"
              type="text"
              defaultValue={category.name}
              required
              minLength={2}
              maxLength={100}
              disabled={isSubmitting}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2"
            />
          </div>

          <div>
            <label
              htmlFor={`description-${category.id}`}
              className="block text-sm font-medium"
            >
              Description
            </label>

            <textarea
              id={`description-${category.id}`}
              name="description"
              defaultValue={category.description ?? ""}
              maxLength={1000}
              rows={3}
              disabled={isSubmitting}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              name="is_active"
              type="checkbox"
              defaultChecked={category.is_active}
              disabled={isSubmitting}
            />
            Active
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {isSubmitting ? "Saving…" : "Save"}
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setIsEditing(false);
                setMessage("");
              }}
              className="rounded-lg border border-slate-300 px-4 py-2 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <p
        role="status"
        className={`mt-2 text-sm ${
          isSuccess ? "text-green-700" : "text-red-700"
        }`}
      >
        {message}
      </p>
    </div>
  );
}