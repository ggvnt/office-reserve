import {
  editResource,
  ResourceError,
} from "@/features/resources/server/resource-service";

import {
  AuthorizationError,
} from "@/server/security/permissions";

export const runtime = "nodejs";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
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
    const { id } = await context.params;
    const resource = await editResource(id, body);

    return Response.json({
      message: "Resource updated successfully.",
      resource,
    });
  } catch (error) {
    if (
      error instanceof ResourceError ||
      error instanceof AuthorizationError
    ) {
      return Response.json(
        { message: error.message },
        { status: error.status }
      );
    }

    console.error("Resource update failed:", error);

    return Response.json(
      { message: "Unable to update resource." },
      { status: 500 }
    );
  }
}