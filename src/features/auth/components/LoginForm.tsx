"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { loginUser as sendLoginRequest } from "../../../app/api/auth/api/auth-client";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    setMessage("");
    setIsSuccess(false);
    setIsSubmitting(true);

    try {
      const result = await sendLoginRequest({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      });

      setMessage(result.message);
      setIsSuccess(result.success);

      if (result.success) {
        form.reset();
        router.replace("/dashboard");
        router.refresh();
      }
    } catch {
      setMessage("Unable to log in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="w-full max-w-md rounded-xl bg-white p-8 text-slate-900 shadow">
      <h1 className="text-2xl font-bold">Welcome back</h1>

      <p className="mt-2 text-sm text-slate-600">Log in to OfficeReserve.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            maxLength={255}
            className="mt-1 w-full rounded-lg border border-slate-300 p-3"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={12}
            maxLength={128}
            className="mt-1 w-full rounded-lg border border-slate-300 p-3"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-blue-600 p-3 font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? "Logging in…" : "Log in"}
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

      <p className="mt-4 text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/Auth/register"
          className="font-medium text-blue-600 underline"
        >
          Register
        </Link>
      </p>
    </section>
  );
}
