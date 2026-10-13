import {
  listCategories,
  addCategory,
  CategoryError,
} from "@/features/categories/server/category-service";

import {
  AuthorizationError,
} from "@/server/security/permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function handleError(error: unknown): Response {
  if (
    error instanceof CategoryError ||
    error instanceof AuthorizationError
  ) {
    return Response.json(
      { message: error.message },
      { status: error.status }
    );
  }

  console.error("Categories request failed:", error);

  return Response.json(
    { message: "Unable to process the request." },
    { status: 500 }
  );
}

export async function GET() {
  try {
    const categories = await listCategories();

    return Response.json(
      { categories },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");

  if (origin !== new URL(request.url).origin) {
    return Response.json(
      { message: "Request origin is not allowed." },
      { status: 403 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { message: "Invalid JSON request." },
      { status: 400 }
    );
  }

  try {
    const category = await addCategory(body);

    return Response.json(
      {
        message: "Category created successfully.",
        category,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}