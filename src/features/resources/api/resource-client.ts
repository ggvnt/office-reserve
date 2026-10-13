import type { ResourceStatus } from "@/models/resource";

interface CreateResourceInput {
  category_id: string;
  name: string;
  description: string;
  location: string;
  requires_approval: boolean;
}
interface UpdateResourceInput {
  category_id: string;
  name: string;
  description: string;
  location: string;
  status: ResourceStatus;
  requires_approval: boolean;
}

export async function createResource(
  input: CreateResourceInput
): Promise<void> {
  const response = await fetch("/api/resources", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify(input),
  });

  const data: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : "Unable to create resource.";

    throw new Error(message);
  }
}

export async function updateResource(
  id: string,
  input: UpdateResourceInput
): Promise<void> {
  const response = await fetch(
    `/api/resources/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify(input),
    }
  );

  const data: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : "Unable to update resource.";

    throw new Error(message);
  }
}