BEGIN;

-- UUID resource IDs සඳහා overlap constraint එකට අවශ්‍යයි.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Enums
CREATE TYPE user_role AS ENUM ('ADMIN', 'EMPLOYEE');

CREATE TYPE resource_status AS ENUM (
    'ACTIVE', 'MAINTENANCE', 'INACTIVE'
);

CREATE TYPE reservation_status AS ENUM (
    'PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED'
);

CREATE TYPE review_decision AS ENUM ('APPROVED', 'REJECTED');

-- 1. Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'EMPLOYEE',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX users_email_unique
    ON users (LOWER(email));

-- 2. Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE UNIQUE INDEX categories_name_unique
    ON categories (LOWER(name));

-- 3. Resources
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    location VARCHAR(150) NOT NULL,
    status resource_status NOT NULL DEFAULT 'ACTIVE',
    requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Reservations
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id),
    user_id UUID NOT NULL REFERENCES users(id),
    purpose TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status reservation_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_reservation_times
        CHECK (end_time > start_time),

    CONSTRAINT no_confirmed_booking_overlap
        EXCLUDE USING gist (
            resource_id WITH =,
            tstzrange(start_time, end_time, '[)') WITH &&
        )
        WHERE (status = 'CONFIRMED')
);

-- 5. Reservation Reviews
CREATE TABLE reservation_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID NOT NULL REFERENCES reservations(id),
    reviewer_id UUID NOT NULL REFERENCES users(id),
    decision review_decision NOT NULL,
    comment TEXT,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Foreign key lookup indexes
CREATE INDEX resources_category_idx ON resources(category_id);
CREATE INDEX reservations_resource_idx ON reservations(resource_id);
CREATE INDEX reservations_user_idx ON reservations(user_id);
CREATE INDEX reviews_reservation_idx
    ON reservation_reviews(reservation_id);
CREATE INDEX reviews_reviewer_idx
    ON reservation_reviews(reviewer_id);

-- updated_at 
CREATE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER resources_updated_at
BEFORE UPDATE ON resources
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER reservations_updated_at
BEFORE UPDATE ON reservations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;