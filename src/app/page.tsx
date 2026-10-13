import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100 p-6 text-slate-900">
      <h1 className="text-4xl font-bold">OfficeReserve</h1>

      <p className="text-center text-lg">
        Meeting Room & Equipment Booking System
      </p>

      <Link
        href="/Auth/register"
        className="rounded-lg bg-blue-600 px-6 py-3 text-white"
      >
        Create an account
      </Link>
    </main>
  );
}