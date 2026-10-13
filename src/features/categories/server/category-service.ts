import "server-only";

import { requireAdmin } from "@/server/security/permissions";

import {
  findAllCategories,
  createCategory,
  updateCategory,
} from "@/server/repositories/category-repository";

import type { Category } from "@/models/category";

export class CategoryError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "CategoryError";
  }
}

export async function listCategories(): Promise<Category[]> {
  await requireAdmin();

  return findAllCategories();
}

export async function addCategory(
  input: unknown
): Promise<Category> {
  await requireAdmin();

  if (
    typeof input !== "object" ||
    input === null ||
    !("name" in input) ||
    typeof input.name !== "string"
  ) {
    throw new CategoryError(
      "Category name is required.",
      400
    );
  }

  const name = input.name.trim();

  if (name.length < 2 || name.length > 100) {
    throw new CategoryError(
      "Category name must contain 2–100 characters.",
      400
    );
  }

  let description: string | null = null;

  if (
    "description" in input &&
    input.description !== null &&
    input.description !== undefined
  ) {
    if (typeof input.description !== "string") {
      throw new CategoryError(
        "Description must be text.",
        400
      );
    }

    description = input.description.trim() || null;

    if (description && description.length > 1000) {
      throw new CategoryError(
        "Description must not exceed 1000 characters.",
        400
      );
    }
  }

  try {
    return await createCategory({
      name,
      description,
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      throw new CategoryError(
        "A category with this name already exists.",
        409
      );
    }

    throw error;
  }
}

export async function editCategory(
  id: string,
  input: unknown
): Promise<Category> {
  await requireAdmin();

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  ) {
    throw new CategoryError(
      "Invalid category ID.",
      400
    );
  }

  if (
    typeof input !== "object" ||
    input === null ||
    !("name" in input) ||
    typeof input.name !== "string" ||
    !("is_active" in input) ||
    typeof input.is_active !== "boolean"
  ) {
    throw new CategoryError(
      "Category name and active status are required.",
      400
    );
  }

  const name = input.name.trim();

  if (name.length < 2 || name.length > 100) {
    throw new CategoryError(
      "Category name must contain 2–100 characters.",
      400
    );
  }

  let description: string | null = null;

  if (
    "description" in input &&
    input.description !== null &&
    input.description !== undefined
  ) {
    if (typeof input.description !== "string") {
      throw new CategoryError(
        "Description must be text.",
        400
      );
    }

    description = input.description.trim() || null;

    if (description && description.length > 1000) {
      throw new CategoryError(
        "Description must not exceed 1000 characters.",
        400
      );
    }
  }

  try {
    const category = await updateCategory(id, {
      name,
      description,
      is_active: input.is_active,
    });

    if (!category) {
      throw new CategoryError(
        "Category not found.",
        404
      );
    }

    return category;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      throw new CategoryError(
        "A category with this name already exists.",
        409
      );
    }

    throw error;
  }
}