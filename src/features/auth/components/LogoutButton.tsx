"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logoutUser } from "../../../app/api/auth/api/auth-client";

export default function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setIsSubmitting(true);
    setError("");

    try {
      await logoutUser();

      router.replace("/Auth/login");
      router.refresh();
    } catch {
      setError("Unable to log out. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isSubmitting}
        className="rounded-lg bg-red-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? "Logging out…" : "Log out"}
      </button>

      <p role="status" className="mt-2 text-sm text-red-700">
        {error}
      </p>
    </div>
  );
}