import "server-only";

import { db } from "@/server/db/pool";
import {
  ResourceStatus,
  type Resource,
} from "@/models/resource";

interface CreateResourceInput {
  category_id: string;
  name: string;
  description: string | null;
  location: string;
  requires_approval: boolean;
}

interface UpdateResourceInput {
  category_id: string;
  name: string;
  description: string | null;
  location: string;
  status: ResourceStatus;
  requires_approval: boolean;
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
       category_id, name, description, location,
       status, requires_approval
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

export async function updateResource(
  id: string,
  input: UpdateResourceInput
): Promise<Resource | null> {
  const result = await db.query<Resource>(
    `UPDATE resources
     SET category_id = $1,
         name = $2,
         description = $3,
         location = $4,
         status = $5,
         requires_approval = $6
     WHERE id = $7
     RETURNING id, category_id, name, description, location,
               status, requires_approval, created_at, updated_at`,
    [
      input.category_id,
      input.name,
      input.description,
      input.location,
      input.status,
      input.requires_approval,
      id,
    ]
  );

  return result.rows[0] ?? null;
}