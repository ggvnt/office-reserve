import "server-only";

import { db } from "@/server/db/pool";
import type { Category } from "@/models/category";
import {
  ResourceStatus,
  type Resource,
} from "@/models/resource";


interface CreateCategoryInput {
  name: string;
  description: string | null;
}
interface UpdateCategoryInput {
  name: string;
  description: string | null;
  is_active: boolean;
}

interface CreateResourceInput {
  category_id: string;
  name: string;
  description: string | null;
  location: string;
  requires_approval: boolean;
}

export async function createCategory(
  input: CreateCategoryInput
): Promise<Category> {
  const result = await db.query<Category>(
    `INSERT INTO categories (name, description)
     VALUES ($1, $2)
     RETURNING id, name, description,
               created_at, updated_at, is_active`,
    [input.name, input.description]
  );

  return result.rows[0];
}

export async function findAllCategories(): Promise<Category[]> {
  const result = await db.query<Category>(
    `SELECT id, name, description,
            created_at, updated_at, is_active
     FROM categories
     ORDER BY name ASC`
  );

  return result.rows;
}

export async function findCategoryById(
  id: string
): Promise<Category | null> {
  const result = await db.query<Category>(
    `SELECT id, name, description,
            created_at, updated_at, is_active
     FROM categories
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] ?? null;
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput
): Promise<Category | null> {
  const result = await db.query<Category>(
    `UPDATE categories
     SET name = $1,
         description = $2,
         is_active = $3
     WHERE id = $4
     RETURNING id, name, description,
               created_at, updated_at, is_active`,
    [
      input.name,
      input.description,
      input.is_active,
      id,
    ]
  );

  return result.rows[0] ?? null;
}

export async function findAllResources(): Promise<Resource[]> {
  const result = await db.query<Resource>(
    `SELECT id, category_id, name, description, location,
            status, requires_approval, created_at, updated_at
     FROM resources
     ORDER BY name ASC`
  );

  return result.rows;
}

export async function findResourceById(
  id: string
): Promise<Resource | null> {
  const result = await db.query<Resource>(
    `SELECT id, category_id, name, description, location,
            status, requires_approval, created_at, updated_at
     FROM resources
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] ?? null;
}

export async function createResource(
  input: CreateResourceInput
): Promise<Resource> {
  const result = await db.query<Resource>(
    `INSERT INTO resources (
       category_id,
       name,
       description,
       location,
       status,
       requires_approval
     )
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, category_id, name, description, location,
               status, requires_approval, created_at, updated_at`,
    [
      input.category_id,
      input.name,
      input.description,
      input.location,
      ResourceStatus.ACTIVE,
      input.requires_approval,
    ]
  );

  return result.rows[0];
}