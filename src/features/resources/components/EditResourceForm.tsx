"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { ResourceStatus } from "@/models/resource";
import { updateResource } from "@/features/resources/api/resource-client";

interface EditableResource {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  location: string;
  status: ResourceStatus;
  requires_approval: boolean;
}

interface CategoryOption {
  id: string;
  name: string;
  is_active: boolean;
}

interface Props {
  resource: EditableResource;
  categories: CategoryOption[];
}

export default function EditResourceForm({
  resource,
  categories,
}: Props) {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Active categories and the resource's current category (even if inactive) are available for selection.
  const availableCategories = categories.filter(
    (category) =>
      category.is_active || category.id === resource.category_id
  );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const status = String(formData.get("status") ?? "");

    if (
      status !== ResourceStatus.ACTIVE &&
      status !== ResourceStatus.MAINTENANCE &&
      status !== ResourceStatus.INACTIVE
    ) {
      setMessage("Select a valid status.");
      setIsSuccess(false);
      return;
    }

    setMessage("");
    setIsSuccess(false);
    setIsSubmitting(true);

    try {
      await updateResource(resource.id, {
        category_id: String(formData.get("category_id") ?? ""),
        name: String(formData.get("name") ?? ""),
        description: String(formData.get("description") ?? ""),
        location: String(formData.get("location") ?? ""),
        status,
        requires_approval:
          formData.get("requires_approval") === "on",
      });

      setMessage("Resource updated successfully.");
      setIsSuccess(true);
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to update resource."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-w-72">
      {!isEditing ? (
        <button
          type="button"
          onClick={() => {
            setMessage("");
            setIsSuccess(false);
            setIsEditing(true);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          Edit
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <fieldset
            disabled={isSubmitting}
            className="space-y-3"
          >
            <div>
              <label
                htmlFor={`category-${resource.id}`}
                className="block text-sm font-medium"
              >
                Category
              </label>

              <select
                id={`category-${resource.id}`}
                name="category_id"
                defaultValue={resource.category_id}
                required
                className="mt-1 w-full rounded-lg border border-slate-300 p-2"
              >
                {availableCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                    {!category.is_active ? " (Inactive)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={`name-${resource.id}`}
                className="block text-sm font-medium"
              >
                Name
              </label>

              <input
                id={`name-${resource.id}`}
                name="name"
                type="text"
                defaultValue={resource.name}
                required
                minLength={2}
                maxLength={150}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2"
              />
            </div>

            <div>
              <label
                htmlFor={`location-${resource.id}`}
                className="block text-sm font-medium"
              >
                Location
              </label>

              <input
                id={`location-${resource.id}`}
                name="location"
                type="text"
                defaultValue={resource.location}
                required
                minLength={2}
                maxLength={150}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2"
              />
            </div>

            <div>
              <label
                htmlFor={`description-${resource.id}`}
                className="block text-sm font-medium"
              >
                Description
              </label>

              <textarea
                id={`description-${resource.id}`}
                name="description"
                defaultValue={resource.description ?? ""}
                rows={3}
                maxLength={1000}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2"
              />
            </div>

            <div>
              <label
                htmlFor={`status-${resource.id}`}
                className="block text-sm font-medium"
              >
                Status
              </label>

              <select
                id={`status-${resource.id}`}
                name="status"
                defaultValue={resource.status}
                required
                className="mt-1 w-full rounded-lg border border-slate-300 p-2"
              >
                <option value={ResourceStatus.ACTIVE}>
                  Active
                </option>
                <option value={ResourceStatus.MAINTENANCE}>
                  Maintenance
                </option>
                <option value={ResourceStatus.INACTIVE}>
                  Inactive
                </option>
              </select>
            </div>

            <label className="flex items-center gap-2">
              <input
                name="requires_approval"
                type="checkbox"
                defaultChecked={resource.requires_approval}
              />
              Requires Admin approval
            </label>
          </fieldset>

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