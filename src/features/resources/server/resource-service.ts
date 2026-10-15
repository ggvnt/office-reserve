import "server-only";

import { requireUser, requireAdmin } from "@/server/security/permissions";

import {
  findAllResources,
  findResourceById,
  createResource,
  updateResource,
} from "@/server/repositories/resource-repository";

import {
  findUpcomingResourceBookings,
  type ResourceBooking,
} from "@/server/repositories/reservation-repository";

import { findCategoryById } from "@/server/repositories/category-repository";

import { ResourceStatus, type Resource } from "@/models/resource";

export class ResourceError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ResourceError";
  }
}

export async function listResources(): Promise<Resource[]> {
  await requireUser();

  return findAllResources();
}

export async function addResource(input: unknown): Promise<Resource> {
  await requireAdmin();

  if (
    typeof input !== "object" ||
    input === null ||
    !("category_id" in input) ||
    typeof input.category_id !== "string" ||
    !("name" in input) ||
    typeof input.name !== "string" ||
    !("location" in input) ||
    typeof input.location !== "string" ||
    !("requires_approval" in input) ||
    typeof input.requires_approval !== "boolean"
  ) {
    throw new ResourceError(
      "Category, name, location and approval setting are required.",
      400,
    );
  }

  const categoryId = input.category_id.trim();
  const name = input.name.trim();
  const location = input.location.trim();

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      categoryId,
    )
  ) {
    throw new ResourceError("Invalid category ID.", 400);
  }

  if (name.length < 2 || name.length > 150) {
    throw new ResourceError(
      "Resource name must contain 2–150 characters.",
      400,
    );
  }

  if (location.length < 2 || location.length > 150) {
    throw new ResourceError("Location must contain 2–150 characters.", 400);
  }

  let description: string | null = null;

  if (
    "description" in input &&
    input.description !== null &&
    input.description !== undefined
  ) {
    if (typeof input.description !== "string") {
      throw new ResourceError("Description must be text.", 400);
    }

    description = input.description.trim() || null;

    if (description && description.length > 1000) {
      throw new ResourceError(
        "Description must not exceed 1000 characters.",
        400,
      );
    }
  }

  const category = await findCategoryById(categoryId);

  if (!category) {
    throw new ResourceError("Category not found.", 404);
  }

  if (!category.is_active) {
    throw new ResourceError("Select an active category.", 400);
  }

  return createResource({
    category_id: category.id,
    name,
    description,
    location,
    requires_approval: input.requires_approval,
  });
}

export async function editResource(
  id: string,
  input: unknown,
): Promise<Resource> {
  await requireAdmin();

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(id)) {
    throw new ResourceError("Invalid resource ID.", 400);
  }

  if (
    typeof input !== "object" ||
    input === null ||
    !("category_id" in input) ||
    typeof input.category_id !== "string" ||
    !("name" in input) ||
    typeof input.name !== "string" ||
    !("location" in input) ||
    typeof input.location !== "string" ||
    !("status" in input) ||
    typeof input.status !== "string" ||
    !("requires_approval" in input) ||
    typeof input.requires_approval !== "boolean"
  ) {
    throw new ResourceError(
      "Category, name, location, status and approval setting are required.",
      400,
    );
  }

  const categoryId = input.category_id.trim();
  const name = input.name.trim();
  const location = input.location.trim();

  if (!uuidPattern.test(categoryId)) {
    throw new ResourceError("Invalid category ID.", 400);
  }

  if (name.length < 2 || name.length > 150) {
    throw new ResourceError(
      "Resource name must contain 2–150 characters.",
      400,
    );
  }

  if (location.length < 2 || location.length > 150) {
    throw new ResourceError("Location must contain 2–150 characters.", 400);
  }

  let status: ResourceStatus;

  switch (input.status) {
    case ResourceStatus.ACTIVE:
      status = ResourceStatus.ACTIVE;
      break;
    case ResourceStatus.MAINTENANCE:
      status = ResourceStatus.MAINTENANCE;
      break;
    case ResourceStatus.INACTIVE:
      status = ResourceStatus.INACTIVE;
      break;
    default:
      throw new ResourceError("Invalid resource status.", 400);
  }

  let description: string | null = null;

  if (
    "description" in input &&
    input.description !== null &&
    input.description !== undefined
  ) {
    if (typeof input.description !== "string") {
      throw new ResourceError("Description must be text.", 400);
    }

    description = input.description.trim() || null;

    if (description && description.length > 1000) {
      throw new ResourceError(
        "Description must not exceed 1000 characters.",
        400,
      );
    }
  }

  const existingResource = await findResourceById(id);

  if (!existingResource) {
    throw new ResourceError("Resource not found.", 404);
  }

  const category = await findCategoryById(categoryId);

  if (!category) {
    throw new ResourceError("Category not found.", 404);
  }

  // If the category is being changed, ensure the new category is active.
  if (category.id !== existingResource.category_id && !category.is_active) {
    throw new ResourceError(
      "Select an active category when changing categories.",
      400,
    );
  }

  const resource = await updateResource(id, {
    category_id: category.id,
    name,
    description,
    location,
    status,
    requires_approval: input.requires_approval,
  });

  if (!resource) {
    throw new ResourceError("Resource not found.", 404);
  }

  return resource;
}

export interface ResourceAvailability {
  resource: Resource;
  bookings: ResourceBooking[];
}

export async function getResourceAvailability(
  id: string
): Promise<ResourceAvailability> {
  await requireUser();

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(id)) {
    throw new ResourceError("Invalid resource ID.", 400);
  }

  const resource = await findResourceById(id);

  if (!resource) {
    throw new ResourceError("Resource not found.", 404);
  }

  const bookings = await findUpcomingResourceBookings(id);

  return {
    resource,
    bookings,
  };
}
