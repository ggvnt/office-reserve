const jsonRequest = (
  properties: Record<string, unknown>,
  required: string[]
) => ({
  required: true,
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties,
        required,
      },
    },
  },
});

export const openApiSpec = {
  openapi: "3.0.3",

  info: {
    title: "OfficeReserve API",
    version: "1.0.0",
    description: "Resource Reservation Management System API",
  },

  // Swagger page එක තිබෙන origin එකම භාවිත කරනවා.
  servers: [{ url: "/" }],

  tags: [
    { name: "Health" },
    { name: "Authentication" },
  ],

  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Check database connection",
        responses: {
          "200": { description: "Database connected" },
          "503": { description: "Database unavailable" },
        },
      },
    },

    "/api/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Create an employee account",

        requestBody: jsonRequest(
          {
            name: {
              type: "string",
              minLength: 2,
              maxLength: 100,
              example: "Test Employee",
            },
            email: {
              type: "string",
              format: "email",
              maxLength: 255,
              example: "swagger-test@example.com",
            },
            password: {
              type: "string",
              format: "password",
              minLength: 12,
              maxLength: 128,
              example: "TestPassword123!",
            },
          },
          ["name", "email", "password"]
        ),

        responses: {
          "201": { description: "Account created" },
          "400": { description: "Invalid input" },
          "409": { description: "Email already registered" },
          "500": { description: "Server error" },
        },
      },
    },

    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Log in and create a session",
        description:
          "A successful login sets an HttpOnly session cookie.",

        requestBody: jsonRequest(
          {
            email: {
              type: "string",
              format: "email",
              example: "swagger-test@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "TestPassword123!",
            },
          },
          ["email", "password"]
        ),

        responses: {
          "200": { description: "Logged in successfully" },
          "400": { description: "Invalid request" },
          "401": { description: "Invalid credentials" },
          "403": { description: "Request origin not allowed" },
          "500": { description: "Server error" },
        },
      },
    },
  },
};