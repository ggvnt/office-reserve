import Link from "next/link";

export default function HomePage() {
  return (
    <main
      className="flex min-h-screen flex-col items-start justify-center gap-4 bg-cover bg-center px-6 text-slate-900 md:px-20"
      style={{
        backgroundImage: "url('/images/office-background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1 className="text-9xl  font-bold  -ml-8 sha">OfficeReserve</h1>

      <p
        className="text-center text-3xl text-black italic"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Meeting Room & Equipment Booking System
      </p>

      <Link
        href="/Auth/register"
        className="rounded-2xl text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-base text-lg
         px-10 py-4 text-center leading-5"
      >
        Create an account
      </Link>
    </main>
  );
}
