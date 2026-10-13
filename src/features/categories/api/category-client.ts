interface CreateCategoryInput {
  name: string;
  description: string;
}

export async function createCategory(
  input: CreateCategoryInput
): Promise<void> {
  const response = await fetch("/api/categories", {
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
        : "Unable to create category.";

    throw new Error(message);
  }
}

interface UpdateCategoryInput {
  name: string;
  description: string;
  is_active: boolean;
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput
): Promise<void> {
  const response = await fetch(
    `/api/categories/${encodeURIComponent(id)}`,
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
        : "Unable to update category.";

    throw new Error(message);
  }
}