import { db } from "../../../server/db/pool";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.query("SELECT 1");
    return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
  } catch (error) {
    console.error("Database connection error:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Database connection failed",
      }),
      { status: 500 },
    );
  }
}
