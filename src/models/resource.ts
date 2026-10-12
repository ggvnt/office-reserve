export enum ResourceStatus {
  ACTIVE = "ACTIVE",
  MAINTENANCE = "MAINTENANCE",
  INACTIVE = "INACTIVE",
}

export interface Resource {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  location: string;
  status: ResourceStatus;
  requires_approval: boolean;
  created_at: Date;
  updated_at: Date;
}