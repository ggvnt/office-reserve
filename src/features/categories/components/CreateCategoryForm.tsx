"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createCategory } from "../api/category-client";

export default function CreateCategoryForm() {
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
      await createCategory({
        name: String(formData.get("name") ?? ""),
        description: String(formData.get("description") ?? ""),
      });

      form.reset();
      setMessage("Category created successfully.");
      setIsSuccess(true);
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to create category."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-xl bg-white p-6 text-slate-900 shadow">
      <h2 className="text-xl font-semibold">Add category</h2>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label
            htmlFor="category-name"
            className="block text-sm font-medium"
          >
            Name
          </label>

          <input
            id="category-name"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            placeholder="Meeting Rooms"
            className="mt-1 w-full rounded-lg border border-slate-300 p-3"
          />
        </div>

        <div>
          <label
            htmlFor="category-description"
            className="block text-sm font-medium"
          >
            Description (optional)
          </label>

          <textarea
            id="category-description"
            name="description"
            rows={3}
            maxLength={1000}
            className="mt-1 w-full rounded-lg border border-slate-300 p-3"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? "Saving…" : "Add category"}
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