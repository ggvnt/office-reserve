import {
  registerEmployee,
  RegistrationError,
} from "../../../../features/server/auth-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
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
    const user = await registerEmployee(body);

    return Response.json(
      {
        message: "Account created successfully.",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof RegistrationError) {
      return Response.json(
        { message: error.message },
        { status: error.status }
      );
    }

    console.error("Registration failed:", error);

    return Response.json(
      { message: "Unable to create account." },
      { status: 500 }
    );
  }
}