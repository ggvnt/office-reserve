"use client";

import { useState, type FormEvent } from "react";
import { registerUser } from "../../../app/api/auth/api/auth-client";

export default function RegisterForm() {
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
      const result = await registerUser({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      });

      setMessage(result.message);
      setIsSuccess(result.success);

      if (result.success) {
        form.reset();
      }
    } catch {
      setMessage("Unable to complete registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="w-full max-w-md rounded-xl bg-white p-8 text-slate-900 shadow">
      <h1 className="text-2xl font-bold">Create an account</h1>

      <p className="mt-2 text-sm text-slate-600">
        Join OfficeReserve as an employee.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium"
          >
            Name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            className="mt-1 w-full rounded-lg border border-slate-300 p-3"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium"
          >
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={255}
            className="mt-1 w-full rounded-lg border border-slate-300 p-3"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium"
          >
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
            maxLength={128}
            aria-describedby="password-help"
            className="mt-1 w-full rounded-lg border border-slate-300 p-3"
          />

          <p
            id="password-help"
            className="mt-1 text-xs text-slate-600"
          >
            Use 12–128 characters.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-blue-600 p-3 font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? "Creating account…" : "Register"}
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