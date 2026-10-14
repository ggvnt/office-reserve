const jsonRequest = (
  properties: Record<string, unknown>,
  required: string[],
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

  servers: [{ url: "/" }],

  tags: [
    { name: "Health" },
    { name: "Authentication" },
    { name: "Categories" },
    { name: "Resources" },
    { name: "Reservations" },
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
          ["name", "email", "password"],
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
        description: "A successful login sets an HttpOnly session cookie.",

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
          ["email", "password"],
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

    "/api/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Log out and delete the current session",

        responses: {
          "200": { description: "Logged out successfully" },
          "403": { description: "Request origin not allowed" },
          "500": { description: "Server error" },
        },
      },
    },

    "/api/categories": {
      get: {
        tags: ["Categories"],
        summary: "List categories — Admin only",

        responses: {
          "200": { description: "Categories retrieved" },
          "401": { description: "Login required" },
          "403": { description: "Admin access required" },
          "500": { description: "Server error" },
        },
      },

      post: {
        tags: ["Categories"],
        summary: "Create a category — Admin only",

        requestBody: jsonRequest(
          {
            name: {
              type: "string",
              minLength: 2,
              maxLength: 100,
              example: "Meeting Rooms",
            },
            description: {
              type: "string",
              nullable: true,
              maxLength: 1000,
              example: "Rooms available for team meetings",
            },
          },
          ["name"],
        ),

        responses: {
          "201": { description: "Category created" },
          "400": { description: "Invalid input" },
          "401": { description: "Login required" },
          "403": { description: "Access denied" },
          "409": { description: "Category name already exists" },
          "500": { description: "Server error" },
        },
      },
    },

    "/api/categories/{id}": {
      put: {
        tags: ["Categories"],
        summary: "Update a category — Admin only",

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],

        requestBody: jsonRequest(
          {
            name: {
              type: "string",
              minLength: 2,
              maxLength: 100,
              example: "Conference Rooms",
            },
            description: {
              type: "string",
              nullable: true,
              maxLength: 1000,
              example: "Updated category description",
            },
            is_active: {
              type: "boolean",
              example: true,
            },
          },
          ["name", "is_active"],
        ),

        responses: {
          "200": { description: "Category updated" },
          "400": { description: "Invalid input" },
          "401": { description: "Login required" },
          "403": { description: "Access denied" },
          "404": { description: "Category not found" },
          "409": { description: "Category name already exists" },
          "500": { description: "Server error" },
        },
      },
    },

    "/api/resources": {
      get: {
        tags: ["Resources"],
        summary: "List resources — Login required",

        responses: {
          "200": { description: "Resources retrieved" },
          "401": { description: "Login required" },
          "500": { description: "Server error" },
        },
      },

      post: {
        tags: ["Resources"],
        summary: "Create a resource — Admin only",
        description:
          "Use an existing active category ID. New resources are created with ACTIVE status.",

        requestBody: jsonRequest(
          {
            category_id: {
              type: "string",
              format: "uuid",
              description:
                "Copy an active category ID from GET /api/categories.",
            },
            name: {
              type: "string",
              minLength: 2,
              maxLength: 150,
              example: "Meeting Room A",
            },
            description: {
              type: "string",
              nullable: true,
              maxLength: 1000,
              example: "Room for team meetings",
            },
            location: {
              type: "string",
              minLength: 2,
              maxLength: 150,
              example: "Floor 2",
            },
            requires_approval: {
              type: "boolean",
              example: true,
            },
          },
          ["category_id", "name", "location", "requires_approval"],
        ),

        responses: {
          "201": { description: "Resource created" },
          "400": {
            description: "Invalid input or inactive category",
          },
          "401": { description: "Login required" },
          "403": { description: "Access denied" },
          "404": { description: "Category not found" },
          "500": { description: "Server error" },
        },
      },
    },

    "/api/reservations": {
      get: {
        tags: ["Reservations"],
        summary: "List my reservations — Login required",

        responses: {
          "200": { description: "Your reservations retrieved" },
          "401": { description: "Login required" },
          "500": { description: "Server error" },
        },
      },

      post: {
        tags: ["Reservations"],
        summary: "Create a reservation — Login required",
        description:
          "Approval-required resources create PENDING reservations. Other resources create CONFIRMED reservations. Times must include a timezone.",

        requestBody: jsonRequest(
          {
            resource_id: {
              type: "string",
              format: "uuid",
              description:
                "Copy an ACTIVE resource ID from GET /api/resources.",
            },
            purpose: {
              type: "string",
              minLength: 3,
              maxLength: 1000,
              example: "Team planning meeting",
            },
            start_time: {
              type: "string",
              format: "date-time",
              example: "2026-10-15T10:00:00+05:30",
            },
            end_time: {
              type: "string",
              format: "date-time",
              example: "2026-10-15T11:00:00+05:30",
            },
          },
          ["resource_id", "purpose", "start_time", "end_time"],
        ),

        responses: {
          "201": { description: "Reservation created" },
          "400": { description: "Invalid input or booking times" },
          "401": { description: "Login required" },
          "403": { description: "Request origin not allowed" },
          "404": { description: "Resource not found" },
          "409": {
            description: "Resource unavailable or booking conflict",
          },
          "500": { description: "Server error" },
        },
      },
    },

    "/api/resources/{id}": {
      put: {
        tags: ["Resources"],
        summary: "Update a resource — Admin only",

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],

        requestBody: jsonRequest(
          {
            category_id: {
              type: "string",
              format: "uuid",
            },
            name: {
              type: "string",
              minLength: 2,
              maxLength: 150,
              example: "Meeting Room A",
            },
            description: {
              type: "string",
              nullable: true,
              maxLength: 1000,
              example: "Room for team meetings",
            },
            location: {
              type: "string",
              minLength: 2,
              maxLength: 150,
              example: "Floor 2",
            },
            status: {
              type: "string",
              enum: ["ACTIVE", "MAINTENANCE", "INACTIVE"],
              example: "MAINTENANCE",
            },
            requires_approval: {
              type: "boolean",
              example: true,
            },
          },
          ["category_id", "name", "location", "status", "requires_approval"],
        ),

        responses: {
          "200": { description: "Resource updated" },
          "400": { description: "Invalid input" },
          "401": { description: "Login required" },
          "403": { description: "Access denied" },
          "404": { description: "Resource or category not found" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/reservations/{id}/cancel": {
      post: {
        tags: ["Reservations"],
        summary: "Cancel my upcoming reservation",
        description:
          "Only your own future PENDING or CONFIRMED reservation can be cancelled.",

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],

        responses: {
          "200": { description: "Reservation cancelled" },
          "400": { description: "Invalid reservation ID" },
          "401": { description: "Login required" },
          "403": { description: "Request origin not allowed" },
          "409": {
            description: "Reservation not found or cannot be cancelled",
          },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/reservations/pending": {
      get: {
        tags: ["Reservations"],
        summary: "List pending reservations — Admin only",

        responses: {
          "200": { description: "Pending reservations retrieved" },
          "401": { description: "Login required" },
          "403": { description: "Admin access required" },
          "500": { description: "Server error" },
        },
      },
    },

    "/api/reservations/{id}/review": {
      post: {
        tags: ["Reservations"],
        summary: "Approve or reject a reservation — Admin only",

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],

        requestBody: jsonRequest(
          {
            decision: {
              type: "string",
              enum: ["APPROVED", "REJECTED"],
              example: "APPROVED",
            },
            comment: {
              type: "string",
              nullable: true,
              maxLength: 1000,
              example: "Approved for the team meeting",
            },
          },
          ["decision"],
        ),

        responses: {
          "200": { description: "Reservation reviewed" },
          "400": { description: "Invalid input" },
          "401": { description: "Login required" },
          "403": { description: "Access denied" },
          "404": { description: "Reservation or resource not found" },
          "409": {
            description:
              "Reservation is no longer pending, resource is unavailable, booking has started, or time conflicts",
          },
          "500": { description: "Server error" },
        },
      },
    },
  },
};
