# OfficeReserve

OfficeReserve is a full-stack application for managing shared office resources and reservations. Employees can view resources, check confirmed booking times, and make reservations. Administrators manage categories, resources, and booking approvals.

## Technology Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- PostgreSQL
- node-postgres (`pg`)
- Swagger UI / OpenAPI
- Node.js crypto for password hashing

## Features

### Employees

- Register, log in, and log out
- Browse resources and view confirmed booking times
- Create reservations
- View their own reservations
- Cancel their own upcoming pending or confirmed reservations

### Administrators

- Manage resource categories
- Activate and deactivate categories
- Create and edit resources
- Set resource status and approval requirements
- Approve or reject pending reservations
- Use the employee booking features

## Booking Rules

- Only ACTIVE resources accept new reservations.
- Start time must be in the future.
- End time must be after start time.
- Resources requiring approval create PENDING reservations.
- Resources without approval requirements create CONFIRMED reservations.
- Only CONFIRMED reservations reserve time.
- Pending requests may overlap each other.
- Approval checks availability again before confirmation.
- Confirmed reservations for the same resource cannot overlap.
- Adjacent bookings, such as 10:00–11:00 and 11:00–12:00, are allowed.
- Cancellation retains the reservation record with CANCELLED status.
- Resource status changes do not automatically cancel existing bookings.

## Local Setup

### 1. Clone and install

```bash
git clone <YOUR_REPOSITORY_URL>
cd office-reserve
npm ci
```

Use a Node.js version compatible with the Next.js version in
`package.json`. The application was developed with PostgreSQL 18.4.

### 2. Create the database

Create a PostgreSQL database named:

```text
office_reserve
```

### 3. Apply database migrations

Run these SQL files against `office_reserve` in this order:

1. `database/migrations/001_initial_schema.sql`
2. `database/migrations/002_category_metadata.sql`
3. `database/migrations/003_create_sessions.sql`

You can execute them using pgAdmin's Query Tool.

Run each migration once. The initial migration uses the `btree_gist`
extension, so the database setup user must have permission to create it.

### 4. Configure environment variables

Create `.env` in the project root:

```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=office_reserve
DB_USER=postgres
DB_PASSWORD=your_postgres_password
```

Use your local database credentials. Do not commit `.env`.

### 5. Run the application

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Initial Administrator Setup

Register an account through `/Auth/register`. New accounts receive
the EMPLOYEE role.

For initial local setup, promote the intended administrator using SQL:

```sql
UPDATE users
SET role = 'ADMIN'
WHERE LOWER(email) = LOWER('your-admin-email@example.com')
RETURNING id, name, email, role;
```

Public registration does not allow users to choose the ADMIN role.

## Main Pages

| URL | Purpose |
| --- | --- |
| `/Auth/register` | Employee registration |
| `/Auth/login` | Login |
| `/dashboard` | Dashboard |
| `/resources` | Browse resources |
| `/resources/[id]` | Resource details, booked times, and booking form |
| `/reservations` | Booking form and personal reservations |
| `/admin/categories` | Category management |
| `/admin/resources` | Resource management |
| `/admin/approvals` | Pending booking reviews |
| `/api-docs` | Swagger API documentation |

## Architecture

- `src/app`: Pages, layouts, and HTTP route handlers
- `src/features`: Feature components, frontend API helpers, and services
- `src/models`: Database record types and enums
- `src/server/db`: PostgreSQL connection pool
- `src/server/repositories`: SQL queries
- `src/server/security`: Passwords, sessions, and permission checks
- `src/docs`: OpenAPI definition
- `database/migrations`: Database setup scripts

Route handlers process HTTP requests. Services enforce business rules.
Repositories execute parameterized SQL queries.

## Authentication and Authorization

- Passwords are hashed with scrypt and a random salt.
- Browser sessions use random tokens in HttpOnly cookies.
- Only session token hashes are stored in the database.
- Sessions expire after seven days.
- Protected requests check the current user's active status and role.
- Administrative operations enforce permissions on the server.
- Mutating authenticated API routes validate the request Origin.

For Postman testing, log in using the same host as subsequent requests,
retain the session cookie, and send:

```text
Origin: http://localhost:3000
```

## Reservation Reliability

Booking creation and review use database transactions and resource row
locks. A PostgreSQL exclusion constraint additionally prevents overlapping
CONFIRMED reservations.

Approval/rejection updates and review history are saved in the same
transaction.

## Time Handling

- Database timestamps use TIMESTAMPTZ.
- Booking forms interpret inputs in the device's local timezone.
- The frontend sends booking times as UTC ISO strings.
- Booking lists display times in Asia/Colombo.

## Validation Commands

```bash
npx tsc --noEmit
npx eslint .
npm run build
```

To run the production build locally:

```bash
npm start
```

## Manual Verification

- Registration and duplicate email handling
- Login, logout, and protected pages
- Employee restrictions on administrative endpoints
- Category and resource creation/editing
- Invalid booking times and unavailable resources
- Pending and instant-confirmation reservations
- Overlapping and adjacent bookings
- Approval, rejection, and review history
- Cancellation and reservation ownership checks

## Current Scope and Limitations

- Initial administrator promotion is performed through SQL.
- Availability is shown as a list of confirmed booking times.
- Email notifications, recurring bookings, and password recovery are
  outside the current scope.
- Public-deployment hardening, including authentication rate limiting,
  remains future work.