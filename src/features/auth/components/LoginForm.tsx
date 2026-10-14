"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  loginUser as sendLoginRequest,
} from "../../../app/api/auth/api/auth-client";

export default function LoginForm() {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      const result = await sendLoginRequest({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      });

      setMessage(result.message);
      setIsSuccess(result.success);

      if (result.success) {
        form.reset();
        setShowPassword(false);
        router.replace("/dashboard");
        router.refresh();
      }
    } catch {
      setMessage("Unable to log in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60";

  return (
    <section className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/80 bg-white/95 text-slate-900 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
      <div className="h-1.5 bg-gradient-to-r from-blue-600 via-sky-400 to-blue-600" />

      <div className="p-6 sm:p-10">
        <Link
          href="/"
          className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <rect x="4" y="5" width="16" height="16" rx="3" />
              <path d="M8 3v4M16 3v4M4 10h16m-11 5 2 2 4-4" />
            </svg>
          </span>

          <span className="text-lg font-bold tracking-tight">
            Office<span className="text-blue-600">Reserve</span>
          </span>
        </Link>

        <header className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            Your workspace awaits
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome back
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Log in to book your next space and manage
            your reservations.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mt-8">
          <fieldset
            disabled={isSubmitting}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="text-sm font-semibold text-slate-700"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="you@example.com"
                required
                maxLength={255}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                  minLength={12}
                  maxLength={128}
                  className={`${inputClass} pr-20`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-controls="password"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-slate-500 transition hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none"
                  />
                  Logging in…
                </>
              ) : (
                <>
                  Log in
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </fieldset>

          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={
              message
                ? `mt-5 rounded-xl border p-4 text-sm leading-6 ${
                    isSuccess
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`
                : ""
            }
          >
            {message}
          </div>
        </form>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center">
          <p className="text-sm text-slate-500">
            New to OfficeReserve?{" "}
            <Link
              href="/Auth/register"
              className="font-semibold text-blue-600 underline-offset-4 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}